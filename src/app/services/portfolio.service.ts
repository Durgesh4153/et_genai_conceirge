import { Injectable, signal, computed } from '@angular/core';
import { Portfolio, Opportunity, JourneyStep, ServiceTile, EcosystemCoverage } from '../models';

@Injectable({ providedIn: 'root' })
export class PortfolioService {

  // ── Portfolio starts EMPTY — only populated after profiling ──────────────
  readonly portfolio = signal<Portfolio>({
    totalNetWorth:    0,
    monthlyChange:    0,
    monthlyChangePct: 0,
    allocations:      [],
  });

  /** True once a real portfolio has been generated (either via profiling or member login) */
  readonly isReady = computed(() => this.portfolio().totalNetWorth > 0);

  readonly opportunities = signal<Opportunity[]>([
    {
      id:          'opp-summit',
      name:        'ET Wealth Summit — Mar 28',
      description: 'Nilesh Shah & Prashant Jain keynoting. Matched to your wealth-building goal.',
      tag:         'event',
      urgent:      true,
      keywords:    ['event', 'summit', 'conference', 'webinar'],
      prompt:      'Tell me about ET Wealth Summit March 28',
    },
    {
      id:          'opp-hdfc',
      name:        'HDFC Home Loan — 8.35% (ET rate)',
      description: '0.3% below market. Pre-approval ready. Saves ₹2.8L over tenure.',
      tag:         'service',
      keywords:    ['home', 'house', 'loan', 'property', 'real estate', 'flat'],
      prompt:      'Tell me about HDFC Home Loan at ET negotiated rate',
    },
    {
      id:          'opp-quant',
      name:        'Quant Mid Cap — 28% 3Y CAGR',
      description: 'ET Markets top pick. Fills your mid-cap gap. Moderately high risk.',
      tag:         'market',
      keywords:    ['mid cap', 'fund', 'equity', 'invest', 'sip', 'mutual'],
      prompt:      'Tell me about Quant Mid Cap Fund returns and risk',
    },
    {
      id:          'opp-axis',
      name:        'Axis Ace Card — Pre-approved',
      description: '2% cashback, no first-year fee. Your CIBIL qualifies instantly.',
      tag:         'service',
      keywords:    ['credit card', 'cashback', 'card', 'credit', 'spend'],
      prompt:      'Tell me about the Axis Ace credit card pre-approval',
    },
  ]);

  readonly journeySteps = signal<JourneyStep[]>([
    { number: 1, label: 'Profile & Risk Assessment',   status: 'done',    pts: 10 },
    { number: 2, label: 'ET Prime Subscription',       status: 'done',    pts: 10 },
    { number: 3, label: 'Portfolio Sync & Analysis',   status: 'active',  pts: 15 },
    { number: 4, label: 'Connect Financial Services',  status: 'pending', pts: 20 },
    { number: 5, label: 'Attend ET Wealth Event',      status: 'pending', pts: 15 },
    { number: 6, label: 'Complete Masterclass Series', status: 'pending', pts: 15 },
  ]);

  readonly serviceTiles = signal<ServiceTile[]>([
    { icon: '💳', name: 'Credit Cards',  action: '4 matched',  prompt: 'Show best credit cards matched to my profile',          hot: true  },
    { icon: '🏠', name: 'Home Loans',    action: 'Compare →',  prompt: 'Compare home loan rates across ET partner banks',       hot: false },
    { icon: '🛡️', name: 'Insurance',    action: 'Gap found',  prompt: 'Analyse my insurance gap and recommend term cover',     hot: true  },
    { icon: '📈', name: 'Wealth Mgmt',  action: 'Unlock',     prompt: 'Tell me about ET Wealth Management advisory service',   hot: false },
  ]);

  readonly ecosystemCoverage = signal<EcosystemCoverage[]>([
    { name: 'ET Prime',           status: 'active',  pts: 10 },
    { name: 'ET Markets',         status: 'partial', value: '~40%', pts: 8  },
    { name: 'Masterclasses',      status: 'partial', value: '~20%', pts: 4  },
    { name: 'Financial Services', status: 'locked',  pts: 0  },
    { name: 'Wealth Events',      status: 'locked',  pts: 0  },
  ]);

  formatCurrency(value: number): string {
    if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)}Cr`;
    if (value >= 100_000)    return `₹${(value / 100_000).toFixed(1)}L`;
    if (value >= 1_000)      return `₹${(value / 1_000).toFixed(0)}K`;
    return `₹${value}`;
  }

  getOpportunityByKeyword(input: string): Opportunity | null {
    const t = input.toLowerCase();
    return this.opportunities().find(o =>
      o.keywords.some(kw => t.includes(kw))
    ) ?? null;
  }

  // ── Deterministic portfolio generation based on profile answers ──────────
  updatePortfolioFromProfile(profile: any): void {
    const pf = profile.currentPortfolio;
    let baseNW: number;

    // Map investable surplus → estimated net worth (deterministic, no randomness)
    if (typeof pf === 'string') {
      if (pf.includes('<'))          baseNW = 4_00_000;
      else if (pf.includes('20L)'))  baseNW = 15_00_000;
      else if (pf.includes('1Cr)'))  baseNW = 60_00_000;
      else if (pf.includes('1Cr+'))  baseNW = 1_50_00_000;
      else                           baseNW = 50_00_000;
    } else {
      baseNW = 50_00_000;
    }

    // Adjust allocation based on goal
    const goal = (profile.goal ?? '').toLowerCase();
    let eqPct = 45, stPct = 15, dePct = 25, goPct = 15;

    if (goal.includes('grow'))      { eqPct = 55; stPct = 20; dePct = 15; goPct = 10; }
    else if (goal.includes('protect')) { eqPct = 20; stPct = 10; dePct = 50; goPct = 20; }
    else if (goal.includes('milestone')) { eqPct = 40; stPct = 15; dePct = 35; goPct = 10; }
    else if (goal.includes('credit'))   { eqPct = 30; stPct = 15; dePct = 40; goPct = 15; }

    // Adjust growth expectations based on horizon
    const horizon = (profile.horizon ?? '').toLowerCase();
    let momPct = 3.2;
    if (horizon.includes('10+'))       momPct = 5.8;
    else if (horizon.includes('5–10')) momPct = 4.5;
    else if (horizon.includes('2–5'))  momPct = 3.2;
    else if (horizon.includes('less')) momPct = 1.8;

    const monthlyChange = Math.floor(baseNW * (momPct / 100));

    this.portfolio.set({
      totalNetWorth:    baseNW,
      monthlyChange,
      monthlyChangePct: momPct,
      allocations: [
        { name: 'Equity MFs',    percentage: eqPct, value: Math.floor(baseNW * eqPct / 100), color: 'var(--gold)',  change: +(momPct * 1.2).toFixed(1) },
        { name: 'Direct Stocks', percentage: stPct, value: Math.floor(baseNW * stPct / 100), color: 'var(--blue)',  change: +(momPct * 0.8).toFixed(1) },
        { name: 'FD / Debt',     percentage: dePct, value: Math.floor(baseNW * dePct / 100), color: 'var(--green)', change: +(momPct * 0.2).toFixed(1) },
        { name: 'Gold / RE',     percentage: goPct, value: Math.floor(baseNW * goPct / 100), color: 'var(--amber)', change: +(momPct * 0.15).toFixed(1) },
      ],
    });
  }

  // ── Pre-built member portfolio (for "Already a Member" flow) ────────────
  loadMemberPortfolio(): void {
    this.portfolio.set({
      totalNetWorth:    1_20_00_000,
      monthlyChange:    5_40_000,
      monthlyChangePct: 4.7,
      allocations: [
        { name: 'Equity MFs',    percentage: 48, value: 57_60_000, color: 'var(--gold)',  change: 5.2 },
        { name: 'Direct Stocks', percentage: 22, value: 26_40_000, color: 'var(--blue)',  change: 3.8 },
        { name: 'FD / Debt',     percentage: 18, value: 21_60_000, color: 'var(--green)', change: 0.6 },
        { name: 'Gold / RE',     percentage: 12, value: 14_40_000, color: 'var(--amber)', change: 1.2 },
      ],
    });
  }
}
