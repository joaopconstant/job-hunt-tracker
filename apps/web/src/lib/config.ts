import "server-only";

/** Where the web server reaches the API (server to server, never exposed to the browser). */
export const API_URL = process.env.API_URL ?? "http://localhost:3333";
