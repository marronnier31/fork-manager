import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { DefaultSession, NextAuthConfig } from "next-auth";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const hasGitHubCredentials = Boolean(githubClientId && githubClientSecret);

if (!hasGitHubCredentials) {
  console.warn(
    "GitHub auth disabled: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable sign-in."
  );
}

export const authConfig: NextAuthConfig = {
  providers: hasGitHubCredentials
    ? [
        GitHub({
          clientId: githubClientId!,
          clientSecret: githubClientSecret!,
          authorization: {
            params: {
              scope: "read:user user:email repo"
            }
          }
        })
      ]
    : [],
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
