/**
 * The active vertical for this deployment, chosen by environment variable so the
 * SAME build can power multiple sites (one repo → many editions):
 *
 *   - Frontend (Vite):        import.meta.env.VITE_VERTICAL
 *   - Serverless (Vercel /    process.env.VERTICAL
 *     Cloudflare functions)
 *
 * THIS REPO IS THE DEDICATED ACCOUNTING FIRM EDITION, so the default vertical is
 * `accounting`: with no env var set, the frontend, API, email, and PDF all render
 * the accounting copy. That means a Vercel project built off this repo ships the
 * accounting edition out of the box — no configuration required. The generic
 * edition is still reachable from the same source by setting the vars to
 * "generic" (that's how the unit tests exercise both). Any unknown value falls
 * back to the default with a console warning.
 *
 * This module is imported by both the app entry (main.tsx, SharedResult.tsx) and
 * the /api/lead handler (handleLead.ts), so the on-screen results, the report
 * email, and the PDF always use the same copy.
 *
 * Available verticals:
 *   - accountingConfig  (Accounting Firm Edition — this repo's default)
 *   - genericConfig     (Generic Business Edition — set VITE_VERTICAL/VERTICAL=generic)
 */
import type { IndustryConfig } from './IndustryConfig';
import { genericConfig } from './industries/generic';
import { accountingConfig } from './industries/accounting';

/** Registry of every shippable vertical, keyed by its slug. */
const VERTICALS: Record<string, IndustryConfig> = {
  generic: genericConfig,
  accounting: accountingConfig,
};

// This repo is the dedicated Accounting Firm Edition deployment, so an unset /
// unknown vertical resolves to accounting (not generic). See the module doc above.
const DEFAULT_VERTICAL = 'accounting';

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
