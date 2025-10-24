const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Ruta para la API
  if (req.url.startsWith("/api")) {
    require("./api")(req, res);
    return;
  }

  // Sirve archivos estáticos del frontend
  let filePath = path.join(__dirname, "../frontend", req.url === "/" ? "index.html" : req.url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }
    // Detecta tipo de archivo
    let ext = path.extname(filePath);
    let type = "text/html";
    if (ext === ".css") type = "text/css";
    if (ext === ".js") type = "text/javascript";
    if (ext === ".json") type = "application/json";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});