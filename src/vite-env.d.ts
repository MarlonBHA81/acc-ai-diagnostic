/**
 * Minimal ambient typing for the Vite-injected `import.meta.env`, so
 * src/config/active.ts can read `import.meta.env.VITE_VERTICAL` under strict
 * TypeScript without pulling in the full `vite/client` types (which also declare
 * asset-module imports we don't need here).
 */
interface ImportMetaEnv {
  /** Selected vertical for the frontend build: "accounting" | "generic". */
  readonly VITE_VERTICAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
