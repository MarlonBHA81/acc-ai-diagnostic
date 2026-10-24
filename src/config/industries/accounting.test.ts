import { describe, it, expect, vi, afterEach } from 'vitest';
import type { IndustryConfig } from '../IndustryConfig';
import { accountingConfig } from './accounting';
import { genericConfig } from './generic';

/**
 * Covers the Accounting Firm Edition's contract with the shared framework:
 *   1. the config satisfies IndustryConfig (incl. a Quick block),
 *   2. env-selectable active.ts defaults to accounting and still resolves generic,
 *   3. the accounting terminology/synthesis + sourceTag are present, and
 *   4. the Benjamin Simkin quote is gone.
 */

describe('accountingConfig — IndustryConfig contract', () => {
  const typed: IndustryConfig = accountingConfig;

  it('has the expected identity', () => {
    expect(typed.slug).toBe('accounting');
    expect(typed.sourceTag).toBe('accounting-diagnostic');
    expect(typed.displayName).toBe('Accounting Firm');
  });

  it('defines exactly the seven zones, in order', () => {
    expect(accountingConfig.zones.map((z) => z.id)).toEqual([
      'lead', 'sales', 'delivery', 'ops', 'finance', 'team', 'owner',
    ]);
  });

  it('every zone has a description, a Think example, and two free-text prompts', () => {
    for (const z of accountingConfig.zones) {
      expect(z.description.length).toBeGreaterThan(0);
      expect(z.thinkExample.toLowerCase()).toContain('think:');
      expect(z.freeText).toHaveLength(2);
      expect(z.freeText[0].key).toBe('bottleneck');
      expect(z.freeText[1].key).toBe('desiredFix');
    }
  });

  it('uses "Partner involvement" terminology', () => {
    expect(accountingConfig.dimensions.partnerInvolvementLabel).toBe('Partner involvement');
    // Mirrors ResultsView's table-header derivation.
    expect(accountingConfig.dimensions.partnerInvolvementLabel.split(' ')[0]).toBe('Partner');
  });

  it('provides four AI-usage / margin options and four next-step cards', () => {
    expect(accountingConfig.dimensions.aiUsageOptions.map((o) => o.value)).toEqual([1, 2, 3, 4]);
    expect(accountingConfig.dimensions.marginImpactOptions.map((o) => o.value)).toEqual([1, 2, 3, 4]);
    const s = accountingConfig.nextSteps;
    for (const card of [s.contextLibrary, s.redesign, s.integrate, s.constraintShifted]) {
      expect(card.heading.length).toBeGreaterThan(0);
      expect(card.body.length).toBeGreaterThan(0);
    }
  });

  it('ships a Quick Mode block (3 questions + hours bands)', () => {
    expect(accountingConfig.quick).toBeDefined();
    expect(accountingConfig.quick!.questions.repetitive).toContain('{zone}');
    expect(accountingConfig.quick!.hoursBands).toHaveLength(3);
  });

  it('carries accounting terminology + synthesis copy', () => {
    expect(accountingConfig.terminology?.costLineSuffix).toBe('of billable-equivalent capacity');
    expect(accountingConfig.terminology?.emailSubjectTemplate).toContain("your firm's");
    expect(accountingConfig.synthesis?.volumeTail).toContain('inventory');
  });

  it('keeps the booking CTA and carries no Benjamin Simkin quote', () => {
    expect(accountingConfig.closing.ctaUrl).toBe(
      'https://link.storyadvantage.co.za/widget/bookings/ai-automations-debrief',
    );
    expect(accountingConfig.closing.quote).toBeUndefined();
    expect(JSON.stringify(accountingConfig)).not.toMatch(/simkin/i);
  });
});

describe('active.ts — env-selectable vertical (defaults to accounting)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('defaults to accounting when no vertical is set', async () => {
    vi.resetModules();
    vi.stubEnv('VERTICAL', '');
    const { activeConfig } = await import('../active');
    expect(activeConfig.slug).toBe('accounting');
  });

  it('resolves accounting when VERTICAL=accounting', async () => {
    vi.resetModules();
    vi.stubEnv('VERTICAL', 'accounting');
    const { activeConfig } = await import('../active');
    expect(activeConfig.sourceTag).toBe('accounting-diagnostic');
  });

  it('still resolves generic when explicitly set', async () => {
    vi.resetModules();
    vi.stubEnv('VERTICAL', 'generic');
    const { activeConfig } = await import('../active');
    expect(activeConfig.slug).toBe('generic');
    expect(activeConfig.sourceTag).toBe(genericConfig.sourceTag);
  });

  it('falls back to the default (accounting) with a warning on an unknown vertical', async () => {
    vi.resetModules();
    vi.stubEnv('VERTICAL', 'nope-not-a-vertical');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { activeConfig } = await import('../active');
    expect(activeConfig.slug).toBe('accounting');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
