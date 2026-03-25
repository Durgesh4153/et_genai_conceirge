import { Injectable, signal } from '@angular/core';
import { Portfolio, Opportunity, JourneyStep, ServiceTile, EcosystemCoverage } from '../models';

@Injectable({ providedIn: 'root' })
export class PortfolioService {

  readonly portfolio = signal<Portfolio>({
    totalNetWorth:    62_400_000,
    monthlyChange:    3_100_000,
    monthlyChangePct: 5.2,
    allocations: [
      { name: 'Equity MFs',    percentage: 55, value: 34_320_000, color: 'var(--gold)',  change: 2.4  },
      { name: 'Direct Stocks', percentage: 18, value: 11_232_000, color: 'var(--blue)',  change: 1.8  },
      { name: 'FD / Debt',     percentage: 15, value:  9_360_000, color: 'var(--green)', change: 0.6  },
      { name: 'Gold / RE',     percentage: 12, value:  7_488_000, color: 'var(--amber)', change: 0.3  },
    ],
  });

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
      description: '2% cashback, no first-year fee. Your CIBIL 786 qualifies instantly.',
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

  // Called by Opportunity Agent when a keyword match is detected
  getOpportunityByKeyword(input: string): Opportunity | null {
    const t = input.toLowerCase();
    return this.opportunities().find(o =>
      o.keywords.some(kw => t.includes(kw))
    ) ?? null;
  }
}
