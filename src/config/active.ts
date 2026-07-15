/**
 * The active vertical for this deployment, chosen by environment variable so the
 * SAME build can power multiple sites (one repo → many editions):
 *
 *   - Frontend (Vite):        import.meta.env.VITE_VERTICAL
 *   - Serverless (Vercel /    process.env.VERTICAL
 *     Cloudflare functions)
 *
 * Unset (or "generic") resolves to the base Generic Business Edition; "accounting"
 * resolves to the Accounting Firm Edition. Any unknown value falls back to
 * `generic` with a console warning. This module is imported by both the app entry
 * (main.tsx, SharedResult.tsx) and the /api/lead handler (handleLead.ts), so the
 * on-screen results, the report email, and the PDF always use the same copy.
 *
 * Available verticals:
 *   - genericConfig     (Generic Business Edition — the base prototype)
 *   - accountingConfig  (Accounting Firm Edition)
 */
import type { IndustryConfig } from './IndustryConfig';
import { genericConfig } from './industries/generic';
import { accountingConfig } from './industries/accounting';

/** Registry of every shippable vertical, keyed by its slug. */
const VERTICALS: Record<string, IndustryConfig> = {
  generic: genericConfig,
  accounting: accountingConfig,
};

const DEFAULT_VERTICAL = 'generic';

/**
 * Read the requested vertical from whichever environment is available. In the
 * browser bundle `import.meta.env` is present (Vite) and `process` is not; in the
 * serverless runtime `process.env` is present and `import.meta.env` is not. Both
 * lookups are guarded so this never throws in either context.
 */
function readRequestedVertical(): string | undefined {
  // Frontend build: Vite statically replaces this exact expression with the
  // literal value at build time, so no `import.meta.env` object is touched at
  // runtime. In the serverless build (esbuild), the expression survives to
  // runtime where `import.meta.env` is undefined — the try/catch swallows that
  // and we fall through to process.env below.
  try {
    const fromVite = import.meta.env.VITE_VERTICAL;
    if (fromVite) return fromVite;
  } catch {
    /* not a Vite context — fall through to process.env */
  }

  // Serverless functions (Vercel / Cloudflare) read plain process.env.
  if (typeof process !== 'undefined' && process.env && process.env.VERTICAL) {
    return process.env.VERTICAL;
  }

  return undefined;
}

/** Resolve the requested vertical to a config, falling back to generic. */
function resolveActiveConfig(): IndustryConfig {
  const requested = readRequestedVertical();
  const key = (requested ?? DEFAULT_VERTICAL).trim().toLowerCase();
  const config = VERTICALS[key];

  if (!config) {
    // eslint-disable-next-line no-console
    console.warn(
      `[active] Unknown vertical "${requested}" — falling back to "${DEFAULT_VERTICAL}". ` +
        `Known verticals: ${Object.keys(VERTICALS).join(', ')}.`,
    );
    return VERTICALS[DEFAULT_VERTICAL];
  }

  return config;
}

/** The resolved config for this deployment. Import this everywhere. */
export const activeConfig: IndustryConfig = resolveActiveConfig();
