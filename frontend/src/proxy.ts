import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api", "/setup"];
const ADMIN_ONLY_PATHS = ["/approvals", "/employees"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public routes and backend API proxy routes through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("hr_token")?.value;

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Decode role from JWT payload (base64 middle segment — no crypto needed)
  try {
    const payloadBase64 = token.split(".")[1];
    // atob is available in the edge runtime; Buffer is not always available
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    // .NET ClaimTypes.Role serialises to this URI in JWTs
    const role: string =
      payload[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] ??
      payload.role ??
      "Employee";

    // Employee trying to access admin-only routes
    if (
      role !== "Admin" &&
      ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    // Malformed token — clear and redirect to login
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("hr_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
