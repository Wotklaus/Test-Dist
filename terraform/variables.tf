variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "Tipo de instancia EC2"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Nombre del key pair para SSH"
  type        = string
}

variable "db_password" {
  description = "Contraseña para PostgreSQL"
  type        = string
  sensitive   = true
  default     = "1234"
}