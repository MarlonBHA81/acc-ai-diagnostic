/**
 * IndustryConfig, the single place all vertical copy lives.
 *
 * The scoring engine (src/scoring) and the brand tokens (src/styles/tokens.css)
 * are industry-agnostic. To add a vertical you author one file implementing this
 * interface; nothing else changes. Accounting is vertical #1 (route: /accounting).
 *
 * NOTE: the prose in src/config/industries/accounting.ts must be ported VERBATIM
 * from the prototype worksheet `7-zone-diagnostic-accounting-firm.html`. Until the
 * prototype is supplied, that file carries clearly-marked PLACEHOLDER copy so the
 * app compiles and renders, it is not the final wording.
 */

import type { AiUsageLevel, MarginImpactLevel } from '../scoring/types';

/** A selectable option with the numeric value fed to the scoring engine. */
export interface ScoredOption<V extends number = number> {
  value: V;
  label: string;
  /** Optional longer description shown under the option (e.g. AI-usage detail). */
  description?: string;
}

/** An optional free-text question: its label and input placeholder. */
export interface FreeTextQuestion {
  /** The `bottleneck` slot maps to the first, `desiredFix` to the second. */
  key: 'bottleneck' | 'desiredFix';
  label: string;
  placeholder: string;
}

/** One zone's full content and question set. */
export interface ZoneConfig {
  /** Stable id used by the scoring engine and webhook payload. */
  id: string;
  /** Display name, e.g. "Client Delivery". */
  name: string;
  /** One or two sentence description of the zone. */
  description: string;
  /** The "Think:" example line. */
  thinkExample: string;
  /** The two optional free-text questions (labels + placeholders), in order. */
  freeText: [FreeTextQuestion, FreeTextQuestion];
}

/** A 1..5 segmented scale with an optional cap word under each stop. */
export type ScaleCaps = [string, string, string, string, string];

/** Labels for the five scored dimensions and their option scales. */
export interface DimensionConfig {
  /** Label for the hours question, e.g. "Time consumed". */
  hoursLabel: string;
  hoursHint: string;
  /** Repetitiveness label, hint, and cap words under stops 1..5. */
  repetitivenessLabel: string;
  repetitivenessHint: string;
  repetitivenessCaps: ScaleCaps;
  /** AI usage label + options (None/Basic/Moderate/Advanced) with descriptions. */
  aiUsageLabel: string;
  aiUsageHint: string;
  aiUsageOptions: ScoredOption<AiUsageLevel>[];
  /** Margin impact label + options (Low/Medium/High/Critical). */
  marginImpactLabel: string;
  marginImpactHint: string;
  marginImpactOptions: ScoredOption<MarginImpactLevel>[];
  /** Partner-involvement label, hint, and cap words (industry term). */
  partnerInvolvementLabel: string;
  partnerInvolvementHint: string;
  partnerInvolvementCaps: ScaleCaps;
}

/** Next-step guidance keyed to the constraint zone's current AI level. */
export interface NextStepConfig {
  /** aiUsage 1 (None) → build a context library. */
  contextLibrary: NextStepCard;
  /** aiUsage 2 (Basic) → redesign, don't retrofit. */
  redesign: NextStepCard;
  /** aiUsage 3 (Moderate) → integrate. */
  integrate: NextStepCard;
  /** aiUsage 4 (Advanced) → the constraint has shifted. */
  constraintShifted: NextStepCard;
}

export interface NextStepCard {
  heading: string;
  body: string;
  /** "What this looks like in a firm" example. */
  firmExample: string;
}

/**
 * Per-vertical wording for the small amount of otherwise-shared chrome baked into
 * the (industry-agnostic) results screen and report email. Every field is
 * optional; an omitted field uses the generic default hard-coded in the consuming
 * component, so a config that leaves `terminology` off behaves exactly as before.
 */
export interface Terminology {
  /** Caption before the constraint cost calc. Default "Rough monthly cost of this zone:". */
  costLinePrefix?: string;
  /** Text appended after the constraint cost amount. Default "". Accounting: "of billable-equivalent capacity". */
  costLineSuffix?: string;
  /** Tip shown when no charge-out rate was given. */
  costLineTip?: string;
  /** Report email subject; `{first}` and `{constraint}` are substituted. */
  emailSubjectTemplate?: string;
}

/**
 * Per-vertical trailing sentences for the three "How the constraint was
 * identified" synthesis cards (full mode). Omitted fields use the generic
 * defaults baked into the results screen.
 */
export interface SynthesisCopy {
  /** After Test 1 (volume). Default: "This is where AI saves the most raw hours." */
  volumeTail?: string;
  /** After Test 2 (margin). Default: "Your biggest untapped opportunity." */
  marginTail?: string;
  /** After Test 3 (partner). Default: "Solving this frees your scarcest resource: leadership attention." */
  partnerTail?: string;
}

/**
 * Quick Mode copy: a stripped-down 3-tap-per-zone questionnaire (Yes / Somewhat
 * / No / Not sure) for a faster, lower-friction diagnostic. Questions use the
 * placeholder `{zone}`, replaced with the lowercased zone name at render.
 */
export interface QuickConfig {
  /** Short intro line shown on each quick zone screen. */
  instruction: string;
  /** The three per-zone questions, each with a `{zone}` placeholder. */
  questions: {
    repetitive: string;
    time: string;
    aiUsage: string;
  };
  /** Prompt for the single hours-band question about the winning zone. */
  hoursPrompt: string;
  /** Labels for the three hours bands (Under 5 / 5 to 15 / 15+). */
  hoursBands: [string, string, string];
}

export interface IndustryConfig {
  /** Route slug, e.g. "accounting". */
  slug: string;
  /** Source tag in webhook payloads, e.g. "accounting-diagnostic". */
  sourceTag: string;
  /** Human name, e.g. "Accounting Firm". */
  displayName: string;

  /** Welcome/gate screen copy. */
  welcome: {
    headline: string;
    subhead: string;
  };

  /** Firm-baseline screen copy. */
  baseline: {
    revenueLabel: string;
    teamSizeLabel: string;
    /** Blended charge-out rate label (industry term). */
    chargeOutRateLabel: string;
    chargeOutRateNote: string;
    /** Verbatim busy-season note from the prototype. */
    busySeasonNote: string;
  };

  /** Shared dimension labels/scales. */
  dimensions: DimensionConfig;

  /** Quick Mode copy (optional; required only when the active mode is "quick"). */
  quick?: QuickConfig;

  /** The 7 zones, in display order. */
  zones: ZoneConfig[];

  /** Next-step cards keyed to constraint AI level. */
  nextSteps: NextStepConfig;

  /** Optional per-vertical wording for shared results/email chrome. */
  terminology?: Terminology;

  /** Optional per-vertical synthesis-card trailing sentences (full mode). */
  synthesis?: SynthesisCopy;

  /** Closing content on the results screen. */
  closing: {
    /** Optional pull-quote shown on results. Omit to render no quote. */
    quote?: string;
    /** Attribution for the quote (only used when `quote` is set). */
    quoteAttribution?: string;
    /** Re-run reminder line. */
    reRunNote: string;
    ctaText: string;
    ctaUrl: string;
  };
}
