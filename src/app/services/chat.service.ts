import { Injectable, signal, inject } from '@angular/core';
import { ChatMessage, InsightCard, XSellItem, RecommendationChip, ActionItem, AgentType } from '../models';
import { GeminiService } from './gemini.service';
import { MarketService } from './market.service';
import { UserProfileService } from './user-profile.service';
import { PortfolioService } from './portfolio.service';

@Injectable({ providedIn: 'root' })
export class ChatService {

  // ── Injected services ─────────────────────────────────────────────────────
  private gemini    = inject(GeminiService);
  private market    = inject(MarketService);
  private userSvc   = inject(UserProfileService);
  private portfolio = inject(PortfolioService);

  // ── State ──────────────────────────────────────────────────────────────────
  readonly messages    = signal<ChatMessage[]>([]);
  readonly isTyping    = signal<boolean>(false);
  readonly activeMode  = signal<'Navigator' | 'Markets' | 'Services' | 'Goals'>('Navigator');
  readonly activeAgent = signal<AgentType>('navigator');
  readonly interruptPending = signal<boolean>(false);

  readonly quickPrompts = [
    'Show my portfolio snapshot',
    'How are the markets doing today?',
    'Best tax-saving options for FY26',
    'Compare home loan rates',
    'What events should I attend?',
  ];

  private msgCounter = 0;
  private mkId(): string { return `msg-${++this.msgCounter}`; }

  // ── Gemini system prompt — FULLY DYNAMIC ──────────────────────────────────
  private buildSystemPrompt(): string {
    const m = this.market.snapshot();
    const p = this.portfolio.portfolio();
    const user = this.userSvc.profile();
    const hasPortfolio = this.portfolio.isReady();

    const portfolioBlock = hasPortfolio
      ? `REAL-TIME PORTFOLIO (LIVE):
- Total Net Worth: ${this.portfolio.formatCurrency(p.totalNetWorth)}
- Monthly Change: ${this.portfolio.formatCurrency(p.monthlyChange)} (${p.monthlyChangePct}% MoM)
- Allocations: ${p.allocations.map(a => `${a.name}: ${a.percentage}% (${this.portfolio.formatCurrency(a.value)}, ${a.change > 0 ? '+' : ''}${a.change}%)`).join(' | ')}`
      : `PORTFOLIO: User has not yet completed profiling. Encourage them to complete their 3-minute profile.`;

    return `You are Durgesh — the premium AI persona behind ET Concierge.
You combine the analytical depth of a Bloomberg terminal with the personalized warmth of an elite private banker.

PERSONALITY:
- Speak like a sophisticated, market-savvy financial elite who is also a trusted, proactive partner.
- Your goal is to guide the user towards financial freedom using the Economic Times (ET) ecosystem.
- Be specific: use ₹ amounts, fund names, SENSEX/NIFTY numbers, and percentage returns.
- Be concise — under 75 words. Every word must earn its place.
- ALWAYS end with a strategic question or choice for the user.

USER:
- Name: ${user.name}
- Goal: ${user.goal ?? 'Not yet specified'}
- Horizon: ${user.horizon ?? 'Not specified'}
- Income: ₹${(user.annualIncome / 100000).toFixed(0)}L/yr
- Monthly Investable: ₹${(user.monthlyInvestable / 1000).toFixed(0)}K
- Discovery Score: ${user.discoveryScore}/100

${portfolioBlock}

LIVE MARKET DATA (refresh every 15s):
- SENSEX: ${m.sensex.value.toLocaleString()} (${m.sensex.pct >= 0 ? '+' : ''}${m.sensex.pct}%)
- NIFTY: ${m.nifty.value.toLocaleString()} (${m.nifty.pct >= 0 ? '+' : ''}${m.nifty.pct}%)
- Gold: ₹${m.gold.value.toLocaleString()}/10g (${m.gold.pct >= 0 ? '+' : ''}${m.gold.pct}%)
- USD/INR: ${m.usdinr.value}

RULES:
- Use <strong> HTML tags for emphasis. Use bullet points for readability.
- Reference SENSEX/NIFTY data whenever discussing market moves or portfolio impact.
- Reference the user's specific portfolio numbers to ensure advice is grounded in their reality.
- Never mention being an AI — you are "Durgesh," the soul of ET Concierge.
- Keep the tone elite, proactive, and outcome-oriented.`;
  }

  // ── Initialise ────────────────────────────────────────────────────────────
  constructor() {
    setTimeout(() => this.loadInitialMessages(), 300);
  }

  private loadInitialMessages(): void {
    const m = this.market.snapshot();
    const user = this.userSvc.profile();
    const hasPortfolio = this.portfolio.isReady();

    const sensexDir = m.sensex.pct >= 0 ? 'up' : 'down';
    const sensexColor = m.sensex.pct >= 0 ? 'green' : 'red';
    const niftyDir = m.nifty.pct >= 0 ? 'up' : 'down';

    let greetingText: string;
    let greetingInsights: InsightCard[];

    if (hasPortfolio) {
      const p = this.portfolio.portfolio();
      const firstName = user.name.split(' ')[0];
      greetingText = `Good evening, <strong class="text-gold">${firstName}</strong>. I'm <strong>Durgesh</strong>, your AI Concierge for ET. 
I've completed your 3-minute profiling and mapped your <strong class="text-gold">personalised onboarding path</strong> across the ET ecosystem.
Your portfolio is currently at <strong class="text-gold">${this.portfolio.formatCurrency(p.totalNetWorth)}</strong>. As your <strong class="text-gold">Financial Life Navigator</strong>, I've identified some immediate optimization opportunities and exclusive offers from the <strong class="text-gold">ET Services Marketplace</strong>. 
What area of your wealth should we tackle tonight?`;
      greetingInsights = [
        { label: 'Net Worth', value: this.portfolio.formatCurrency(p.totalNetWorth), sub: `+${p.monthlyChangePct}% MoM`, color: 'gold', action: 'portfolio' },
        { label: 'SENSEX', value: `${m.sensex.pct >= 0 ? '+' : ''}${m.sensex.pct}%`, sub: `at ${m.sensex.value.toLocaleString()}`, color: m.sensex.pct >= 0 ? 'green' : 'red', action: 'markets' },
        { label: 'NIFTY', value: `${m.nifty.pct >= 0 ? '+' : ''}${m.nifty.pct}%`, sub: `at ${m.nifty.value.toLocaleString()}`, color: m.nifty.pct >= 0 ? 'green' : 'red', action: 'markets' },
        { label: 'Gold', value: `₹${m.gold.value.toLocaleString()}`, sub: `${m.gold.pct >= 0 ? '+' : ''}${m.gold.pct}%`, color: 'gold', action: 'gold' },
      ];
    } else {
      const firstName = user.name.split(' ')[0];
      greetingText = `Welcome to your personal <strong>ET Concierge</strong>, ${firstName}. I'm <strong>Durgesh</strong>. I'm currently monitoring markets: ${sensexDir} <strong class="text-${sensexColor}">SENSEX ${m.sensex.pct >= 0 ? '+' : ''}${m.sensex.pct}%</strong>. To unlock your full wealth potential and personalized insights, we should complete your 3-minute profile. <strong class="text-gold">Shall we start profiling, or would you like a market pulse first?</strong>`;
      greetingInsights = [
        { label: 'SENSEX', value: `${m.sensex.pct >= 0 ? '+' : ''}${m.sensex.pct}%`, sub: `at ${m.sensex.value.toLocaleString()}`, color: m.sensex.pct >= 0 ? 'green' : 'red', action: 'markets' },
        { label: 'NIFTY', value: `${m.nifty.pct >= 0 ? '+' : ''}${m.nifty.pct}%`, sub: `at ${m.nifty.value.toLocaleString()}`, color: m.nifty.pct >= 0 ? 'green' : 'red', action: 'markets' },
        { label: 'Gold', value: `₹${m.gold.value.toLocaleString()}`, sub: `${m.gold.pct >= 0 ? '+' : ''}${m.gold.pct}%`, color: 'gold', action: 'gold' },
        { label: 'USD/INR', value: `₹${m.usdinr.value}`, sub: `${m.usdinr.pct >= 0 ? '+' : ''}${m.usdinr.pct}%`, color: 'blue', action: 'forex' },
      ];
    }

    const chips: RecommendationChip[] = hasPortfolio
      ? [
          { label: '📊 Portfolio Snapshot', highlight: true, prompt: 'Show my portfolio snapshot' },
          { label: '📈 Market Pulse', highlight: false, prompt: 'How are the markets today?' },
          { label: '💰 Tax Strategy', highlight: false, prompt: 'What is my FY26 tax saving plan?' },
          { label: '🎯 Financial Goals', highlight: false, prompt: 'What should I prioritize for my financial goals?' },
        ]
      : [
          { label: '📈 Market Update', highlight: true, prompt: 'How are the markets today?' },
          { label: '💡 Investment Ideas', highlight: false, prompt: 'What are the best investment options right now?' },
          { label: '📰 ET Prime Picks', highlight: false, prompt: 'What is trending on ET Prime today?' },
        ];

    this.messages.set([{
      id:        this.mkId(),
      role:      'ai',
      agent:     'navigator',
      timestamp: new Date(),
      text:      greetingText,
      insights:  greetingInsights,
      chips,
    }]);
  }

  // ── Main send ────────────────────────────────────────────────────────────
  async sendMessage(text: string): Promise<void> {
    if (!text.trim()) return;

    this.messages.update(msgs => [
      ...msgs,
      { id: this.mkId(), role: 'user', timestamp: new Date(), text },
    ]);

    // ── Discovery tracking — unlock ET touchpoints based on conversation topics ──
    const t = text.toLowerCase();
    if (t.includes('market') || t.includes('sensex') || t.includes('nifty')) this.userSvc.unlockDiscovery('markets');
    if (t.includes('prime') || t.includes('article') || t.includes('read')) this.userSvc.unlockDiscovery('primeContent');
    if (t.includes('portfolio') || t.includes('net worth') || t.includes('allocation')) this.userSvc.unlockDiscovery('portfolioSync');
    if (t.includes('masterclass') || t.includes('course') || t.includes('learn')) this.userSvc.unlockDiscovery('masterclass');
    if (t.includes('event') || t.includes('summit') || t.includes('webinar')) this.userSvc.unlockDiscovery('events');
    if (t.includes('service') || t.includes('card') || t.includes('loan') || t.includes('insurance')) this.userSvc.unlockDiscovery('services');
    if (t.includes('goal') || t.includes('retire') || t.includes('target')) this.userSvc.unlockDiscovery('goalSetting');
    if (t.includes('recommend') || t.includes('suggest') || t.includes('should i')) this.userSvc.unlockDiscovery('crossSell');

    // Opportunity Agent: keyword interrupt check
    const opportunityMatch = this.portfolio.getOpportunityByKeyword(text);
    const lastMsgs = this.messages();
    const alreadyInterrupted = lastMsgs
      .slice(-6)
      .some(m => m.interrupt && m.xsellItems?.some(x => opportunityMatch && x.title.toLowerCase().includes(opportunityMatch.name.toLowerCase().slice(0, 10))));

    if (opportunityMatch && !alreadyInterrupted) {
      await this.delay(600);
      this.injectOpportunityInterrupt(opportunityMatch);
    }

    // Navigator Agent: main response
    this.isTyping.set(true);
    this.activeAgent.set('navigator');

    let reply: ChatMessage;

    // Try Gemini first
    const geminiHistory = this.gemini.buildHistory(
      this.messages().slice(-12).map(m => ({ role: m.role, text: m.text }))
    );
    const geminiResponse = await this.gemini.chat(
      this.buildSystemPrompt(),
      geminiHistory,
      text
    );

    if (geminiResponse) {
      reply = this.wrapGeminiResponse(geminiResponse, text);
    } else {
      reply = this.localEngine(text);
    }

    await this.delay(800 + Math.random() * 600);
    this.isTyping.set(false);
    this.messages.update(msgs => [...msgs, reply]);

    // Fulfilment Agent: action offer after certain intents
    if (this.shouldOfferAction(text)) {
      await this.delay(1200);
      this.injectFulfilmentAction(text);
    }
  }

  // ── Opportunity Agent interrupt ────────────────────────────────────────────
  private injectOpportunityInterrupt(opp: ReturnType<typeof this.portfolio.getOpportunityByKeyword>): void {
    if (!opp) return;
    this.activeAgent.set('opportunity');
    const msg: ChatMessage = {
      id:        this.mkId(),
      role:      'ai',
      agent:     'opportunity',
      interrupt: true,
      timestamp: new Date(),
      text:      `<strong class="text-gold">Opportunity Agent →</strong> This matches your profile perfectly. <strong class="text-gold">Should I add this to your plan?</strong>`,
      xsellItems: [{
        icon:     opp.tag === 'event' ? '📅' : opp.tag === 'market' ? '📊' : '💡',
        title:    opp.name,
        subtitle: opp.description,
        prompt:   opp.prompt,
        tag:      opp.tag.toUpperCase(),
      }],
    };
    this.messages.update(msgs => [...msgs, msg]);
  }

  // ── Fulfilment Agent ──────────────────────────────────────────────────────
  private shouldOfferAction(text: string): boolean {
    const t = text.toLowerCase();
    return ['apply', 'register', 'invest', 'start sip', 'open', 'book', 'enrol', 'increase sip'].some(kw => t.includes(kw));
  }

  private injectFulfilmentAction(trigger: string): void {
    this.activeAgent.set('fulfilment');
    const t = trigger.toLowerCase();
    let actions: ActionItem[] = [];

    if (t.includes('sip') || t.includes('invest') || t.includes('fund')) {
      actions = [
        { label: 'Draft SIP mandate (₹5,000/mo → Parag Parikh)',  icon: '📝', prompt: 'Confirm SIP increase',        done: false },
        { label: 'Link bank account for auto-debit',              icon: '🏦', prompt: 'Link bank account for SIP',   done: false },
        { label: 'Set goal tracker for retirement corpus',        icon: '🎯', prompt: 'Set retirement goal tracker', done: false },
      ];
    } else if (t.includes('apply') || t.includes('card') || t.includes('credit')) {
      actions = [
        { label: 'Pre-fill Axis Ace application (KYC complete)', icon: '✅', prompt: 'Submit credit card application', done: false },
        { label: 'Soft-pull CIBIL check (no score impact)',      icon: '📊', prompt: 'Run soft CIBIL check',          done: false },
      ];
    } else if (t.includes('register') || t.includes('event') || t.includes('summit')) {
      actions = [
        { label: 'Register for ET Wealth Summit (Mar 28)',      icon: '🎟️', prompt: 'Confirm Summit registration',  done: false },
        { label: 'Add to Google Calendar',                      icon: '📅', prompt: 'Add summit to calendar',       done: false },
      ];
    } else if (t.includes('loan') || t.includes('home')) {
      actions = [
        { label: 'Generate in-principle approval letter (HDFC)', icon: '📄', prompt: 'Generate loan approval letter', done: false },
        { label: 'Schedule call with HDFC relationship manager', icon: '📞', prompt: 'Schedule HDFC RM call',         done: false },
      ];
    }

    if (actions.length === 0) return;

    const msg: ChatMessage = {
      id:        this.mkId(),
      role:      'ai',
      agent:     'fulfilment',
      timestamp: new Date(),
      text:      `<strong class="text-gold">Fulfilment Agent →</strong> I can execute these steps for you right now:`,
      actions,
    };
    this.messages.update(msgs => [...msgs, msg]);
  }

  // ── Wrap Gemini response ──────────────────────────────────────────────────
  private wrapGeminiResponse(text: string, trigger: string): ChatMessage {
    const chips = this.getContextualChips(trigger);
    return {
      id:        this.mkId(),
      role:      'ai',
      agent:     'navigator',
      timestamp: new Date(),
      text,
      chips,
    };
  }

  // ── LOCAL ENGINE — Fully Dynamic, No Hardcoded Values ─────────────────────
  private localEngine(input: string): ChatMessage {
    const t = input.toLowerCase();
    const m = this.market.snapshot();
    const hasPortfolio = this.portfolio.isReady();
    const user = this.userSvc.profile();

    let text: string;
    let chips: RecommendationChip[] | undefined;
    let insights: InsightCard[] | undefined;

    // ── MARKET queries ────────────────────────────────────────────────────
    if (t.includes('market') || t.includes('sensex') || t.includes('nifty') || t.includes('how are') || t.includes('today')) {
      const sensexDir = m.sensex.pct >= 0 ? 'up' : 'down';
      const niftyDir = m.nifty.pct >= 0 ? 'up' : 'down';
      text = `<strong class="text-gold">Live Market Pulse</strong>:
- <strong>SENSEX</strong>: ${sensexDir} <strong class="text-${m.sensex.pct >= 0 ? 'green' : 'red'}">${m.sensex.pct >= 0 ? '+' : ''}${m.sensex.pct}%</strong> at ${m.sensex.value.toLocaleString()}
- <strong>NIFTY</strong>: ${niftyDir} <strong class="text-${m.nifty.pct >= 0 ? 'green' : 'red'}">${m.nifty.pct >= 0 ? '+' : ''}${m.nifty.pct}%</strong> at ${m.nifty.value.toLocaleString()}
- <strong>Gold</strong>: ₹${m.gold.value.toLocaleString()}/10g (${m.gold.pct >= 0 ? '+' : ''}${m.gold.pct}%)
${hasPortfolio ? `Your equity-heavy portfolio is likely ${m.nifty.pct >= 0 ? 'benefiting from' : 'impacted by'} this move.` : ''}
<strong class="text-gold">Want me to analyse how this impacts your investments?</strong>`;
      insights = [
        { label: 'SENSEX', value: `${m.sensex.pct >= 0 ? '+' : ''}${m.sensex.pct}%`, sub: m.sensex.value.toLocaleString(), color: m.sensex.pct >= 0 ? 'green' : 'red', action: 'markets' },
        { label: 'NIFTY', value: `${m.nifty.pct >= 0 ? '+' : ''}${m.nifty.pct}%`, sub: m.nifty.value.toLocaleString(), color: m.nifty.pct >= 0 ? 'green' : 'red', action: 'markets' },
        { label: 'Gold', value: `₹${m.gold.value.toLocaleString()}`, sub: `${m.gold.pct >= 0 ? '+' : ''}${m.gold.pct}%`, color: 'gold', action: 'gold' },
      ];
      chips = [
        { label: '📊 Impact on my portfolio', highlight: true,  prompt: 'How does today\'s market move affect my portfolio?' },
        { label: '📈 Top movers on ET Markets', highlight: false, prompt: 'Show me top stock movers from ET Markets today' },
      ];

    // ── PORTFOLIO queries ─────────────────────────────────────────────────
    } else if (t.includes('portfolio') || t.includes('net worth') || t.includes('allocation') || t.includes('holding') || t.includes('wealth')) {
      if (!hasPortfolio) {
        text = `Your portfolio isn't set up yet! Complete your <strong class="text-gold">3-minute profile</strong> and I'll generate a personalised Net Worth view with asset allocation insights powered by ET Markets data. <strong class="text-gold">Would you like to start your profile now?</strong>`;
        chips = [
          { label: '🚀 Start Profile', highlight: true, prompt: 'I want to complete my profile' },
          { label: '📈 Show Markets', highlight: false, prompt: 'How are the markets today?' },
        ];
      } else {
        const p = this.portfolio.portfolio();
        const nw = this.portfolio.formatCurrency(p.totalNetWorth);
        text = `<strong class="text-gold">${nw}</strong> — here's your breakdown:
${p.allocations.map(a => `- <strong>${a.name}</strong>: ${a.percentage}% (${this.portfolio.formatCurrency(a.value)}) · ${a.change > 0 ? '+' : ''}${a.change}% MoM`).join('\n')}
With NIFTY ${m.nifty.pct >= 0 ? 'up' : 'down'} ${Math.abs(m.nifty.pct)}%, your equity allocation is ${m.nifty.pct >= 0 ? 'capturing upside' : 'under pressure'}. <strong class="text-gold">Should we optimise your allocation or explore tax-saving options?</strong>`;
        insights = p.allocations.map(a => ({
          label: a.name,
          value: this.portfolio.formatCurrency(a.value),
          sub: `${a.change > 0 ? '+' : ''}${a.change}% MoM`,
          color: (a.name.includes('Equity') ? 'gold' : a.name.includes('Stock') ? 'blue' : 'green') as any,
          action: 'detail',
        }));
        chips = [
          { label: '🔄 Rebalance strategy', highlight: true, prompt: 'Give me a rebalancing strategy for my portfolio' },
          { label: '📊 Compare to NIFTY', highlight: false, prompt: 'How does my portfolio compare to NIFTY 50?' },
          { label: '💰 Tax saving plays', highlight: false, prompt: 'Best tax-saving investments for FY26' },
        ];
      }

    // ── RETIREMENT / GAP queries ──────────────────────────────────────────
    } else if (t.includes('retirement') || t.includes('retire') || t.includes('corpus') || t.includes('gap')) {
      if (!hasPortfolio) {
        text = `I'd love to calculate your retirement gap, but I need your portfolio data first. <strong class="text-gold">Complete your profile to unlock personalised retirement planning.</strong>`;
        chips = [{ label: '🚀 Start Profile', highlight: true, prompt: 'I want to complete my profile' }];
      } else {
        const p = this.portfolio.portfolio();
        const target = user.annualIncome * 15;
        const gap = Math.max(0, target - p.totalNetWorth);
        text = `Retirement target: <strong class="text-gold">${this.portfolio.formatCurrency(target)}</strong> (15× annual income). Current gap: <strong class="text-red">${this.portfolio.formatCurrency(gap)}</strong>.
Key levers:
- <strong class="text-gold">SIP Step-up</strong>: +₹${Math.floor(user.monthlyInvestable * 0.1).toLocaleString()}/mo
- <strong class="text-gold">NPS 80CCD(1B)</strong>: Extra ₹50K tax benefit
- <strong class="text-gold">Equity tilt</strong>: Increase exposure while NIFTY is ${m.nifty.pct >= 0 ? 'bullish' : 'at a discount'}
<strong class="text-gold">Which lever should we pull first?</strong>`;
        chips = [
          { label: '↑ SIP Step-up', highlight: true, prompt: 'How do I increase my SIP for retirement?' },
          { label: 'Open NPS', highlight: false, prompt: 'How does NPS help close my retirement gap?' },
          { label: 'Equity rebalance', highlight: false, prompt: 'Should I increase my equity allocation?' },
        ];
      }

    // ── TAX queries ───────────────────────────────────────────────────────
    } else if (t.includes('tax') || t.includes('80c') || t.includes('elss') || t.includes('deduction') || t.includes('fy26')) {
      const unused80c = Math.max(0, 150000 - Math.floor(user.monthlyInvestable * 0.2));
      text = `<strong class="text-gold">FY26 Tax Intelligence</strong>:
- <strong>80C remaining</strong>: ₹${unused80c.toLocaleString()} → saves ~₹${Math.floor(unused80c * 0.3).toLocaleString()} in tax
- <strong>NPS 80CCD(1B)</strong>: Extra ₹50K → saves ₹15,600
- <strong>Best ELSS</strong>: Quant Tax Plan (30.2% 3Y CAGR via ET Markets)
${hasPortfolio ? `Your ${this.portfolio.portfolio().allocations[0]?.name} allocation already provides some tax efficiency.` : ''}
<strong class="text-gold">Should I create your complete FY26 tax roadmap?</strong>`;
      chips = [
        { label: '💎 Invest in ELSS', highlight: true, prompt: 'How do I invest in Quant Tax Plan ELSS?' },
        { label: '🏦 Open NPS', highlight: false, prompt: 'How to maximise NPS tax deduction?' },
        { label: '📋 Full tax plan', highlight: false, prompt: 'Create a complete FY26 tax saving plan' },
      ];

    // ── INSURANCE queries ─────────────────────────────────────────────────
    } else if (t.includes('insurance') || t.includes('term plan') || t.includes('life cover') || t.includes('health')) {
      const idealCover = user.annualIncome * 10;
      text = `<strong class="text-gold">Insurance Gap Analysis</strong>:
- <strong class="text-red">Life cover needed</strong>: ${this.portfolio.formatCurrency(idealCover)} (10× income)
- <strong>Best term plan</strong>: HDFC Click2Protect ₹1Cr at ~₹14,200/yr
- <strong>Health cover</strong>: ₹10L family floater recommended (Star Comprehensive ~₹18K/yr)
<strong class="text-gold">Should I generate quotes from ET Financial Services partners?</strong>`;
      chips = [
        { label: '🛡️ Get term cover', highlight: true, prompt: 'Apply for HDFC Click2Protect term plan' },
        { label: '🏥 Health cover', highlight: false, prompt: 'Compare health insurance plans' },
      ];

    // ── SERVICES MARKETPLACE queries (PS 4) ────────────────────────────────
    } else if (t.includes('service') || t.includes('credit card') || t.includes('loan') || t.includes('marketplace')) {
      text = `<strong class="text-gold">ET Services Marketplace Agent</strong>: Based on your financial life profile, I've proactively identified these cross-sell opportunities from ET partners:
- 💳 <strong>Credit Cards</strong>: Pre-approved for Axis Ace (matches your high utility spend).
- 🏠 <strong>Home Loans</strong>: HDFC is offering 8.35% for ET Prime Wealth members, generating savings of ~₹2.8L on your profile.
- 🛡️ <strong>Insurance</strong>: Gap identified — recommending ₹1Cr Term Plan via Max Life.
<strong class="text-gold">My Fulfilment Agent can execute any of these. Which area should we start with?</strong>`;
      chips = [
        { label: '💳 Apply for Axis Ace', highlight: true, prompt: 'Apply for Axis Ace credit card' },
        { label: '🏠 Check HDFC Home Loan', highlight: false, prompt: 'Generate in-principle approval letter' },
        { label: '🛡️ View Insurance Gap', highlight: false, prompt: 'Show me my insurance gap analysis' },
      ];

    // ── GREETING ──────────────────────────────────────────────────────────
    } else if (t.match(/^(hi|hello|hey|good\s*(morning|evening|afternoon))[\s!.]*$/i)) {
      const sensexDir = m.sensex.pct >= 0 ? 'up' : 'down';
      text = `Welcome back, <strong class="text-gold">${user.name.split(' ')[0]}</strong>! SENSEX is ${sensexDir} <strong class="text-${m.sensex.pct >= 0 ? 'green' : 'red'}">${m.sensex.pct >= 0 ? '+' : ''}${m.sensex.pct}%</strong> today. ${hasPortfolio ? `Your portfolio stands at <strong class="text-gold">${this.portfolio.formatCurrency(this.portfolio.portfolio().totalNetWorth)}</strong>.` : 'Complete your profile to unlock personalised insights.'} <strong class="text-gold">What would you like to explore — markets, investments, or tax strategy?</strong>`;
      chips = [
        { label: '📊 Portfolio', highlight: hasPortfolio, prompt: 'Show my portfolio snapshot' },
        { label: '📈 Markets', highlight: !hasPortfolio, prompt: 'How are the markets today?' },
        { label: '💰 Tax', highlight: false, prompt: 'Best tax-saving options for FY26' },
      ];

    // ── CATCH-ALL — always contextual ─────────────────────────────────────
    } else {
      const sensexDir = m.sensex.pct >= 0 ? 'up' : 'down';
      if (hasPortfolio) {
        const p = this.portfolio.portfolio();
        text = `Great question! With your <strong class="text-gold">${this.portfolio.formatCurrency(p.totalNetWorth)}</strong> portfolio and markets ${sensexDir} (SENSEX ${m.sensex.pct >= 0 ? '+' : ''}${m.sensex.pct}%), here's what I'd prioritise:
- 📊 ${p.allocations[0]?.name} review (your largest holding at ${p.allocations[0]?.percentage}%)
- 💰 FY26 tax optimisation
- 🎯 ET Wealth Summit (Mar 28)
<strong class="text-gold">Which area interests you most?</strong>`;
      } else {
        text = `I can help you with <strong class="text-gold">live market analysis</strong> (SENSEX ${sensexDir} ${Math.abs(m.sensex.pct)}%), <strong class="text-gold">investment ideas</strong>, <strong class="text-gold">tax planning</strong>, and much more from the ET ecosystem. Complete your profile for personalised recommendations! <strong class="text-gold">What would you like to explore?</strong>`;
      }
      chips = [
        { label: '📈 Market Pulse', highlight: true, prompt: 'How are the markets doing today?' },
        { label: '💡 Investment Ideas', highlight: false, prompt: 'What are the best investment options right now?' },
        { label: '📰 ET Prime', highlight: false, prompt: 'What is trending on ET Prime today?' },
      ];
    }

    return {
      id:        this.mkId(),
      role:      'ai',
      agent:     'navigator',
      timestamp: new Date(),
      text,
      insights,
      chips,
    };
  }

  // ── Contextual chips for Gemini responses ─────────────────────────────────
  private getContextualChips(trigger: string): RecommendationChip[] {
    const t = trigger.toLowerCase();
    if (t.includes('market') || t.includes('sensex') || t.includes('nifty')) {
      return [
        { label: '📊 Impact on portfolio', highlight: true,  prompt: 'How does this market move affect my portfolio?' },
        { label: '📈 ET Markets picks',    highlight: false, prompt: 'Show ET Markets top picks today' },
      ];
    }
    if (t.includes('sip') || t.includes('fund') || t.includes('invest')) {
      return [
        { label: 'Start this SIP now',      highlight: true,  prompt: 'Start the recommended SIP now' },
        { label: 'Compare alternatives',    highlight: false, prompt: 'Show me alternative fund options' },
      ];
    }
    if (t.includes('tax') || t.includes('80c')) {
      return [
        { label: 'Invest in ELSS now',      highlight: true,  prompt: 'Which ELSS fund should I invest in right now?' },
        { label: 'Maximise NPS deduction',  highlight: false, prompt: 'How to maximise NPS tax deduction?' },
      ];
    }
    if (t.includes('loan') || t.includes('home')) {
      return [
        { label: 'Get in-principle letter', highlight: true,  prompt: 'Generate home loan in principle approval' },
        { label: 'Compare lenders',         highlight: false, prompt: 'Compare home loan rates across all banks' },
      ];
    }
    return [
      { label: '📊 My Portfolio',   highlight: true,  prompt: 'Show my portfolio snapshot' },
      { label: '📈 Market Update',  highlight: false, prompt: 'How are the markets doing today?' },
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setMode(mode: 'Navigator' | 'Markets' | 'Services' | 'Goals'): void {
    this.activeMode.set(mode);

    const modePrompts: Record<string, string> = {
      Markets:  'How are the markets doing today? Show me SENSEX and NIFTY live data.',
      Services: 'Show me all ET financial services matched to my profile',
      Goals:    'Show me all my financial goals and progress',
    };
    if (modePrompts[mode]) {
      this.sendMessage(modePrompts[mode]);
    }
  }

  markActionDone(msgId: string, actionLabel: string): void {
    this.messages.update(msgs =>
      msgs.map(m => {
        if (m.id !== msgId || !m.actions) return m;
        return {
          ...m,
          actions: m.actions.map(a =>
            a.label === actionLabel ? { ...a, done: true } : a
          ),
        };
      })
    );

    setTimeout(() => {
      this.messages.update(msgs => [
        ...msgs,
        {
          id:        this.mkId(),
          role:      'ai',
          agent:     'fulfilment',
          timestamp: new Date(),
          text:      `<strong class="text-green">✓ Done —</strong> "${actionLabel.slice(0, 50)}" has been executed. Discovery Score updated. What's next?`,
          chips: [
            { label: 'Continue →', highlight: true,  prompt: 'What should I do next based on my profile?' },
            { label: 'View all actions', highlight: false, prompt: 'Show me all pending actions in my financial plan' },
          ],
        },
      ]);
    }, 600);
  }
}
