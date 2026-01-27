import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJWT(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64").toString());
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoutes = ["/login", "/register"];
  const isPublic = publicRoutes.includes(pathname);

  const token = req.cookies.get("token")?.value;

  // Not logged in
  if (!token) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const decoded = decodeJWT(token);
  const role = decoded?.role;

  // Logged in but visiting public pages
  if (isPublic) {
    return redirectByRole(role, req);
  }

  // Role-based access
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return redirectByRole(role, req);
  }

  if (pathname.startsWith("/buyer") && role !== "BUYER") {
    return redirectByRole(role, req);
  }

  if (pathname.startsWith("/solver") && role !== "SOLVER") {
    return redirectByRole(role, req);
  }

  return NextResponse.next();
}

function redirectByRole(role: string, req: NextRequest) {
  const url = req.nextUrl.clone();

  if (role === "ADMIN") url.pathname = "/admin";
  else if (role === "BUYER") url.pathname = "/buyer";
  else url.pathname = "/solver";

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/admin/:path*",
    "/buyer/:path*",
    "/solver/:path*",
  ],
};

