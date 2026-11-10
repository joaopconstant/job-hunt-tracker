import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in · Job Hunt Tracker" };

export default function SignInPage() {
  return <AuthForm mode="sign-in" />;
}
