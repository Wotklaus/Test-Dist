# Usa la imagen oficial de Node.js
FROM node:20

# Crea el directorio donde se va a trabajar
WORKDIR /app

# Copia los archivos de dependencias (package.json y package-lock.json)
COPY package*.json ./

# Instala dependencias de Node.js (express, bcrypt, etc)
RUN npm install

# Copia todo el código del backend (incluye server.js, src, db)
COPY . .

# Expone el puerto (ejemplo: 3001, ajusta si usas otro)
EXPOSE 3000

# Comando para iniciar el backend
CMD ["node", "server.js"]