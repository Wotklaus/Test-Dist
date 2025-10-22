const fs = require("fs");
const path = require("path");

function readBody(req, callback) {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    try {
      callback(JSON.parse(body));
    } catch (e) {
      callback({});
    }
  });
}

module.exports = function(req, res) {
  if (req.url === "/api/login" && req.method === "POST") {
    readBody(req, body => {
      const { username, password } = body;
      const dbPath = path.join(__dirname, "db.json");
      const db = JSON.parse(fs.readFileSync(dbPath));
      const user = db.users.find(u => u.username === username && u.password === password);

      if (user) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, username }));
      } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Usuario o contraseña incorrectos" }));
      }
    });
    return;
  }

  // Otros endpoints aquí...

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint no implementado" }));
};