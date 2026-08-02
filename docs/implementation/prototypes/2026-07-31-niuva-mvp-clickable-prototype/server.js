"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const officialMark = path.resolve(root, "../../../../frontend/public/niuva-mark.svg");
const requestedPort = Number.parseInt(process.env.NIUVA_PROTOTYPE_PORT || "4177", 10);
const port = Number.isFinite(requestedPort) ? requestedPort : 4177;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function sendFile(response, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Prototype file could not be read.");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'self'",
    });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent((request.url || "/").split("?")[0]);

  if (urlPath === "/niuva-mark.svg" && fs.existsSync(officialMark)) {
    sendFile(response, officialMark);
    return;
  }

  const relativePath = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const resolved = path.resolve(root, relativePath);
  const withinRoot = resolved === root || resolved.startsWith(`${root}${path.sep}`);

  if (withinRoot && fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    sendFile(response, resolved);
    return;
  }

  sendFile(response, path.join(root, "index.html"));
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`Niuva MVP prototype: http://127.0.0.1:${port}\n`);
});

module.exports = server;
