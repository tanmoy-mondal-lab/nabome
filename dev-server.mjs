// ─── Local Node.js API server for dev ───
// Proxies /api/* requests through the same Cloudflare Pages Function
// handlers, but runs in Node.js where Prisma WASM works.
import "dotenv/config";
import { createServer } from "http";

const PORT = 3001;

async function main() {
  const mod = await import("./api/[...path].ts");

  const handler = async (req, res) => {
    const url = `http://localhost:${PORT}${req.url}`;
    const headers = { ...req.headers };
    delete headers["host"];

    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks);
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      body: body && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) ? body : undefined,
    });

    // Dispatch to the right method handler
    const methodFn = mod[req.method];
    if (!methodFn) {
      res.writeHead(405);
      res.end("Method Not Allowed");
      return;
    }

    const response = await methodFn(request);
    const respHeaders = Object.fromEntries(response.headers);
    res.writeHead(response.status, respHeaders);
    const buf = Buffer.from(await response.arrayBuffer());
    res.end(buf);
  };

  const server = createServer(handler);
  server.listen(PORT, () => {
    console.log(`\n  🚀 API server running at http://localhost:${PORT}\n`);
  });
}

main().catch((e) => {
  console.error("Failed to start API server:", e);
  process.exit(1);
});
