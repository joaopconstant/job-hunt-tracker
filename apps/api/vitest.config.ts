import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["test/**/*.test.ts"], exclude: ["test/**/*.int.test.ts"] },
      },
      {
        // Needs a real Postgres: DATABASE_URL must point to a migrated database.
        extends: true,
        test: { name: "integration", include: ["test/**/*.int.test.ts"], fileParallelism: false },
      },
    ],
  },
});
