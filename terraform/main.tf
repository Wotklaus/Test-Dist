provider "aws" {
  region = "us-east-1"
}

# VPC y subnets PRIMER BLOQUE OBLIGATORIO Y CORRECTO
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# AMI Amazon Linux 2 oficial
data "aws_ami" "amzn2" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Security group para el ALB
resource "aws_security_group" "alb_sg" {
  name   = "alb-sg"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security group para app (ASG): recibe HTTP del ALB y SSH abierto para práctica
resource "aws_security_group" "asg_sg" {
  name   = "asg-sg"
  vpc_id = data.aws_vpc.default.id

  ingress {
    description     = "HTTP desde ALB"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    description = "SSH desde cualquier lugar (laboratorio)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security group para la base de datos (da acceso solo desde ASG y SSH cualquiera)
resource "aws_security_group" "db_sg" {
  name   = "db-sg"
  vpc_id = data.aws_vpc.default.id

  ingress {
    description     = "Postgres desde ASG"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.asg_sg.id]
  }

  ingress {
    description = "SSH desde cualquier lugar"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 de PostgreSQL
resource "aws_instance" "db" {
  ami                         = data.aws_ami.amzn2.id
  instance_type               = "t2.micro"
  subnet_id                   = data.aws_subnets.public.ids[0]
  vpc_security_group_ids      = [aws_security_group.db_sg.id]
  associate_public_ip_address = true

  tags = {
    Name = "postgres-db"
  }

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    amazon-linux-extras install postgresql10 -y
    yum install postgresql-server -y
    postgresql-setup initdb
    systemctl start postgresql
    systemctl enable postgresql
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'abc123';"
    sudo -u postgres createdb pokemon
    echo "host all all 0.0.0.0/0 md5" >> /var/lib/pgsql/data/pg_hba.conf
    echo "listen_addresses = '*'" >> /var/lib/pgsql/data/postgresql.conf
    systemctl restart postgresql
  EOF
}

# LAUNCH TEMPLATE para el ASG/app (Dockeriza frontend y backend)
resource "aws_launch_template" "app_lt" {
  name_prefix   = "app-lt-"
  image_id      = data.aws_ami.amzn2.id
  instance_type = "t2.micro"

  network_interfaces {
    security_groups             = [aws_security_group.asg_sg.id]
    associate_public_ip_address = true
  }

  user_data = base64encode(<<-EOF
  #!/bin/bash
  yum update -y
  amazon-linux-extras install docker -y
  systemctl start docker
  systemctl enable docker
  usermod -aG docker ec2-user
  sleep 20
  docker network create mynet

  docker pull wotklaus86682/testdist-backend:latest
  docker pull wotklaus86682/testdist-frontend:latest

  docker run -d --name backend --network mynet \
    -e PGHOST=${aws_instance.db.private_ip} \
    -e PGUSER=postgres \
    -e PGPASSWORD=abc123 \
    -e PGDATABASE=pokemon \
    -e PGPORT=5432 \
    -p 8080:8080 \
    wotklaus86682/testdist-backend:latest

  docker run -d --name frontend --network mynet \
    -e REACT_APP_API_URL="http://backend:8080" \
    -p 80:80 \
    wotklaus86682/testdist-frontend:latest

  docker ps -a >> /var/log/cloud-init-output.log
  docker logs frontend >> /var/log/cloud-init-output.log 2>&1
  docker logs backend >> /var/log/cloud-init-output.log 2>&1
  echo "FINISHED USERDATA" >> /var/log/cloud-init-output.log
EOF
)
}

# ASG de la aplicación (fron/backend docker, MIN/MAX=2)
resource "aws_autoscaling_group" "app_asg" {
  name                = "app-asg"
  max_size            = 2
  min_size            = 2
  desired_capacity    = 2
  vpc_zone_identifier = data.aws_subnets.public.ids

  launch_template {
    id      = aws_launch_template.app_lt.id
    version = "$Latest"
  }

  health_check_type = "EC2"

  tag {
    key                 = "Name"
    value               = "asg-app-instance"
    propagate_at_launch = true
  }
}

# ALB, TG, LISTENER, Attachment del ASG
resource "aws_lb" "app_alb" {
  name               = "app-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = data.aws_subnets.public.ids
  security_groups    = [aws_security_group.alb_sg.id]
}

resource "aws_lb_target_group" "app_tg" {
  name        = "app-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_listener" "app_listener" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

resource "aws_autoscaling_attachment" "asg_alb" {
  autoscaling_group_name = aws_autoscaling_group.app_asg.id
  lb_target_group_arn    = aws_lb_target_group.app_tg.arn   # <-- CORRECTO
}

# OUTPUTS COMPLETOS
output "alb_dns" {
  description = "URL del load balancer"
  value       = aws_lb.app_alb.dns_name
}

output "alb_arn" {
  description = "ARN del load balancer"
  value       = aws_lb.app_alb.arn
}

output "db_instance_public_dns" {
  description = "DNS público de la EC2 DB (Postgres)"
  value       = aws_instance.db.public_dns
}

output "db_instance_public_ip" {
  description = "IP pública de la EC2 DB (Postgres)"
  value       = aws_instance.db.public_ip
}

output "db_instance_private_ip" {
  description = "IP privada (usada en app) de la EC2 DB"
  value       = aws_instance.db.private_ip
}

output "asg_name" {
  value = aws_autoscaling_group.app_asg.name
}

output "asg_launch_template_id" {
  value = aws_launch_template.app_lt.id
}