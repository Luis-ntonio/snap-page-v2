import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Mockups del handoff de diseño (Claude Design) — no son código de la app.
    "Mejora de snap-page-v2/**",
    // Worker vendorizado de pdfjs-dist (minificado, servido tal cual desde /public).
    "public/pdf.worker.min.mjs",
  ]),
]);

export default eslintConfig;
