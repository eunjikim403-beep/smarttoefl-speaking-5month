const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = 8130;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".webm": "audio/webm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

http
  .createServer((req, res) => {
    let requestPath = decodeURIComponent(req.url.split("?")[0]);
    if (requestPath === "/") requestPath = "/index.html";
    const file = path.join(root, requestPath);
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      });
      res.end(data);
    });
  })
  .listen(port, "127.0.0.1");
