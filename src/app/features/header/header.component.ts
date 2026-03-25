import { Component, inject } from '@angular/core';
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

      <!-- Live market ticker -->
      <div class="ticker">
        @for (item of market.tickers(); track item.sym) {
          <div class="tick-item">
            <span class="sym">{{ item.sym }}</span>
            <span [class]="item.up ? 'val up' : 'val dn'">{{ item.value }}</span>
          </div>
        }
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

      <div class="live-badge">
        <div class="live-dot"></div>
        LIVE
      </div>

    </header>
  `,
  styles: [`
    .header {
      display: flex; align-items: center; gap: 20px;
      padding: 0 1.5rem; height: 58px;
      background: var(--bg2);
      border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 100;
    }

    .logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .logo-mark {
      width: 30px; height: 30px; border-radius: 5px;
      background: var(--gold);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display); font-weight: 700;
      color: #000; font-size: 13px;
    }
    .logo-text { font-family: var(--font-display); font-size: 15px; color: var(--text); line-height: 1; }
    .logo-text .gold { color: var(--gold); }
    .logo-text .version { display: block; font-family: var(--font-mono); font-size: 9px; color: var(--text3); margin-top: 2px; font-style: normal; }

    .ticker { display: flex; gap: 18px; flex: 1; overflow: hidden; }
    .tick-item { display: flex; gap: 5px; font-size: 11px; font-family: var(--font-mono); flex-shrink: 0; }
    .sym { color: var(--text3); }
    .val { font-weight: 500; }
    .up  { color: var(--green); }
    .dn  { color: var(--red); }

    /* Agent pills */
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
    .agent-pill.active .agent-dot { background: var(--green); }
    .agent-ring {
      position: absolute; inset: -2px;
      border-radius: 50%;
      border: 1.5px solid var(--green);
      animation: agentPing 1.8s infinite;
    }
    .agent-name { font-size: 10px; font-family: var(--font-mono); color: var(--text3); }
    .agent-pill.active .agent-name { color: var(--text2); }

    .live-badge {
      display: flex; align-items: center; gap: 5px;
      font-size: 10px; font-family: var(--font-mono);
      color: var(--green); letter-spacing: 0.5px; flex-shrink: 0;
    }
    .live-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--green); animation: pulse 2s infinite;
    }

    @keyframes agentPing {
      0%   { transform: scale(1);   opacity: 1; }
      70%  { transform: scale(2.4); opacity: 0; }
      100% { transform: scale(1);   opacity: 0; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; } 50% { opacity: 0.25; }
    }
  `],
})
export class HeaderComponent {
  market  = inject(MarketService);
  profile = inject(UserProfileService);

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
