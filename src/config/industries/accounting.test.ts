import { describe, it, expect, vi, afterEach } from 'vitest';
import type { IndustryConfig } from '../IndustryConfig';
import { accountingConfig } from './accounting';
import { genericConfig } from './generic';
import { renderReport } from '../../email/renderReport';
import type { DiagnosticCompletedEvent, ZoneResult } from '../../lib/events';

/**
 * These tests cover the Accounting Firm Edition's contract with the rest of the
 * (industry-agnostic) app:
 *   1. the config satisfies IndustryConfig,
 *   2. the env-selectable active.ts resolves it server-side (process.env.VERTICAL),
 *   3. its sourceTag propagates into the webhook payload, and
 *   4. its "Partner involvement" terminology propagates into the results table
 *      header and the report email.
 */

describe('accountingConfig — IndustryConfig contract', () => {
  // Compile-time guarantee it satisfies the interface; assigned so it's not
  // flagged as unused by noUnusedLocals.
  const typed: IndustryConfig = accountingConfig;

  it('has the expected identity', () => {
    expect(typed.slug).toBe('accounting');
    expect(typed.sourceTag).toBe('accounting-diagnostic');
    expect(typed.displayName).toBe('Accounting Firm');
  });

  it('defines exactly the seven zones, in order', () => {
    expect(accountingConfig.zones.map((z) => z.id)).toEqual([
      'lead',
      'sales',
      'delivery',
      'ops',
      'finance',
      'team',
      'owner',
    ]);
  });

  it('every zone has a description, a Think example, and two free-text prompts', () => {
    for (const z of accountingConfig.zones) {
      expect(z.name.length).toBeGreaterThan(0);
      expect(z.description.length).toBeGreaterThan(0);
      expect(z.thinkExample.toLowerCase()).toContain('think:');
      expect(z.freeText).toHaveLength(2);
      expect(z.freeText[0].key).toBe('bottleneck');
      expect(z.freeText[1].key).toBe('desiredFix');
    }
  });

  it('uses accounting "Partner involvement" terminology on the partner dimension', () => {
    expect(accountingConfig.dimensions.partnerInvolvementLabel).toBe('Partner involvement');
    // Mirrors ResultsView's header derivation: `partnerInvolvementLabel.split(' ')[0]`.
    expect(accountingConfig.dimensions.partnerInvolvementLabel.split(' ')[0]).toBe('Partner');
    expect(accountingConfig.dimensions.partnerInvolvementCaps[0]).toBe('Never');
    expect(accountingConfig.dimensions.partnerInvolvementCaps[4]).toBe("I'm the bottleneck");
  });

  it('provides four AI-usage and four margin-impact options, and four next-step cards', () => {
    expect(accountingConfig.dimensions.aiUsageOptions.map((o) => o.value)).toEqual([1, 2, 3, 4]);
    expect(accountingConfig.dimensions.marginImpactOptions.map((o) => o.value)).toEqual([1, 2, 3, 4]);
    const s = accountingConfig.nextSteps;
    for (const card of [s.contextLibrary, s.redesign, s.integrate, s.constraintShifted]) {
      expect(card.heading.length).toBeGreaterThan(0);
      expect(card.body.length).toBeGreaterThan(0);
    }
  });

  it('keeps the booking CTA and carries no Benjamin Simkin quote', () => {
    expect(accountingConfig.closing.ctaUrl).toBe(
      'https://link.storyadvantage.co.za/widget/bookings/ai-automations-debrief',
    );
    expect(accountingConfig.closing.quote).toBeUndefined();
    expect(accountingConfig.closing.quoteAttribution).toBeUndefined();
    expect(JSON.stringify(accountingConfig)).not.toMatch(/simkin/i);
  });
});

describe('active.ts — env-selectable vertical (server / process.env.VERTICAL)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('resolves the accounting edition when VERTICAL=accounting', async () => {
    vi.resetModules();
    vi.stubEnv('VERTICAL', 'accounting');
    const { activeConfig } = await import('../active');
    expect(activeConfig.slug).toBe('accounting');
    // The webhook payload's `source` is set to config.sourceTag in the screens,
    // so selecting accounting means every event carries the accounting tag.
    expect(activeConfig.sourceTag).toBe('accounting-diagnostic');
  });

  it('defaults to the accounting edition when no vertical is set (this repo is accounting-only)', async () => {
    vi.resetModules();
    vi.stubEnv('VERTICAL', '');
    const { activeConfig } = await import('../active');
    expect(activeConfig.slug).toBe('accounting');
  });

  it('still resolves the generic edition when explicitly set to generic', async () => {
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

describe('accounting terminology propagates into the report email', () => {
  function zoneRow(zone: string, o: Partial<ZoneResult> = {}): ZoneResult {
    return {
      zone,
      hoursPerWeek: 1,
      repetitiveness: 1,
      aiUsage: 'None',
      marginImpact: 'Low',
      partnerInvolvement: 1,
      compressionScore: 0,
      bottleneck: '',
      desiredFix: '',
      ...o,
    };
  }

  const event: DiagnosticCompletedEvent = {
    event: 'diagnostic_completed',
    completedAt: '2026-07-14T00:00:00.000Z',
    source: accountingConfig.sourceTag,
    lead: {
      firstName: 'Thabo',
      lastName: 'Nkosi',
      businessName: 'Nkosi & Partners',
      email: 'thabo@nkosi.co.za',
      mobile: '+27821234567',
    },
    baseline: { currency: 'ZAR', monthlyRevenue: 500000, teamSize: 12, chargeOutRate: 1000 },
    bindingConstraint: 'Client Delivery',
    constraintVotes: 3,
    constraintMonthlyCost: null,
    zones: [
      zoneRow('Lead Generation'),
      zoneRow('Sales & Onboarding'),
      zoneRow('Client Delivery', {
        hoursPerWeek: 30,
        repetitiveness: 5,
        marginImpact: 'Critical',
        partnerInvolvement: 5,
        compressionScore: 750,
      }),
      zoneRow('Operations'),
      zoneRow('Firm Finance'),
      zoneRow('Team'),
      zoneRow('Partner/Owner'),
    ],
  };

  it('carries the accounting sourceTag on the event payload', () => {
    expect(event.source).toBe('accounting-diagnostic');
  });

  it('surfaces the accounting CTA + firm example and carries no Simkin quote', () => {
    const r = renderReport(event, accountingConfig);
    expect(r.html).toContain(accountingConfig.closing.ctaText);
    expect(r.html).toContain(accountingConfig.closing.ctaUrl);
    // Benjamin Simkin's quote must be gone from the rendered report.
    expect(r.html).not.toMatch(/simkin/i);
    expect(r.text).not.toMatch(/simkin/i);
    // Client Delivery has no AI here → the "No AI usage" context-library card,
    // whose firm example is accounting-specific.
    expect(r.text).toContain(accountingConfig.nextSteps.contextLibrary.firmExample);
  });
});
