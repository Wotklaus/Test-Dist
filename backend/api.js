const fs = require("fs");
const path = require("path");

// Read request body as JSON
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

// Read and write the database file
function getDB() {
  const dbPath = path.join(__dirname, "db.json");
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(db) {
  const dbPath = path.join(__dirname, "db.json");
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = function(req, res) {
  // LOGIN ENDPOINT
  if (req.url === "/api/login" && req.method === "POST") {
    readBody(req, body => {
      const { username, password } = body;
      const db = getDB();
      const user = db.users.find(u => u.username === username && u.password === password);

      if (user) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, username }));
        return;
      } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Invalid username or password" }));
        return;
      }
    });
    return;
  }

  // GET FAVORITES
  if (req.url.startsWith("/api/favorites") && req.method === "GET") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const username = url.searchParams.get("username");
    const db = getDB();
    const user = db.users.find(u => u.username === username);
    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ favorites: user.favorites || [] }));
      return;
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }
  }

  // ADD FAVORITE
  if (req.url === "/api/favorites" && req.method === "POST") {
    readBody(req, body => {
      const { username, pokemon } = body;
      const db = getDB();
      const user = db.users.find(u => u.username === username);
      if (user) {
        if (!user.favorites.includes(pokemon)) {
          user.favorites.push(pokemon);
          saveDB(db);
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ favorites: user.favorites }));
        return;
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
        return;
      }
    });
    return;
  }

  // REMOVE FAVORITE
  if (req.url === "/api/favorites" && req.method === "DELETE") {
    readBody(req, body => {
      const { username, pokemon } = body;
      const db = getDB();
      const user = db.users.find(u => u.username === username);
      if (user) {
        user.favorites = user.favorites.filter(fav => fav !== pokemon);
        saveDB(db);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ favorites: user.favorites }));
        return;
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
        return;
      }
    });
    return;
  }

  // GET SEARCH HISTORY
  if (req.url.startsWith("/api/history") && req.method === "GET") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const username = url.searchParams.get("username");
    const db = getDB();
    const user = db.users.find(u => u.username === username);
    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ history: user.history || [] }));
      return;
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }
  }

  // ADD TO SEARCH HISTORY
  if (req.url === "/api/history" && req.method === "POST") {
    readBody(req, body => {
      const { username, pokemon } = body;
      const db = getDB();
      const user = db.users.find(u => u.username === username);
      if (user) {
        user.history.push(pokemon);
        saveDB(db);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ history: user.history }));
        return;
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
        return;
      }
    });
    return;
  }

  // ENDPOINT NOT IMPLEMENTED
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not implemented" }));
  return;
};