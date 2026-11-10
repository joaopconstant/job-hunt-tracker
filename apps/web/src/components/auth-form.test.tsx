import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "./auth-form";

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
const authClient = vi.hoisted(() => ({
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
}));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/lib/auth-client", () => ({ authClient }));

beforeEach(() => {
  vi.clearAllMocks();
});

async function fill(fields: Record<string, string>) {
  const user = userEvent.setup();
  for (const [label, value] of Object.entries(fields)) {
    await user.type(screen.getByLabelText(label), value);
  }
  return user;
}

describe("AuthForm", () => {
  it("signs up and goes to the board", async () => {
    authClient.signUp.email.mockResolvedValue({ error: null });
    render(<AuthForm mode="sign-up" />);

    const user = await fill({ Name: "Ada", Email: "ada@example.com", Password: "correct-horse" });
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(authClient.signUp.email).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
      password: "correct-horse",
    });
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("shows the error and stays on the page when sign in fails", async () => {
    authClient.signIn.email.mockResolvedValue({ error: { message: "Invalid email or password" } });
    render(<AuthForm mode="sign-in" />);

    const user = await fill({ Email: "ada@example.com", Password: "wrong-password" });
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("only asks for a name when signing up", () => {
    render(<AuthForm mode="sign-in" />);

    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create one" })).toHaveAttribute("href", "/sign-up");
  });
});
