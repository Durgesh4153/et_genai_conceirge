import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketService } from '../../services/market.service';
import { UserProfileService } from '../../services/user-profile.service';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">

      <!-- ET Intelligence-style Logo -->
      <div class="logo" id="et-logo">
        <div class="logo-et-badge">ET</div>
        <div class="logo-divider"></div>
        <div class="logo-text">
          <span class="logo-title">Concierge</span>
          <span class="logo-sub">AI Intelligence · Agentic</span>
        </div>
      </div>

      <!-- Scrolling market ticker -->
      <div class="ticker-wrap">
        <div class="ticker-track" [style.animationDuration]="tickerSpeed">
          @for (item of tickerItems(); track item.sym) {
            <span class="tick-item">
              <span class="sym">{{ item.sym }}</span>
              <span [class]="item.up ? 'val up' : 'val dn'">
                {{ item.up ? '▲' : '▼' }} {{ item.value }}
              </span>
              <span [class]="item.up ? 'pct up' : 'pct dn'">{{ item.pct }}</span>
            </span>
            <span class="sep">·</span>
          }
          @for (item of tickerItems(); track 'dup-' + item.sym) {
            <span class="tick-item">
              <span class="sym">{{ item.sym }}</span>
              <span [class]="item.up ? 'val up' : 'val dn'">
                {{ item.up ? '▲' : '▼' }} {{ item.value }}
              </span>
              <span [class]="item.up ? 'pct up' : 'pct dn'">{{ item.pct }}</span>
            </span>
            <span class="sep">·</span>
          }
        </div>
      </div>

      <!-- Agent status pills -->
      <div class="agents" id="agent-status-bar">
        @for (agent of profile.agentStatuses(); track agent.type) {
          <div class="agent-pill" [class.active]="agent.active">
            <div class="agent-dot" [class.pulse-dot]="agent.pulse && agent.active">
              @if (agent.active && agent.pulse) {
                <div class="agent-ring"></div>
              }
            </div>
            <span class="agent-name">{{ agentShortName(agent.type) }}</span>
          </div>
        }
      </div>

      <!-- Live badge -->
      <div class="live-badge" [class.fetching]="fetching()" id="live-indicator">
        <div class="live-dot"></div>
        <span>LIVE</span>
        @if (lastUpdatedStr()) {
          <span class="updated">{{ lastUpdatedStr() }}</span>
        }
      </div>

      <!-- User Avatar (visible after login) -->
      @if (!profile.showProfilingModal()) {
        <div class="user-section" id="user-avatar-section">
          <div class="user-avatar" [title]="profile.profile().name">
            {{ profile.profile().initials }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ profile.profile().name.split(' ')[0] }}</div>
            <div class="user-tier">{{ tierShort() }}</div>
          </div>
          <div class="score-mini">
            <div class="score-ring">
              <svg viewBox="0 0 36 36" class="score-svg">
                <path class="score-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="score-fill" [style.strokeDasharray]="profile.computedScore() + ' 100'"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <span class="score-num">{{ profile.computedScore() }}</span>
            </div>
          </div>
        </div>
      }

    </header>
  `,
  styles: [`
    .header {
      display: flex; align-items: center; gap: 14px;
      padding: 0 1.25rem; height: 54px;
      background: var(--bg2);
      border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 100;
      overflow: hidden;
    }

    /* ── Logo ── */
    .logo {
      display: flex; align-items: center; gap: 10px;
      flex-shrink: 0; text-decoration: none;
    }
    .logo-et-badge {
      width: 34px; height: 34px; border-radius: 7px;
      background: #e21b2f;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 14px; color: white;
      letter-spacing: 0.5px;
      box-shadow: 0 0 16px rgba(226,27,47,0.3);
      flex-shrink: 0;
    }
    .logo-divider {
      width: 1px; height: 22px;
      background: var(--border2);
    }
    .logo-text { line-height: 1.1; }
    .logo-title {
      display: block; font-size: 14px; font-weight: 600;
      color: var(--text); letter-spacing: 0.2px;
    }
    .logo-sub {
      display: block; font-family: var(--font-mono); font-size: 9px;
      color: var(--text3); margin-top: 1px; letter-spacing: 0.3px;
    }

    /* ── Ticker ── */
    .ticker-wrap {
      flex: 1; overflow: hidden;
      mask-image: linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%);
    }
    .ticker-track {
      display: inline-flex; align-items: center;
      white-space: nowrap;
      animation: scrollTicker linear infinite;
      will-change: transform;
    }
    .ticker-track:hover { animation-play-state: paused; }
    .tick-item {
      display: inline-flex; align-items: center; gap: 4px;
      font-family: var(--font-mono); font-size: 11px;
      padding: 0 10px;
    }
    .sep { color: var(--border2); font-size: 10px; }
    .sym { color: var(--text3); font-weight: 600; letter-spacing: 0.5px; font-size: 10px; }
    .val { font-weight: 600; font-size: 11px; }
    .pct { font-size: 10px; opacity: 0.8; }
    .up  { color: #22c55e; }
    .dn  { color: #ef4444; }

    @keyframes scrollTicker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* ── Agent Pills ── */
    .agents { display: flex; gap: 5px; flex-shrink: 0; }
    .agent-pill {
      display: flex; align-items: center; gap: 5px;
      padding: 3px 8px; border-radius: 20px;
      border: 1px solid var(--border);
      background: var(--bg3);
      opacity: 0.35; transition: all 0.3s;
    }
    .agent-pill.active { opacity: 1; border-color: rgba(201,168,76,0.25); }
    .agent-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--text3); position: relative; flex-shrink: 0;
    }
    .agent-pill.active .agent-dot { background: #22c55e; }
    .pulse-dot { animation: dotPulse 2s infinite; }
    .agent-ring {
      position: absolute; inset: -3px; border-radius: 50%;
      border: 1.5px solid #22c55e;
      animation: agentPing 1.8s infinite;
    }
    .agent-name { font-size: 9.5px; font-family: var(--font-mono); color: var(--text3); }
    .agent-pill.active .agent-name { color: var(--text2); }

    /* ── Live Badge ── */
    .live-badge {
      display: flex; align-items: center; gap: 5px;
      font-size: 10px; font-family: var(--font-mono);
      color: #22c55e; letter-spacing: 0.5px; flex-shrink: 0;
    }
    .live-badge.fetching { color: var(--gold); }
    .live-badge.fetching .live-dot { background: var(--gold); animation: pulse 1s infinite; }
    .live-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #22c55e; animation: livePulse 2s infinite;
    }
    .updated { color: var(--text3); font-size: 9px; margin-left: 2px; }

    /* ── User Section ── */
    .user-section {
      display: flex; align-items: center; gap: 8px; flex-shrink: 0;
      padding-left: 12px; border-left: 1px solid var(--border);
      animation: fadeIn 0.4s ease;
    }
    .user-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, var(--gold-dim), rgba(201,168,76,0.06));
      border: 1.5px solid var(--gold);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: var(--gold);
      cursor: pointer; flex-shrink: 0;
    }
    .user-info { line-height: 1; }
    .user-name  { font-size: 12px; font-weight: 500; color: var(--text); }
    .user-tier  { font-size: 9px; font-family: var(--font-mono); color: var(--gold); margin-top: 2px; }

    /* ── Score Ring ── */
    .score-mini { flex-shrink: 0; }
    .score-ring { position: relative; width: 32px; height: 32px; }
    .score-svg { width: 32px; height: 32px; transform: rotate(-90deg); }
    .score-bg   { fill: none; stroke: var(--bg3); stroke-width: 3; }
    .score-fill {
      fill: none; stroke: var(--gold); stroke-width: 3;
      stroke-linecap: round; transition: stroke-dasharray 0.8s ease;
    }
    .score-num {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-mono); font-size: 9px; font-weight: 600;
      color: var(--gold);
    }

    /* ── Keyframes ── */
    @keyframes agentPing { 0% { transform:scale(1); opacity:1; } 70% { transform:scale(2.4); opacity:0; } 100% { transform:scale(1); opacity:0; } }
    @keyframes dotPulse  { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
    @keyframes livePulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,0.5);} 50%{opacity:0.8;box-shadow:0 0 0 4px rgba(34,197,94,0);} }
    @keyframes pulse     { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
    @keyframes fadeIn    { from{opacity:0;} to{opacity:1;} }
  `],
})
export class HeaderComponent implements OnInit, OnDestroy {
  market   = inject(MarketService);
  profile  = inject(UserProfileService);
  news     = inject(NewsService);

  tickerItems    = this.market.tickers;
  fetching       = signal(false);
  lastUpdatedStr = signal<string>('');
  tickerSpeed    = '30s';

  private clockTimer: ReturnType<typeof setInterval> | null = null;

  tierShort = () => {
    const t = this.profile.profile().tier;
    if (t === 'wealth') return 'Prime · Wealth';
    if (t === 'prime')  return 'ET Prime';
    return 'ET Member';
  };

  ngOnInit() {
    this.updateClock();
    this.clockTimer = setInterval(() => this.updateClock(), 10000);
  }

  ngOnDestroy() {
    if (this.clockTimer) clearInterval(this.clockTimer);
  }

  private updateClock() {
    const lu = this.market.lastUpdated();
    if (!lu) { this.lastUpdatedStr.set(''); return; }
    const diffSec = Math.floor((Date.now() - lu.getTime()) / 1000);
    if (diffSec < 10)      this.lastUpdatedStr.set('just now');
    else if (diffSec < 60) this.lastUpdatedStr.set(`${diffSec}s ago`);
    else                   this.lastUpdatedStr.set(`${Math.floor(diffSec / 60)}m ago`);
  }

  agentShortName(type: string): string {
    const map: Record<string, string> = {
      profiling:   'Profile',
      navigator:   'Navigator',
      opportunity: 'Opportunity',
      fulfilment:  'Fulfilment',
    };
    return map[type] ?? type;
  }
}
