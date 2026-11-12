import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { getDashboardHome } from "@/lib/rbac";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (pathname.startsWith("/dashboard")) {
    if (!token?.role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (
      pathname.startsWith("/dashboard/super-admin") &&
      token.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.redirect(new URL(getDashboardHome(token.role), request.url));
    }

    if (pathname.startsWith("/dashboard/tenant") && token.role !== "BUMDES_ADMIN") {
      return NextResponse.redirect(new URL(getDashboardHome(token.role), request.url));
    }

    if (pathname.startsWith("/dashboard/seller") && token.role !== "SELLER") {
      return NextResponse.redirect(new URL(getDashboardHome(token.role), request.url));
    }
  }

  if (pathname === "/login" && token?.role) {
    return NextResponse.redirect(new URL(getDashboardHome(token.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
