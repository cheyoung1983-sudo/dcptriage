// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { exchangeCodeForToken, refreshVercelToken } from "@/lib/vercelAuth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Vercel",
      credentials: { code: { label: "Code", type: "text" } },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.code) return null; const code = credentials.code as string;
        const tokenResponse = await exchangeCodeForToken(code);
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = now + ((tokenResponse as any).expires_in ?? 0);
        return tokenResponse
          ? { id: "vercel-user",
              name: "VercelUser",
              // accessToken: (tokenResponse as any).access_token,
              // refreshToken: (tokenResponse as any).refresh_token,
              // accessTokenExpires: expiresAt,
            }
          : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.accessTokenExpires = (user as any).accessTokenExpires;
        return token;
      }
      const now = Math.floor(Date.now() / 1000);
      if (token.accessTokenExpires && now < token.accessTokenExpires - 300) {
        return token;
      }
      if (token.refreshToken) {
        try {
          const refreshed = await refreshVercelToken(token.refreshToken as string);
          token.accessToken = (refreshed as any).access_token;
          token.refreshToken = (refreshed as any).refresh_token ?? token.refreshToken;
          token.accessTokenExpires = now + (refreshed as any).expires_in;
        } catch (e) {
          console.error("Vercel token refresh failed", e);
          token.accessToken = null;
          token.refreshToken = null;
          token.accessTokenExpires = null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // @ts-ignore – extending session type
      session.accessToken = token.accessToken as string;
      // @ts-ignore – optional expiry
      session.accessTokenExpires = token.accessTokenExpires as number;
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" as const, maxAge: 30 * 24 * 60 * 60 },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60,
      },
    },
  },
  debug: process.env.NODE_ENV !== "production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
