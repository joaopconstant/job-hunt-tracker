import type { FormState } from "@/lib/match";

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={state.status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
    >
      {state.message}
    </p>
  );
}
