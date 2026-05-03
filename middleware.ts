import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isPublicRoute = isAuthPage || isApiRoute || nextUrl.pathname === "/";

  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(
      new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
    );
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
