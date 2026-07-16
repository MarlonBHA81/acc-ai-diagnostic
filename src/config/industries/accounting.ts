import type { IndustryConfig } from '../IndustryConfig';

/**
 * Accounting Firm Edition — vertical #1 (route: /accounting).
 *
 * Copy is ported from the source-of-truth prototype worksheet
 * (`7-zone-diagnostic-accounting-firm.html`). Structure, scoring, results layout,
 * dimension options, and next-step logic are shared/industry-agnostic; only this
 * vertical copy differs. The two deliberate framework changes from the prototype
 * (lead capture up front; multi-currency) live elsewhere in the app.
 */
export const accountingConfig: IndustryConfig = {
  slug: 'accounting',
  sourceTag: 'accounting-diagnostic',
  displayName: 'Accounting Firm',

  welcome: {
    headline: 'Where should AI go **first** in your firm?',
    subhead:
      "Score the seven zones of your practice — from lead generation through to your own partner time — across five dimensions. The math will point at your binding constraint: the one bottleneck limiting the whole firm. Score what's actually happening, not what the website says. Roughly 10–15 minutes.",
  },

  baseline: {
    revenueLabel: 'Monthly fee revenue',
    teamSizeLabel: 'Team size (partners + staff)',
    chargeOutRateLabel: 'Blended charge-out rate',
    chargeOutRateNote:
      'Optional — used to price your constraint in lost billable capacity per month.',
    busySeasonNote:
      "For hours-per-week questions, use a realistic annual average. If tax season doubles a zone's load for 3 months, weight it in rather than scoring your quietest week.",
  },

  dimensions: {
    hoursLabel: 'Time consumed',
    hoursHint:
      'Total hours per week the firm (partners + staff) spends in this zone, averaged across the year — weight busy season in. A real number, not “a lot”.',

    repetitivenessLabel: 'Repetitiveness',
    repetitivenessHint:
      '1 = bespoke judgment every time (complex advisory) · 5 = highly repetitive, pattern-based, checklist-driven (standard returns, recs, chasing).',
    repetitivenessCaps: ['Bespoke', '', 'Mixed', '', 'Process-driven'],

    aiUsageLabel: 'Current AI usage',
    aiUsageHint:
      "Be honest — a Copilot licence nobody uses doesn't count, and OCR in your tax software from 2015 isn't AI-first.",
    aiUsageOptions: [
      { value: 1, label: 'None', description: 'No AI tools or systems in this zone.' },
      { value: 2, label: 'Basic', description: 'Occasional tasks — e.g. ChatGPT for client emails or memo drafts.' },
      { value: 3, label: 'Moderate', description: 'Integrated into regular workflows — saving measurable hours (e.g. AI coding transactions, drafting workpapers).' },
      { value: 4, label: 'Advanced', description: 'Load-bearing — the process was redesigned around AI, humans review exceptions.' },
    ],

    marginImpactLabel: 'Margin impact',
    marginImpactHint:
      "How much does this zone affect the firm's profitability — realization, recovery, write-offs, capacity?",
    marginImpactOptions: [
      { value: 1, label: 'Low', description: 'Minimal effect on firm profitability.' },
      { value: 2, label: 'Medium', description: 'Improvements would noticeably lift recovery or margin.' },
      { value: 3, label: 'High', description: "Directly drives margin — changes here move the firm's P&L." },
      { value: 4, label: 'Critical', description: 'This is where realization and margin live or die.' },
    ],

    partnerInvolvementLabel: 'Partner involvement',
    partnerInvolvementHint:
      '1 = partners never touch this zone · 5 = nothing moves without a partner.',
    partnerInvolvementCaps: ['Never', '', 'Shared', '', "I'm the bottleneck"],
  },

  zones: [
    {
      id: 'lead',
      name: 'Lead Generation',
      description:
        'How new clients find the firm — referrals, professional networks, content, seminars, directories, local presence.',
      thinkExample:
        'Think: referral partner nurturing, LinkedIn/newsletter content, tax-deadline campaigns, webinars, Google reviews.',
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. We rely almost entirely on referrals — no system generates leads without a partner networking…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: 'e.g. A monthly client newsletter and tax-update content that goes out without a partner writing it…' },
      ],
    },
    {
      id: 'sales',
      name: 'Sales & Onboarding',
      description:
        'How enquiries become engaged clients — discovery calls, scoping, pricing, proposals, engagement letters, onboarding.',
      thinkExample:
        'Think: fee quoting, proposal drafting, engagement letters, AML/KYC checks, collecting prior-year records and logins.',
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. Every proposal is scoped from scratch by a partner; onboarding drags for weeks chasing documents…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: 'e.g. Proposals and engagement letters drafted from a call transcript in our standard terms, ready for partner sign-off…' },
      ],
    },
    {
      id: 'delivery',
      name: 'Client Delivery',
      description:
        'The billable work itself — tax returns, bookkeeping, month-end close, financial statements, audits, advisory.',
      thinkExample:
        'Think: data entry and coding, workpaper prep, reconciliations, return preparation, review notes, client queries.',
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. Juniors prepare, but everything bottlenecks at manager/partner review — review notes go back and forth for days…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: 'e.g. First-pass workpapers, transaction coding, and draft client query lists produced by AI before a human touches the file…' },
      ],
    },
    {
      id: 'ops',
      name: 'Operations',
      description:
        'The machinery around the billable work — workflow and deadline tracking, document chasing, internal comms, scheduling, admin.',
      thinkExample:
        'Think: job status tracking, deadline lists (tax/filing calendars), chasing clients for documents, meeting scheduling, email triage.',
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. Half our admin time is chasing clients for missing documents and updating job statuses manually…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: 'e.g. Automated document chasing with escalation, and job statuses that update themselves from our practice software…' },
      ],
    },
    {
      id: 'finance',
      name: 'Firm Finance',
      description:
        "The firm's own money — WIP, billing, debtors, realization and recovery rates, forecasting. (The cobbler's children's shoes.)",
      thinkExample:
        'Think: WIP write-offs, invoicing lag, AR chasing, partner realization reports, cash-flow forecasting for the firm itself.',
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. Billing happens in a monthly scramble; WIP sits unbilled for 60+ days and write-offs hide in the numbers…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: 'e.g. Draft bills generated from time records weekly, with automated debtor follow-up and a live realization dashboard…' },
      ],
    },
    {
      id: 'team',
      name: 'Team',
      description:
        'Hiring, onboarding new staff, training juniors, busy-season staffing, performance management.',
      thinkExample:
        'Think: recruiting accountants, teaching firm methodology, answering the same junior questions repeatedly, review-note coaching.',
      freeText: [
        { key: 'bottleneck', label: "What's the biggest bottleneck in this zone?", placeholder: 'e.g. Seniors spend hours answering questions the firm has answered a hundred times; new hires take 6 months to be productive…' },
        { key: 'desiredFix', label: 'If you could fix one thing here with AI, what would it be?', placeholder: "e.g. A firm knowledge base that answers 'how do we treat X' questions instantly, trained on our own files and SOPs…" },
      ],
    },
    {
      id: 'owner',
      name: 'Partner / Owner',
      description:
        'Your own time — strategy, pricing, firm direction, advisory relationships. The thinking work only you can do.',
      thinkExample:
        'Think: how much of your week is final review, client firefighting, and admin vs. actual firm architecture and high-value advisory.',
      freeText: [
        { key: 'bottleneck', label: "What are you spending time on that isn't strategy, pricing, or high-value advisory?", placeholder: 'e.g. Reviewing every return and signing every letter; being the escalation point for every client complaint…' },
        { key: 'desiredFix', label: 'What would you do with 10 extra hours per week?', placeholder: "e.g. Move into advisory work we currently can't sell because my week is consumed by compliance review…" },
      ],
    },
  ],

  nextSteps: {
    contextLibrary: {
      heading: 'No AI usage in this zone',
      body: 'Build your context library first (Context Library Blueprint), then deploy AI to the highest-volume repetitive task in this zone. Then run the Constraint Identification worksheet to validate and dollarise the bottleneck, followed by the Buy / Build / Wait matrix before subscribing to anything.',
      firmExample:
        'For a firm, the context library means: your engagement letter templates, standard fee schedule, firm tone-of-voice for client emails, common client query answers, and your review checklist — the documents that make AI output sound like your firm, not a chatbot.',
    },
    redesign: {
      heading: 'Basic AI usage in this zone',
      body: 'You\'ve added tools but haven\'t redesigned the workflow. Ask: “If we were building this part of the practice today, from scratch, with the tools that now exist — would it look like this?” Then redesign it — don\'t just speed up the old process. Then run the Constraint Identification worksheet to validate and dollarise the bottleneck, followed by the Buy / Build / Wait matrix before subscribing to anything.',
      firmExample:
        'Retrofit: staff use ChatGPT to draft client emails faster. Redesign: client queries are answered from a firm knowledge base with a human approving exceptions, and the prep→review loop is rebuilt so partners see one clean pass instead of three messy ones.',
    },
    integrate: {
      heading: 'Moderate AI usage in this zone',
      body: "You're partway there. The next step is integration — connect this zone's AI systems to the rest of the practice so data flows and compounds. Then run the Constraint Identification worksheet to validate and dollarise the bottleneck, followed by the Buy / Build / Wait matrix before subscribing to anything.",
      firmExample:
        'Example: your AI transaction coding should feed the workpapers, which feed the draft financials, which feed the client letter and the WIP/billing system — one flow, not four disconnected tools.',
    },
    constraintShifted: {
      heading: 'Advanced AI usage in this zone',
      body: 'This zone is already AI-first — your binding constraint has shifted. Repeat the process on your next-highest scoring zone. Then run the Constraint Identification worksheet to validate and dollarise the bottleneck, followed by the Buy / Build / Wait matrix before subscribing to anything.',
      firmExample: '',
    },
  },

  terminology: {
    // Results/email cost line reads as billable-equivalent capacity:
    // "At your charge-out rate, this zone consumes {hours} hrs/wk × 4.33 × {rate}
    //  = {amount}/month of billable-equivalent capacity."
    costLinePrefix: 'At your charge-out rate, this zone consumes',
    costLineSuffix: 'of billable-equivalent capacity',
    costLineTip:
      'Tip: add your blended charge-out rate on the baseline screen to price this constraint in billable-equivalent capacity.',
    emailSubjectTemplate: "{first}, your firm's binding constraint is {constraint}",
  },

  synthesis: {
    volumeTail: 'This is where AI recovers the most raw hours — and in a firm, hours are inventory.',
    marginTail: "You're spending in a realization-critical zone without compressing it.",
    partnerTail:
      'Solving this frees the scarcest resource in the firm: partner attention — the only hours that can sell advisory.',
  },

  closing: {
    // No pull-quote for the accounting edition.
    reRunNote: 'Re-run every 90 days — and after busy season.',
    ctaText: 'Book your AI Automations Debrief',
    ctaUrl: 'https://link.storyadvantage.co.za/widget/bookings/ai-automations-debrief',
  },
};

export default accountingConfig;
