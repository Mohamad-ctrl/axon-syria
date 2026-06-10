import { redirect } from "next/navigation";
import { getCurrentUser, landingPath } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(landingPath(user));
  return <LoginForm />;
}
