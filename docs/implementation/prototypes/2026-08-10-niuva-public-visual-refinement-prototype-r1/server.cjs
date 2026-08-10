const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 4178);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8"
};

function safePath(urlPath) {
  const pathname = decodeURIComponent((urlPath || "/").split("?")[0]);
  const route = pathname === "/" ? "/index.html" : pathname;
  const candidate = path.resolve(root, `.${route}`);
  const resolvedRoot = path.resolve(root);
  return candidate === resolvedRoot || candidate.startsWith(`${resolvedRoot}${path.sep}`) ? candidate : null;
}

const server = http.createServer((request, response) => {
  const target = safePath(request.url);
  const fallback = path.join(root, "index.html");
  const file = target && fs.existsSync(target) && fs.statSync(target).isFile() ? target : fallback;
  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end("Prototype server error");
      return;
    }
    response.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    response.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`Niuva visual prototype: http://127.0.0.1:${port}\n`);
});
