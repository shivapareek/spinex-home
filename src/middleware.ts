import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me-spinex-home");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("spx_session")?.value;
    let role: string | undefined;
    if (token) {
      try {
        role = (await jwtVerify(token, secret())).payload.role as string;
      } catch {}
    }
    if (role !== "admin" && role !== "staff") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
