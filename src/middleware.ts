/* ─── Route Protection Middleware ─── */
import { NextRequest, NextResponse } from "next/server";

const excludedPaths = ["/signup/success", "/admin/login"]; // Always accessible

export function middleware(req: NextRequest) {
  const token = req.cookies.get("softly_token")?.value;
  const { pathname } = req.nextUrl;

  // Skip excluded paths — always allow through
  if (excludedPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Admin panel — redirect to admin login if no cookie
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // Dashboard — redirect to user login if no cookie
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // If logged in and visiting user login/signup, redirect to dashboard
  if (pathname === "/login" || pathname === "/signup") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/signup/success",
  ],
};
