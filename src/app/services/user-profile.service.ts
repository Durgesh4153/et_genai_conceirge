import { Injectable, signal, computed, inject } from '@angular/core';
import { UserProfile, ProfilingQuestion, AgentStatus } from '../models';
import { PortfolioService } from './portfolio.service';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private portfolioService = inject(PortfolioService);

  readonly profile = signal<UserProfile>({
    id:                'user-001',
    name:              'Durgesh Nandan',
    initials:          'DN',
    tier:              'wealth',
    discoveryScore:    12,         // Start LOW — "most users discover only 10%"
    creditScore:       786,
    annualIncome:      1_800_000,
    monthlyInvestable: 100_000,
    goal:              null,
    horizon:           null,
    etUsage:           null,
    blindSpot:         null,
    currentPortfolio:  null,
    profileComplete:   false,
  });

  readonly showProfilingModal = signal<boolean>(true);
  readonly profilingStep      = signal<number>(0);
  readonly selectedOption     = signal<string | null>(null);

  // ── Discovery Score breakdown — tracks which ET touchpoints the user has explored ──
  readonly discoveryBreakdown = signal<Record<string, { unlocked: boolean; pts: number; label: string }>>({
    profile:      { unlocked: false, pts: 15, label: 'Profile & Risk Assessment' },
    primeContent: { unlocked: false, pts: 10, label: 'ET Prime Articles' },
    markets:      { unlocked: false, pts: 12, label: 'ET Markets & Portfolio' },
    services:     { unlocked: false, pts: 10, label: 'Financial Services Hub' },
    masterclass:  { unlocked: false, pts: 10, label: 'ET Masterclasses' },
    events:       { unlocked: false, pts: 8,  label: 'Wealth Events' },
    crossSell:    { unlocked: false, pts: 10, label: 'Cross-Sell Opportunity' },
    portfolioSync:{ unlocked: false, pts: 15, label: 'Portfolio Sync & Analysis' },
    goalSetting:  { unlocked: false, pts: 10, label: 'Financial Goal Setting' },
  });

  /** Computed score from actual interactions — no static jumps */
  readonly computedScore = computed(() => {
    const base = 12; // Everyone starts with 12 (just having an account)
    const breakdown = this.discoveryBreakdown();
    let earned = 0;
    for (const key of Object.keys(breakdown)) {
      if (breakdown[key].unlocked) earned += breakdown[key].pts;
    }
    return Math.min(base + earned, 100);
  });

  /** Score tier label */
  readonly scoreTierLabel = computed(() => {
    const s = this.computedScore();
    if (s >= 85) return 'Elite Explorer · ET Wealth RM unlocked';
    if (s >= 60) return 'Power User · 3 more services to unlock RM';
    if (s >= 35) return 'Getting started · explore more of ET';
    return 'New user · discover the ET ecosystem';
  });

  /** Percentage of ET ecosystem explored */
  readonly ecosystemPct = computed(() => {
    const bd = this.discoveryBreakdown();
    const total = Object.keys(bd).length;
    const unlocked = Object.values(bd).filter(v => v.unlocked).length;
    return Math.round((unlocked / total) * 100);
  });

  readonly tierLabel = computed(() => {
    switch (this.profile().tier) {
      case 'wealth': return 'ET Prime — Wealth Tier';
      case 'prime':  return 'ET Prime';
      default:       return 'ET Standard';
    }
  });

  readonly agentStatuses = signal<AgentStatus[]>([
    { type: 'profiling',    label: 'Profiling Agent',    active: true,  pulse: true  },
    { type: 'navigator',    label: 'Navigator Agent',    active: false, pulse: false },
    { type: 'opportunity',  label: 'Opportunity Agent',  active: false, pulse: false },
    { type: 'fulfilment',   label: 'Fulfilment Agent',   active: false, pulse: false },
  ]);

  readonly profilingQuestions: ProfilingQuestion[] = [
    {
      question: 'What is your estimated current portfolio value?',
      options:  ['Start fresh (< ₹5 Lakhs)', 'Building (₹5L - ₹20L)', 'Established (₹20L - ₹1Cr)', 'Wealth (₹1Cr+)'],
      field: 'currentPortfolio',
    },
    {
      question: 'What is your primary financial goal right now?',
      options:  [
        'Grow my wealth — equity, mutual funds, alternatives',
        'Protect & diversify — insurance, bonds, FDs',
        'Plan a big milestone — home, education, retirement',
        'Optimize credit & debt — loans, credit score',
      ],
      field: 'goal',
    },
    {
      question: 'What is your investment time horizon?',
      options:  ['Less than 2 years', '2–5 years', '5–10 years', '10+ years'],
      field: 'horizon',
    },
    {
      question: 'What is your monthly investable surplus?',
      options:  ['Under ₹10,000', '₹10,000–50,000', '₹50,000–2L', 'Over ₹2L'],
      field: 'monthlyInvestable',
    },
    {
      question: 'Which ET services are you currently using?',
      options:  [
        'Only reading ET articles',
        'ET Prime subscriber',
        'ET Markets (stocks & MFs)',
        'Multiple ET services',
      ],
      field: 'etUsage',
    },
    {
      question: 'What is your biggest financial blind spot?',
      options:  ['Tax optimisation', 'Insurance coverage', 'Portfolio rebalancing', 'New product awareness'],
      field: 'blindSpot',
    },
  ];

  currentQuestion = computed(() => this.profilingQuestions[this.profilingStep()] ?? null);
  isLastQuestion  = computed(() => this.profilingStep() === this.profilingQuestions.length - 1);

  selectOption(option: string): void {
    this.selectedOption.set(option);
  }

  nextQuestion(): void {
    const ans = this.selectedOption();
    const q   = this.currentQuestion();

    if (ans && q) {
      this.profile.update(p => ({ ...p, [q.field]: ans }));
      this.portfolioService.updatePortfolioFromProfile(this.profile());
    }

    if (this.isLastQuestion()) {
      this.completeProfile();
      return;
    }

    this.profilingStep.update(s => s + 1);
    this.selectedOption.set(null);
  }

  skipProfile(): void {
    this.showProfilingModal.set(false);
    this.activateAgents(['navigator', 'opportunity']);
  }

  /** "Already a Member" — skip questionnaire, load pre-built portfolio, unlock discovery */
  loginAsMember(): void {
    this.initializeMemberProfile();
    this.showProfilingModal.set(false);
  }

  /**
   * Sets up member profile WITHOUT closing the modal.
   * Call this from the profiling modal during the sign-in animation,
   * then let the modal component close itself after the welcome screen.
   */
  initializeMemberProfile(): void {
    this.profile.update(p => ({
      ...p,
      goal: 'Grow my wealth — equity, mutual funds, alternatives',
      horizon: '10+ years',
      etUsage: 'Multiple ET services',
      blindSpot: 'Portfolio rebalancing',
      currentPortfolio: 'Wealth (₹1Cr+)',
      profileComplete: true,
    }));
    this.portfolioService.loadMemberPortfolio();
    // Unlock several discovery touchpoints for a returning member
    this.unlockDiscovery('profile');
    this.unlockDiscovery('primeContent');
    this.unlockDiscovery('portfolioSync');
    this.activateAgents(['navigator', 'opportunity', 'fulfilment']);
  }

  private completeProfile(): void {
    this.profile.update(p => ({
      ...p,
      profileComplete: true,
    }));
    this.portfolioService.updatePortfolioFromProfile(this.profile());
    this.unlockDiscovery('profile');
    this.unlockDiscovery('portfolioSync');
    this.showProfilingModal.set(false);
    this.activateAgents(['navigator', 'opportunity', 'fulfilment']);
  }

  /** Unlock a discovery touchpoint — this is the core of the hackathon pitch */
  unlockDiscovery(key: string): void {
    this.discoveryBreakdown.update(bd => {
      if (bd[key] && !bd[key].unlocked) {
        return { ...bd, [key]: { ...bd[key], unlocked: true } };
      }
      return bd;
    });
    // Sync score into profile for context summary
    this.profile.update(p => ({ ...p, discoveryScore: this.computedScore() }));
  }

  activateAgents(types: string[]): void {
    this.agentStatuses.update(agents =>
      agents.map(a => ({
        ...a,
        active: types.includes(a.type) ? true : a.active,
        pulse:  types.includes(a.type) ? true : a.pulse,
      }))
    );
  }

  buildContextSummary(): string {
    const p = this.profile();
    return [
      `Name: ${p.name}`,
      `ET Tier: ${this.tierLabel()}`,
      `Credit Score: ${p.creditScore}`,
      `Annual Income: ₹${(p.annualIncome / 100000).toFixed(0)}L`,
      `Primary Goal: ${p.goal ?? 'Not specified'}`,
      `Investment Horizon: ${p.horizon ?? 'Not specified'}`,
      `ET Usage: ${p.etUsage ?? 'Not specified'}`,
      `Financial Blind Spot: ${p.blindSpot ?? 'Not specified'}`,
      `Discovery Score: ${this.computedScore()}/100 (${this.ecosystemPct()}% of ET explored)`,
    ].join('\n');
  }
}
