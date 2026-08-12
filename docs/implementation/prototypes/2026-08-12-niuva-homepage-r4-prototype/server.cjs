const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.NIUVA_HOMEPAGE_R4_PORT || 4198);
const homepageRoutes = new Set(["/", "/en", "/en/"]);
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};

http.createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);
  let pathname;
  try {
    pathname = homepageRoutes.has(url.pathname) ? "/index.html" : decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }).end("Bad request");
    return;
  }
  const filePath = path.resolve(root, `.${pathname}`);

  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" }).end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
      return;
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": mime[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    const stream = fs.createReadStream(filePath);
    stream.on("error", () => response.destroy());
    stream.pipe(response);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Niuva Homepage R4 prototype: http://127.0.0.1:${port}/`);
});
