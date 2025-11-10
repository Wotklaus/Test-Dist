
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
RUN rm -f import.js

EXPOSE 3000

CMD ["node", "server.js"]