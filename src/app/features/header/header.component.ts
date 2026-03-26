import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketService } from '../../services/market.service';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">

      <div class="logo">
        <div class="logo-mark">ET</div>
        <div class="logo-text">
          Economic Times <span class="gold">Concierge</span>
          <span class="version">v2 · Agentic</span>
        </div>
      </div>

      <!-- Live scrolling market ticker -->
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
            <span class="sep">|</span>
          }
          <!-- Duplicate set for seamless loop -->
          @for (item of tickerItems(); track 'dup-' + item.sym) {
            <span class="tick-item">
              <span class="sym">{{ item.sym }}</span>
              <span [class]="item.up ? 'val up' : 'val dn'">
                {{ item.up ? '▲' : '▼' }} {{ item.value }}
              </span>
              <span [class]="item.up ? 'pct up' : 'pct dn'">{{ item.pct }}</span>
            </span>
            <span class="sep">|</span>
          }
        </div>
      </div>

      <!-- Agent status indicators -->
      <div class="agents">
        @for (agent of profile.agentStatuses(); track agent.type) {
          <div class="agent-pill" [class.active]="agent.active" [title]="agent.label">
            <div class="agent-dot" [class.pulse]="agent.pulse && agent.active">
              @if (agent.active && agent.pulse) {
                <div class="agent-ring"></div>
              }
            </div>
            <span class="agent-name">{{ agentShortName(agent.type) }}</span>
          </div>
        }
      </div>

      <div class="live-badge" [class.fetching]="fetching()">
        <div class="live-dot"></div>
        <span>LIVE</span>
        @if (lastUpdatedStr()) {
          <span class="updated">{{ lastUpdatedStr() }}</span>
        }
      </div>

    </header>
  `,
  styles: [`
    .header {
      display: flex; align-items: center; gap: 16px;
      padding: 0 1.5rem; height: 58px;
      background: var(--bg2);
      border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 100;
      overflow: hidden;
    }

    /* ── Logo ─────────────────────────────────────────────────── */
    .logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .logo-mark {
      width: 32px; height: 32px; border-radius: 6px;
      background: #e21b2f; color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 14px; letter-spacing: 1px;
    }
    .logo-text { font-size: 15px; color: var(--text); line-height: 1; }
    .logo-text .gold { color: var(--gold); }
    .logo-text .version { display: block; font-family: var(--font-mono); font-size: 9px; color: var(--text3); margin-top: 2px; }

    /* ── Scrolling Ticker ─────────────────────────────────────── */
    .ticker-wrap {
      flex: 1;
      overflow: hidden;
      mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
    }
    .ticker-track {
      display: inline-flex; align-items: center;
      white-space: nowrap;
      animation: scrollTicker linear infinite;
      will-change: transform;
    }
    .ticker-track:hover { animation-play-state: paused; }

    .tick-item {
      display: inline-flex; align-items: center; gap: 5px;
      font-family: var(--font-mono); font-size: 11px;
      padding: 0 12px;
    }
    .sep { color: var(--border); font-size: 10px; }
    .sym { color: var(--text3); font-weight: 600; letter-spacing: 0.5px; }
    .val { font-weight: 600; }
    .pct { font-size: 10px; opacity: 0.8; }
    .up  { color: #22c55e; }
    .dn  { color: #ef4444; }

    @keyframes scrollTicker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* ── Agent pills ──────────────────────────────────────────── */
    .agents { display: flex; gap: 6px; flex-shrink: 0; }
    .agent-pill {
      display: flex; align-items: center; gap: 5px;
      padding: 3px 8px; border-radius: 20px;
      border: 1px solid var(--border);
      background: var(--bg3);
      opacity: 0.4; transition: all 0.3s;
    }
    .agent-pill.active { opacity: 1; border-color: rgba(201,168,76,0.3); }
    .agent-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--text3);
      position: relative; flex-shrink: 0;
    }
    .agent-pill.active .agent-dot { background: #22c55e; }
    .agent-ring {
      position: absolute; inset: -2px;
      border-radius: 50%;
      border: 1.5px solid #22c55e;
      animation: agentPing 1.8s infinite;
    }
    .agent-name { font-size: 10px; font-family: var(--font-mono); color: var(--text3); }
    .agent-pill.active .agent-name { color: var(--text2); }

    /* ── Live badge ───────────────────────────────────────────── */
    .live-badge {
      display: flex; align-items: center; gap: 5px;
      font-size: 10px; font-family: var(--font-mono);
      color: #22c55e; letter-spacing: 0.5px; flex-shrink: 0;
    }
    .live-badge.fetching { color: var(--gold); }
    .live-badge.fetching .live-dot { background: var(--gold); }
    .live-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #22c55e; animation: pulse 1.5s infinite;
    }
    .updated { color: var(--text3); font-size: 9px; margin-left: 2px; }

    @keyframes agentPing {
      0%   { transform: scale(1);   opacity: 1; }
      70%  { transform: scale(2.4); opacity: 0; }
      100% { transform: scale(1);   opacity: 0; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
      50%       { opacity: 0.6; box-shadow: 0 0 0 4px rgba(34,197,94,0); }
    }
  `],
})
export class HeaderComponent implements OnInit, OnDestroy {
  market  = inject(MarketService);
  profile = inject(UserProfileService);

  tickerItems  = this.market.tickers;
  fetching     = signal(false);
  lastUpdatedStr = signal<string>('');
  tickerSpeed    = '28s';

  private timer: ReturnType<typeof setInterval> | null = null;
  private clockTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.updateClock();
    this.clockTimer = setInterval(() => this.updateClock(), 5000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.clockTimer) clearInterval(this.clockTimer);
  }

  private updateClock() {
    const lu = this.market.lastUpdated();
    if (!lu) {
      this.lastUpdatedStr.set('loading...');
      return;
    }
    const diffSec = Math.floor((Date.now() - lu.getTime()) / 1000);
    if (diffSec < 10)       this.lastUpdatedStr.set('just now');
    else if (diffSec < 60)  this.lastUpdatedStr.set(`${diffSec}s ago`);
    else                    this.lastUpdatedStr.set(`${Math.floor(diffSec/60)}m ago`);
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
