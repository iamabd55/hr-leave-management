import { NextRequest, NextResponse } from "next/server";
import https from "https";
import { URL } from "url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// Dev HTTPS proxy — uses Node.js https.request with a custom
// agent that accepts the .NET self-signed dev certificate.
// This replaces next.config.ts rewrites() for reliability.
// ─────────────────────────────────────────────────────────────

const BACKEND_ORIGIN = "https://localhost:7125";

// Custom agent: skip cert verification for the local .NET dev cert
const devAgent = new https.Agent({ rejectUnauthorized: false });

// Hop-by-hop headers that must NOT be forwarded
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

async function handler(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname; // e.g. /api/auth/login
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_ORIGIN}${pathname}${search}`;

  // Build forwarded headers
  const forwardHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase()) && key.toLowerCase() !== "host") {
      forwardHeaders[key.toLowerCase()] = value;
    }
  });

  // Read request body for non-GET/HEAD methods
  const bodyBuffer =
    req.method !== "GET" && req.method !== "HEAD"
      ? Buffer.from(await req.arrayBuffer())
      : null;

  if (bodyBuffer && bodyBuffer.byteLength > 0) {
    forwardHeaders["content-length"] = String(bodyBuffer.byteLength);
  }

  // Make the HTTPS request using Node.js with rejectUnauthorized: false
  const backendRes = await new Promise<{
    status: number;
    contentType: string;
    body: Buffer;
  }>((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const options: https.RequestOptions = {
      hostname: parsed.hostname,
      port: parseInt(parsed.port || "443", 10),
      path: parsed.pathname + parsed.search,
      method: req.method,
      headers: forwardHeaders,
      agent: devAgent,
    };

    const nodeReq = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 500,
          contentType: (res.headers["content-type"] as string) ?? "application/json",
          body: Buffer.concat(chunks),
        });
      });
    });

    nodeReq.on("error", (err) => reject(err));

    if (bodyBuffer && bodyBuffer.byteLength > 0) {
      nodeReq.write(bodyBuffer);
    }
    nodeReq.end();
  });

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: {
      "content-type": backendRes.contentType,
    },
  });
}

// Export all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;
