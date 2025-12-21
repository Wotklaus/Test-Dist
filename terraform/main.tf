# Proveedor AWS
provider "aws" {
  region = "us-east-1"  # Cambia a tu región preferida
}

# Security Group para la instancia de base de datos
resource "aws_security_group" "postgres_sg" {
  name        = "postgres-db-sg"
  description = "Security group para PostgreSQL en Docker"

  # Permitir SSH (puerto 22) - para conectarte y administrar
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # ⚠️ En producción, restringe a tu IP
  }

  # Permitir PostgreSQL (puerto 5432)
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # ⚠️ En producción, restringe a IPs específicas
  }

  # Permitir todo el tráfico saliente
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "PostgreSQL-DB-SecurityGroup"
  }
}

# Instancia EC2 para la base de datos
resource "aws_instance" "postgres_db" {
  ami           = "ami-0c55b159cbfafe1f0"  # Ubuntu 22.04 en us-east-1
  instance_type = "t2.micro"                # Tipo de instancia (Free tier)
  
  key_name      = "tu-llave-ssh"            # ⚠️ Cambia por el nombre de tu key pair

  vpc_security_group_ids = [aws_security_group. postgres_sg.id]

  # Script que se ejecuta al crear la instancia
  user_data = file("${path.module}/setup-docker-postgres.sh")

  tags = {
    Name = "PostgreSQL-Database-Container"
    Project = "Test-Dist"
  }

  # Esperar a que la instancia esté completamente inicializada
  depends_on = [aws_security_group.postgres_sg]
}

# Outputs - información útil después del deployment
output "instance_public_ip" {
  description = "IP pública de la instancia EC2 con PostgreSQL"
  value       = aws_instance.postgres_db. public_ip
}

output "instance_id" {
  description = "ID de la instancia EC2"
  value       = aws_instance. postgres_db.id
}

output "postgres_connection_string" {
  description = "String de conexión a PostgreSQL"
  value       = "postgresql://postgres:TU_PASSWORD@${aws_instance.postgres_db.public_ip}:5432/pokemon"
}