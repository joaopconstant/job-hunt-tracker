"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

const copy = {
  "sign-in": {
    title: "Welcome back",
    description: "Sign in to see your applications.",
    submit: "Sign in",
    switchText: "No account yet?",
    switchLink: { href: "/sign-up", label: "Create one" },
  },
  "sign-up": {
    title: "Create your account",
    description: "Start tracking your job hunt.",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLink: { href: "/sign-in", label: "Sign in" },
  },
} as const;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const text = copy[mode];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    setPending(true);
    setError(null);
    const { error } =
      mode === "sign-up"
        ? await authClient.signUp.email({ name: String(form.get("name")), email, password })
        : await authClient.signIn.email({ email, password });
    setPending(false);

    if (error) {
      setError(error.message ?? "Something went wrong. Try again.");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          <h1 className="text-xl">{text.title}</h1>
        </CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {mode === "sign-up" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" autoComplete="name" required />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              required
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {text.submit}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="gap-1 text-sm text-muted-foreground">
        {text.switchText}
        <Link href={text.switchLink.href} className="text-foreground underline underline-offset-4">
          {text.switchLink.label}
        </Link>
      </CardFooter>
    </Card>
  );
}
