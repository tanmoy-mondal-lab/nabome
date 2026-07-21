import { describe, expect, it } from "vitest";
import { OPTIONS } from "../../[...path]";

describe("API catch-all router", () => {
  it("returns a CORS preflight response for matched API paths", async () => {
    const request = new Request("http://localhost:8788/api/admin/media", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
      },
    });

    const response = await OPTIONS(request, { env: { NODE_ENV: "development" } });

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:5173");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("OPTIONS");
    expect(response.headers.get("X-Request-ID")).toBeTruthy();
  });
});

