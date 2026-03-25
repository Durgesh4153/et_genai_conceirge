import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-right-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="right-panel">

      <!-- Net Worth -->
      <div class="panel-section">
        <div class="panel-title">Net Worth Overview</div>
        <div class="wealth-card">
          <div class="wealth-header">
            <div>
              <div class="wealth-total">{{ portfolio.formatCurrency(portfolio.portfolio().totalNetWorth) }}</div>
              <div class="wealth-sub">+{{ portfolio.formatCurrency(portfolio.portfolio().monthlyChange) }} this month</div>
            </div>
            <div class="wealth-pct up">+{{ portfolio.portfolio().monthlyChangePct }}% MoM</div>
          </div>
          <div class="asset-rows">
            @for (alloc of portfolio.portfolio().allocations; track alloc.name) {
              <div class="asset-row" (click)="chat.sendMessage('Tell me about my ' + alloc.name + ' holdings')">
                <span class="aname">{{ alloc.name }}</span>
                <div class="abar-bg">
                  <div class="abar-fill" [style.width.%]="alloc.percentage" [style.background]="alloc.color"></div>
                </div>
                <span class="apct">{{ alloc.percentage }}%</span>
                <span class="achange" [class.up]="alloc.change > 0" [class.dn]="alloc.change < 0">
                  {{ alloc.change > 0 ? '+' : '' }}{{ alloc.change }}%
                </span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Today's Opportunities -->
      <div class="panel-section">
        <div class="panel-title">Matched Opportunities <span class="count-badge">{{ portfolio.opportunities().length }}</span></div>
        @for (opp of portfolio.opportunities(); track opp.id) {
          <div class="opp-card" [class.urgent]="opp.urgent" (click)="chat.sendMessage(opp.prompt)">
            <div class="opp-header">
              <span class="opp-name">{{ opp.name }}</span>
              <span class="opp-tag" [class]="'otag-' + opp.tag">{{ opp.tag.toUpperCase() }}</span>
            </div>
            <div class="opp-desc">{{ opp.description }}</div>
            @if (opp.urgent) {
              <div class="urgent-label">⏰ Time-sensitive</div>
            }
          </div>
        }
      </div>

      <!-- Journey Tracker -->
      <div class="panel-section">
        <div class="panel-title">Your ET Journey</div>
        <div class="journey-steps">
          @for (step of portfolio.journeySteps(); track step.number) {
            <div class="j-step">
              <div class="j-dot" [class]="step.status">
                @if (step.status === 'done')   { ✓ }
                @else if (step.status === 'active') { → }
                @else { {{ step.number }} }
              </div>
              <span class="j-text" [class]="step.status">{{ step.label }}</span>
              @if (step.status === 'pending') {
                <span class="j-pts">+{{ step.pts }}pts</span>
              }
            </div>
          }
        </div>
      </div>

      <!-- Services Hub -->
      <div class="panel-section">
        <div class="panel-title">ET Services Hub</div>
        <div class="services-grid">
          @for (svc of portfolio.serviceTiles(); track svc.name) {
            <div class="service-tile" [class.hot]="svc.hot" (click)="chat.sendMessage(svc.prompt)">
              <div class="svc-icon">{{ svc.icon }}</div>
              <div class="svc-name">{{ svc.name }}</div>
              <div class="svc-action" [class.hot-label]="svc.hot">{{ svc.action }}</div>
              @if (svc.hot) {
                <div class="hot-dot"></div>
              }
            </div>
          }
        </div>
      </div>

    </aside>
  `,
  styles: [`
    .right-panel {
      background: var(--bg2); border-left: 1px solid var(--border);
      overflow-y: auto; height: 100%; display: flex; flex-direction: column;
    }
    .panel-section { padding: 1.1rem; border-bottom: 1px solid var(--border); }
    .panel-title {
      font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;
      color: var(--text3); font-family: var(--font-mono);
      margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
    }
    .count-badge {
      background: var(--gold-dim); color: var(--gold);
      font-size: 9px; padding: 1px 5px; border-radius: 8px;
    }

    /* ── Wealth ── */
    .wealth-card { background: var(--bg3); border-radius: var(--radius-md); padding: 12px; border: 1px solid var(--border); }
    .wealth-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
    .wealth-total  { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text); }
    .wealth-sub    { font-size: 10px; color: var(--text3); margin-top: 2px; }
    .wealth-pct    { font-size: 11px; font-family: var(--font-mono); }
    .wealth-pct.up { color: var(--green); }
    .asset-rows    { display: flex; flex-direction: column; gap: 8px; }
    .asset-row {
      display: flex; align-items: center; gap: 8px;
      font-size: 11px; cursor: pointer; border-radius: 4px;
      padding: 2px 0; transition: opacity 0.15s;
    }
    .asset-row:hover { opacity: 0.8; }
    .aname   { width: 80px; color: var(--text2); font-size: 11px; flex-shrink: 0; }
    .abar-bg { flex: 1; height: 3px; background: var(--bg4); border-radius: 2px; overflow: hidden; }
    .abar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
    .apct    { width: 28px; text-align: right; color: var(--text3); font-family: var(--font-mono); font-size: 10px; flex-shrink: 0; }
    .achange { width: 34px; text-align: right; font-family: var(--font-mono); font-size: 10px; flex-shrink: 0; }
    .achange.up { color: var(--green); }
    .achange.dn { color: var(--red);   }

    /* ── Opportunities ── */
    .opp-card {
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 9px 11px;
      margin-bottom: 7px; cursor: pointer; transition: all 0.15s;
    }
    .opp-card:last-child { margin-bottom: 0; }
    .opp-card:hover { border-color: rgba(201,168,76,0.25); }
    .opp-card.urgent { border-color: rgba(245,158,11,0.25); animation: borderGlow 3s infinite; }
    .opp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
    .opp-name   { font-size: 11.5px; font-weight: 500; color: var(--text); }
    .opp-tag    { font-size: 9px; padding: 2px 5px; border-radius: 4px; font-family: var(--font-mono); }
    .otag-prime   { background: var(--gold-dim);  color: var(--gold);  }
    .otag-market  { background: var(--blue-dim);  color: var(--blue);  }
    .otag-service { background: var(--green-dim); color: var(--green); }
    .otag-event   { background: var(--amber-dim); color: var(--amber); }
    .opp-desc     { font-size: 10px; color: var(--text3); line-height: 1.5; }
    .urgent-label { font-size: 9px; color: var(--amber); margin-top: 4px; font-family: var(--font-mono); }

    /* ── Journey ── */
    .journey-steps { display: flex; flex-direction: column; gap: 7px; }
    .j-step  { display: flex; align-items: center; gap: 8px; }
    .j-dot {
      width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-weight: 600;
    }
    .j-dot.done    { background: var(--green-dim); color: var(--green); border: 1px solid rgba(61,201,122,0.3); }
    .j-dot.active  { background: var(--gold-dim);  color: var(--gold);  border: 1px solid rgba(201,168,76,0.4); animation: pulse 2s infinite; }
    .j-dot.pending { background: var(--bg4); color: var(--text3); border: 1px solid var(--border); }
    .j-text        { flex: 1; font-size: 11px; color: var(--text2); }
    .j-text.done   { color: var(--text3); text-decoration: line-through; }
    .j-text.active { color: var(--text); font-weight: 500; }
    .j-pts { font-size: 9px; color: var(--text3); font-family: var(--font-mono); flex-shrink: 0; }

    /* ── Services ── */
    .services-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .service-tile {
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 10px 8px;
      cursor: pointer; transition: all 0.15s; text-align: center;
      position: relative; overflow: hidden;
    }
    .service-tile:hover { border-color: var(--border2); background: var(--bg4); }
    .service-tile.hot   { border-color: rgba(201,168,76,0.2); }
    .svc-icon   { font-size: 18px; margin-bottom: 4px; }
    .svc-name   { font-size: 11px; color: var(--text2); margin-bottom: 2px; }
    .svc-action { font-size: 9px; color: var(--text3); font-family: var(--font-mono); }
    .svc-action.hot-label { color: var(--gold); }
    .hot-dot {
      position: absolute; top: 6px; right: 6px;
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--gold); animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; } 50% { opacity: 0.25; }
    }
    @keyframes borderGlow {
      0%, 100% { border-color: rgba(245,158,11,0.2); }
      50%       { border-color: rgba(245,158,11,0.5); }
    }
  `],
})
export class RightPanelComponent {
  portfolio = inject(PortfolioService);
  chat      = inject(ChatService);
}
