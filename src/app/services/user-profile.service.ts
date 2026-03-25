import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, ProfilingQuestion, AgentStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class UserProfileService {

  readonly profile = signal<UserProfile>({
    id:                'user-001',
    name:              'Rohan Mehta',
    initials:          'RM',
    tier:              'wealth',
    discoveryScore:    68,
    creditScore:       786,
    annualIncome:      1_800_000,
    monthlyInvestable: 100_000,
    goal:              null,
    horizon:           null,
    etUsage:           null,
    blindSpot:         null,
    profileComplete:   false,
  });

  readonly showProfilingModal = signal<boolean>(true);
  readonly profilingStep      = signal<number>(0);
  readonly selectedOption     = signal<string | null>(null);

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

  private completeProfile(): void {
    this.profile.update(p => ({
      ...p,
      profileComplete:  true,
      discoveryScore:   Math.min(p.discoveryScore + 15, 100),
    }));
    this.showProfilingModal.set(false);
    this.activateAgents(['navigator', 'opportunity', 'fulfilment']);
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
      `Monthly Investable: ₹${(p.monthlyInvestable / 1000).toFixed(0)}K`,
      `Primary Goal: ${p.goal ?? 'Not specified'}`,
      `Investment Horizon: ${p.horizon ?? 'Not specified'}`,
      `ET Usage: ${p.etUsage ?? 'Not specified'}`,
      `Financial Blind Spot: ${p.blindSpot ?? 'Not specified'}`,
      `Discovery Score: ${p.discoveryScore}/100`,
    ].join('\n');
  }
}
