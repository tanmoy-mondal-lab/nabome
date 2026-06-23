import http from "http";

const PORT = parseInt(process.env.PORT ?? "3001");

async function loadHandler() {
  const mod = await import("./[...path].ts");
  return mod;
}

const server = http.createServer(async (req, res) => {
  try {
    const handler = await loadHandler();

    const method = req.method?.toUpperCase() ?? "GET";
    const exportKey = method === "OPTIONS" ? "OPTIONS" : method;

    const handlerFn = (handler as Record<string, unknown>)[exportKey] as
      ((request: Request) => Promise<Response>) | undefined;

    if (!handlerFn) {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: { message: "Method not allowed", status: 405 } }));
      return;
    }

    const protocol = req.headers["x-forwarded-proto"] ?? "http";
    const host = req.headers.host ?? `localhost:${PORT}`;
    const url = new URL(req.url ?? "/", `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
    }

    let body: BodyInit | null = null;
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    if (chunks.length > 0) {
      body = Buffer.concat(chunks);
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? undefined : body,
    });

    const response = await handlerFn(request);

    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    const responseBody = await response.text();
    res.end(responseBody);
  } catch (err) {
    console.error("[API DEV] Error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: { message: "Internal server error", status: 500 } }));
  }
});

server.listen(PORT, () => {
  console.log(`[API DEV] Server running on http://localhost:${PORT}`);
});
