import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

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
  ]
};
