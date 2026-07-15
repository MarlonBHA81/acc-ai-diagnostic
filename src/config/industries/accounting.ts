import type { IndustryConfig } from '../IndustryConfig';

/**
 * Accounting Firm Edition — vertical #1 (route: /accounting).
 *
 * Structure, scoring, results layout, dimension options, next-step logic, and
 * the Simkin quote are ported from the prototype worksheet. The two deliberate
 * changes from the prototype are baked in elsewhere (lead capture up front;
 * multi-currency). The accounting-specific copy — zone descriptions, "Think:"
 * lines, AI-usage descriptions, "Partner involvement" terminology, the busy-
 * season note, and the charge-out-rate label — is the accounting adaptation of
 * the generic prototype, written in the Story Advantage voice (plain, direct,
 * customer-is-the-hero, no hype).
 */
export const accountingConfig: IndustryConfig = {
  slug: 'accounting',
  sourceTag: 'accounting-diagnostic',
  displayName: 'Accounting Firm',

  welcome: {
    headline: 'Where should AI go **first** in your firm?',
    subhead:
      "Score the seven zones of your practice — from lead generation through to your own partner time — across five dimensions. The math points to your binding constraint: the one bottleneck to fix first. About 10–15 minutes; answer with what's actually happening, not what the website says. We'll email your full report when you're done.",
  },

  baseline: {
    revenueLabel: 'Monthly fee revenue',
    teamSizeLabel: 'Team size (partners + staff)',
    chargeOutRateLabel: 'Blended charge-out rate',
    chargeOutRateNote:
      'Optional. Per hour, in the currency above. We use it to price your constraint in billable-equivalent capacity.',
    busySeasonNote:
      'Give hours as a realistic annual average, with tax/busy season weighted in — not a quiet-month snapshot.',
  },

  dimensions: {
    hoursLabel: 'Time consumed',
    hoursHint:
      "Total hours per week the firm (partners + staff) spends in this zone. Give a real number — “a lot” doesn't score.",

    repetitivenessLabel: 'Repetitiveness',
    repetitivenessHint:
      '1 = bespoke (complex advisory), different every file · 5 = process-driven (standard returns, recs, chasing).',
    repetitivenessCaps: ['Bespoke', '', 'Mixed', '', 'Process-driven'],

    aiUsageLabel: 'Current AI usage',
    aiUsageHint:
      "Be honest — a Copilot licence nobody uses doesn't count, and the OCR in your tax software from 2015 isn't AI-first.",
    aiUsageOptions: [
      { value: 1, label: 'None', description: 'No AI tools or systems in this part of the firm.' },
      { value: 2, label: 'Basic', description: 'Occasional tasks — e.g. ChatGPT for client emails or memo drafts.' },
      { value: 3, label: 'Moderate', description: 'Integrated — e.g. AI coding transactions or drafting workpapers.' },
      { value: 4, label: 'Advanced', description: 'Load-bearing — the process is redesigned around AI, and humans review exceptions.' },
    ],

    marginImpactLabel: 'Margin impact',
    marginImpactHint: 'How much does this zone affect the firm’s profitability?',
    marginImpactOptions: [
      { value: 1, label: 'Low', description: 'Minimal effect on firm profitability.' },
      { value: 2, label: 'Medium', description: 'Improvements here would noticeably improve margins.' },
      { value: 3, label: 'High', description: "Directly drives margin — changes here move the firm's P&L." },
      { value: 4, label: 'Critical', description: "This is where the firm's realization and margin live or die." },
    ],

    partnerInvolvementLabel: 'Partner involvement',
    partnerInvolvementHint:
      '1 = a partner never touches this zone · 5 = nothing moves without a partner.',
    partnerInvolvementCaps: ['Never', '', 'Shared', '', "I'm the bottleneck"],
  },

  zones: [
    {
      id: 'lead',
      name: 'Lead Generation',
      description:
        'How your firm attracts prospective clients — referrals, your website, content, networking, and partner introductions.',
      thinkExample:
        'Think: referral-partner nurturing, LinkedIn and newsletter content, tax-deadline campaigns, webinars, Google reviews, networking with bankers and lawyers.',
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. Referrals come in but nobody follows up consistently…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: 'e.g. Draft and schedule the follow-up sequence automatically…' },
      ],
    },
    {
      id: 'sales',
      name: 'Sales & Onboarding',
      description:
        'How a prospect becomes a client — scoping calls, proposals and engagement letters, pricing, and getting them set up in your systems.',
      thinkExample:
        'Think: discovery calls, scoping and fee quoting, proposal drafting, engagement letters, KYC/AML checks, collecting prior-year records and logins.',
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. Every proposal is written from scratch…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: 'e.g. Generate the engagement letter and onboarding checklist from the scoping notes…' },
      ],
    },
    {
      id: 'delivery',
      name: 'Client Delivery',
      description:
        'The billable work itself — tax returns, VAT/BAS, payroll, bookkeeping, month-end close, workpaper prep, and the prep→review loop.',
      thinkExample:
        'Think: tax returns, VAT/BAS, payroll, bookkeeping, month-end close, workpaper prep, reconciliations, review notes, client queries, the prep→review loop.',
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. Juniors prepare, but everything bottlenecks at manager/partner review — review notes go back and forth for days…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: 'e.g. First-pass workpapers, transaction coding, and draft client query lists produced by AI before a human touches the file…' },
      ],
    },
    {
      id: 'ops',
      name: 'Operations',
      description:
        'The machinery that keeps the firm running — workflow, deadlines, internal comms, document management, and admin.',
      thinkExample:
        'Think: job status tracking, deadline and filing calendars, chasing clients for documents, scheduling, email triage.',
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. Deadlines tracked in three different places…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: 'e.g. Auto-chase clients for outstanding records and flag jobs at risk…' },
      ],
    },
    {
      id: 'finance',
      name: 'Firm Finance',
      description:
        "Your own firm's money — the cobbler's children's shoes. Billing, collections, WIP, and cash flow.",
      thinkExample:
        "Think: WIP write-offs, invoicing lag, AR chasing, realization reports, and the firm's own cash-flow forecasting.",
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. WIP sits unbilled for weeks…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: 'e.g. Draft invoices from time entries and auto-chase overdue fees…' },
      ],
    },
    {
      id: 'team',
      name: 'Team',
      description:
        'Growing and running the people in the firm — hiring, busy-season staffing, training juniors, and coaching.',
      thinkExample:
        'Think: hiring and busy-season staffing, training juniors, answering the same questions repeatedly, review-note coaching, performance reviews.',
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. Onboarding a new hire eats a senior’s week…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: 'e.g. A living training library new staff can query…' },
      ],
    },
    {
      id: 'owner',
      name: 'Partner/Owner',
      description:
        'The thinking work only a partner can do — strategy, pricing, key client relationships, technical sign-off, and high-value advisory.',
      thinkExample:
        'Think: final review and sign-off, the partner review bottleneck, client firefighting, pricing decisions, firm strategy, high-value advisory.',
      freeText: [
        { key: 'bottleneck', label: "What are you spending time on that isn't strategy, pricing, or high-value advisory?", placeholder: 'e.g. Reviewing every return, client firefighting, chasing status updates…' },
        { key: 'desiredFix', label: 'What would you do with 10 extra hours per week?', placeholder: 'e.g. Build the advisory offer, partner relationships, actual strategy and pricing…' },
      ],
    },
  ],

  nextSteps: {
    contextLibrary: {
      heading: 'No AI usage in this zone',
      body: 'Build your context library first — the documented rules, templates, and examples AI needs to do this work your way. Then point AI at the highest-volume repetitive task in this zone.',
      firmExample:
        'In a firm, that looks like: engagement-letter templates, your standard fee schedule, firm tone-of-voice, answers to common client queries, and a review checklist — the context AI needs to work your way.',
    },
    redesign: {
      heading: 'Basic AI usage in this zone',
      body: "You've added tools but haven't redesigned the workflow. Ask: “If I were building this zone today from scratch, what would it look like?” Then redesign the process — don't just bolt AI onto the old one.",
      firmExample:
        'In a firm, that looks like: rebuilding the prep→review loop so partners see one clean pass instead of three messy ones — not bolting AI onto the old workflow.',
    },
    integrate: {
      heading: 'Moderate AI usage in this zone',
      body: "You're partway there. The next step is integration — connect this zone's AI to the rest of the firm so data flows and compounds instead of living in one person's chat window.",
      firmExample:
        'In a firm, that looks like: your practice-management, ledger, and drafting tools sharing context, so a client record updates once and flows everywhere.',
    },
    constraintShifted: {
      heading: 'Advanced AI usage in this zone',
      body: 'This zone is already AI-first — your binding constraint has shifted. Repeat the diagnostic on your second-highest-scoring zone and put your leverage there.',
      firmExample:
        'In a firm, that looks like: delivery is largely automated, so the real bottleneck moves upstream — to how fast you can win and onboard the right clients.',
    },
  },

  closing: {
    quote:
      'Identify the binding constraint. Apply AI to it with proper context and documentation. Verify that the constraint is solved. Identify the new constraint that has emerged. Repeat.',
    quoteAttribution: 'Benjamin Simkin, The AI First Company',
    reRunNote: 'Re-run this every 90 days — and again after busy season — and compare.',
    ctaText: 'Book your AI Automations Debrief',
    ctaUrl: 'https://link.storyadvantage.co.za/widget/bookings/ai-automations-debrief',
  },
};

export default accountingConfig;
