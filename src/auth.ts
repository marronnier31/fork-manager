import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { DefaultSession, NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: DefaultSession["user"] & {
      accessToken?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

function requireEnv(name: "GITHUB_CLIENT_ID" | "GITHUB_CLIENT_SECRET") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: requireEnv("GITHUB_CLIENT_ID"),
      clientSecret: requireEnv("GITHUB_CLIENT_SECRET")
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;

      if (session.user) {
        session.user.accessToken = token.accessToken;
      }

      return session;
    }
  }
};

export const { handlers, auth } = NextAuth(authConfig);
