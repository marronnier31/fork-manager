import { redirect } from "next/navigation";

export async function GET() {
  return new Response(null, {
    status: 307,
    headers: {
      location: "/dashboard"
    }
  });
}

export default function HomePage() {
  redirect("/dashboard");
}
