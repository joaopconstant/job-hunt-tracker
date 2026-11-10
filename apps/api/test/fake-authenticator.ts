import type { Authenticator } from "../src/authenticator.js";

/** Treats the `x-test-user` header as the signed-in user id. */
export const fakeAuthenticator: Authenticator = {
  async getUserId(headers) {
    const userId = headers["x-test-user"];
    return typeof userId === "string" ? userId : null;
  },
  async handler() {
    return new Response(null, { status: 404 });
  },
};
