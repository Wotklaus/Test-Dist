#!/bin/bash

# Actualizar sistema
sudo apt-get update
sudo apt-get upgrade -y

# Instalar Docker
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear directorio para la base de datos
mkdir -p /home/ubuntu/postgres-db

# Crear docker-compose.yml para PostgreSQL
cat > /home/ubuntu/postgres-db/docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres: 
    image: postgres: 16
    container_name: pokemon-db
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=mi_password_seguro_123
      - POSTGRES_DB=pokemon
    ports:
      - "5432:5432"
    volumes: 
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval:  10s
      timeout: 5s
      retries: 5

volumes:
  pgdata: 
    driver: local
EOF

# Levantar el contenedor de PostgreSQL
cd /home/ubuntu/postgres-db
sudo docker-compose up -d

# Esperar a que PostgreSQL esté listo
echo "Esperando a que PostgreSQL inicie..."
sleep 20

# Verificar que el contenedor esté corriendo
sudo docker ps

echo "✅ PostgreSQL instalado y corriendo en Docker"
echo "📊 Puedes conectarte usando:  psql -h <IP> -U postgres -d pokemon"