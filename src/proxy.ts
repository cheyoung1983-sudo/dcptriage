// import { auth0 } from "./lib/auth0";
import { get } from "@vercel/edge-config";
import { NextResponse } from 'next/server';

export async function proxy(request: Request) {
  const url = new URL(request.url);

  // Handle /welcome and /api/welcome via Edge Config
  if (url.pathname === '/welcome' || url.pathname === '/api/welcome') {
    try {
      const greeting = await get('greeting');
      return NextResponse.json({
        greeting: greeting || "hello world",
        source: "vercel-edge-config-middleware"
      });
    } catch (err) {
      return NextResponse.json({
        greeting: "hello world",
        source: "error-fallback",
        error: String(err)
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
