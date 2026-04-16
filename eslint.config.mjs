import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  {
    ignores: [
      "**/.next/**",        // ВАЖНО
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**",
      "generated/**",
    ],
  },

  ...nextVitals,
  ...nextTs,
]);