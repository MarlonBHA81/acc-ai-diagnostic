/**
 * The active vertical for this deployment, chosen by environment variable so the
 * SAME build can power multiple sites (one repo -> many editions):
 *
 *   - Frontend (Vite):        import.meta.env.VITE_VERTICAL
 *   - Serverless (Vercel /    process.env.VERTICAL
 *     Cloudflare functions)
 *
 * THIS REPO IS THE DEDICATED ACCOUNTING FIRM EDITION, so the default vertical is
 * `accounting`: with no env var set, the frontend, API, email, and PDF all render
 * the accounting copy and the accounting theme. The generic Business Edition is
 * still reachable from the same source by setting the vars to "generic" (that is
 * how the unit tests exercise both). Any unknown value falls back to the default
 * with a console warning.
 *
 * Imported by the app entry (main.tsx, SharedResult.tsx) and the /api/lead handler
 * (handleLead.ts), so the on-screen results, the report email, and the PDF always
 * use the same copy.
 */
import type { IndustryConfig } from './IndustryConfig';
import { genericConfig } from './industries/generic';
import { accountingConfig } from './industries/accounting';

/** Registry of every shippable vertical, keyed by its slug. */
const VERTICALS: Record<string, IndustryConfig> = {
  generic: genericConfig,
  accounting: accountingConfig,
};

// Dedicated accounting deployment: unset / unknown resolves to accounting.
const DEFAULT_VERTICAL = 'accounting';

function readRequestedVertical(): string | undefined {
  // Frontend build: Vite statically replaces this exact expression at build time.
  // In the serverless build (esbuild) the expression survives to runtime where
  // `import.meta.env` is undefined; the try/catch swallows that and we fall
  // through to process.env below.
  try {
    const fromVite = import.meta.env.VITE_VERTICAL;
    if (fromVite) return fromVite;
  } catch {
    /* not a Vite context */
  }
  // Read process.env without referencing the bare `process` global (which isn't
  // in this project's TS `types` allowlist); works in Node/serverless, undefined
  // in the browser.
  const g = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
  const fromNode = g.process?.env?.VERTICAL;
  if (fromNode) return fromNode;

  return undefined;
}

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

/**
 * Which questionnaire this deployment serves:
 *   - 'full'  the original 7-zone x 5-dimension diagnostic (the accounting prototype)
 *   - 'quick' the fast 3-tap-per-zone version (Yes / Somewhat / No / Not sure)
 *
 * The Accounting Firm Edition ships the FULL diagnostic to match the prototype
 * worksheet and showcase the firm-specific dimension copy. Switch to 'quick' here
 * to match the live Business edition's fast flow; the active vertical already
 * provides a `quick` block.
 */
export const activeMode: 'full' | 'quick' = 'full';
