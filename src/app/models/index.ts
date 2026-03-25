// ─── USER PROFILE ────────────────────────────────────────────────────────────
export interface UserProfile {
  id:                 string;
  name:               string;
  initials:           string;
  tier:               'standard' | 'prime' | 'wealth';
  discoveryScore:     number;
  creditScore:        number;
  annualIncome:       number;
  monthlyInvestable:  number;
  goal:               string | null;
  horizon:            string | null;
  etUsage:            string | null;
  blindSpot:          string | null;
  profileComplete:    boolean;
}

// ─── AGENT ───────────────────────────────────────────────────────────────────
export type AgentType = 'profiling' | 'navigator' | 'opportunity' | 'fulfilment';

export interface AgentStatus {
  type:    AgentType;
  label:   string;
  active:  boolean;
  pulse:   boolean;
}

// ─── CHAT ────────────────────────────────────────────────────────────────────
export type MessageRole = 'user' | 'ai';

export interface InsightCard {
  label:  string;
  value:  string;
  sub:    string;
  color:  'gold' | 'green' | 'red' | 'blue';
  action: string;
}

export interface XSellItem {
  icon:     string;
  title:    string;
  subtitle: string;
  prompt:   string;
  tag:      string;
}

export interface ActionItem {
  label:    string;
  icon:     string;
  prompt:   string;
  done:     boolean;
}

export interface RecommendationChip {
  label:     string;
  highlight: boolean;
  prompt:    string;
}

export interface ChatMessage {
  id:         string;
  role:       MessageRole;
  text:       string;
  timestamp:  Date;
  agent?:     AgentType;
  insights?:  InsightCard[];
  xsellItems?: XSellItem[];
  chips?:     RecommendationChip[];
  actions?:   ActionItem[];
  interrupt?: boolean;    // proactive agent interrupt flag
}

// ─── MARKET ──────────────────────────────────────────────────────────────────
export interface TickerItem {
  sym:   string;
  value: string;
  up:    boolean;
}

export interface MarketSnapshot {
  nifty:   { value: number; change: number; pct: number };
  sensex:  { value: number; change: number; pct: number };
  usdinr:  { value: number; change: number; pct: number };
  gold:    { value: number; change: number; pct: number };
  loaded:  boolean;
}

// ─── PORTFOLIO ───────────────────────────────────────────────────────────────
export interface AssetAllocation {
  name:       string;
  percentage: number;
  value:      number;
  color:      string;
  change:     number;
}

export interface Portfolio {
  totalNetWorth:      number;
  monthlyChange:      number;
  monthlyChangePct:   number;
  allocations:        AssetAllocation[];
}

// ─── OPPORTUNITY ─────────────────────────────────────────────────────────────
export type OpportunityTag = 'prime' | 'market' | 'service' | 'event';

export interface Opportunity {
  id:          string;
  name:        string;
  description: string;
  tag:         OpportunityTag;
  prompt:      string;
  keywords:    string[];   // triggers proactive agent interrupt
  urgent?:     boolean;
}

// ─── JOURNEY ─────────────────────────────────────────────────────────────────
export type JourneyStepStatus = 'done' | 'active' | 'pending';

export interface JourneyStep {
  number: number;
  label:  string;
  status: JourneyStepStatus;
  pts:    number;
}

// ─── SERVICES ────────────────────────────────────────────────────────────────
export interface ServiceTile {
  icon:   string;
  name:   string;
  action: string;
  prompt: string;
  hot:    boolean;
}

// ─── ECOSYSTEM ───────────────────────────────────────────────────────────────
export interface EcosystemCoverage {
  name:   string;
  status: 'active' | 'partial' | 'locked';
  value?: string;
  pts:    number;
}

// ─── PROFILING ───────────────────────────────────────────────────────────────
export interface ProfilingQuestion {
  question: string;
  options:  string[];
  field:    keyof UserProfile;
}
