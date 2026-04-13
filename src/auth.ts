import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { DefaultSession, NextAuthConfig } from "next-auth";

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
      clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
      authorization: {
        params: {
          scope: "read:user user:email repo"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      const authToken = token as { accessToken?: string };

      if (account?.access_token) {
        authToken.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      const authSession = session as DefaultSession & {
        accessToken?: string;
        user?: DefaultSession["user"] & {
          accessToken?: string;
        };
      };
      const authToken = token as { accessToken?: string };

      authSession.accessToken = authToken.accessToken;

      if (authSession.user) {
        authSession.user.accessToken = authToken.accessToken;
      }

      return authSession;
    }
  }
};

export const { handlers, auth } = NextAuth(authConfig);
