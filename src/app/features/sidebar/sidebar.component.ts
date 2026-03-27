import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '../../services/user-profile.service';
import { PortfolioService } from '../../services/portfolio.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar">

      <!-- Profile -->
      <div class="profile-card">
        <div class="avatar">{{ profile.profile().initials }}</div>
        <div>
          <div class="pname">{{ profile.profile().name }}</div>
          <div class="ptier">● {{ profile.tierLabel() }}</div>
        </div>
      </div>

      <!-- Discovery Score — DYNAMIC -->
      <div class="score-block">
        <div class="score-header">
          <span class="score-label">ET Discovery Score</span>
          <span class="score-pts">{{ profile.computedScore() }}<span class="score-max">/100</span></span>
        </div>
        <div class="score-track">
          <div class="score-fill" [style.width.%]="profile.computedScore()"></div>
        </div>
        <div class="score-hint">{{ profile.scoreTierLabel() }}</div>

        <!-- Breakdown chips -->
        <div class="discovery-chips">
          @for (entry of discoveryEntries(); track entry.key) {
            <div class="disc-chip" [class.unlocked]="entry.unlocked"
                 (click)="!entry.unlocked && chat.sendMessage('Tell me about ' + entry.label)">
              <span class="dc-icon">{{ entry.unlocked ? '✓' : '🔒' }}</span>
              <span class="dc-label">{{ entry.label }}</span>
              @if (!entry.unlocked) {
                <span class="dc-pts">+{{ entry.pts }}</span>
              }
            </div>
          }
        </div>
        <div class="eco-pct">
          <span class="eco-pct-value">{{ profile.ecosystemPct() }}%</span> of ET ecosystem explored
        </div>
      </div>

      <!-- Concierge nav -->
      <div class="nav-group">
        <div class="nav-label">Concierge</div>
        <div class="nav-item" [class.active]="activeNav === 'AI Navigator'" (click)="handleNavClick('AI Navigator')"><span class="ni">◈</span> AI Navigator</div>
        <div class="nav-item" [class.active]="activeNav === 'My Portfolio'" (click)="handleNavClick('My Portfolio')"><span class="ni">◎</span> My Portfolio <span class="badge">Live</span></div>
        <div class="nav-item" [class.active]="activeNav === 'Goals Tracker'" (click)="handleNavClick('Goals Tracker')"><span class="ni">◇</span> Goals Tracker</div>
      </div>

      <!-- ET Ecosystem nav -->
      <div class="nav-group">
        <div class="nav-label">ET Ecosystem</div>
        <div class="nav-item" [class.active]="activeNav === 'ET Prime'" (click)="handleNavClick('ET Prime')"><span class="ni">▣</span> ET Prime <span class="badge">Active</span></div>
        <div class="nav-item" [class.active]="activeNav === 'ET Markets'" (click)="handleNavClick('ET Markets')"><span class="ni">◈</span> ET Markets</div>
        <div class="nav-item" [class.active]="activeNav === 'Masterclasses'" (click)="handleNavClick('Masterclasses')"><span class="ni">◎</span> Masterclasses <span class="badge new">3 New</span></div>
        <div class="nav-item" [class.active]="activeNav === 'Wealth Events'" (click)="handleNavClick('Wealth Events')"><span class="ni">◇</span> Wealth Events</div>
        <div class="nav-item" [class.active]="activeNav === 'Services Hub'" (click)="handleNavClick('Services Hub')"><span class="ni">▣</span> Services Hub</div>
      </div>

    </aside>
  `,
  styles: [`
    .sidebar {
      background: var(--bg2);
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      overflow-y: auto; padding: 1.25rem 0; gap: 0;
    }

    /* Profile */
    .profile-card {
      display: flex; align-items: center; gap: 10px;
      padding: 0 1.25rem 1.25rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1rem;
    }
    .avatar {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      background: var(--gold-dim); border: 1.5px solid var(--gold);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display); font-size: 14px;
      color: var(--gold); font-weight: 600;
    }
    .pname { font-size: 13px; font-weight: 600; color: var(--text); }
    .ptier { font-size: 10px; color: var(--gold); font-family: var(--font-mono); margin-top: 1px; }

    /* Discovery Score */
    .score-block {
      padding: 0 1.25rem 1.25rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1rem;
    }
    .score-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
    .score-label  { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); font-family: var(--font-mono); }
    .score-pts    { font-family: var(--font-display); font-size: 22px; color: var(--gold); font-weight: 600; }
    .score-max    { font-size: 12px; color: var(--text3); }
    .score-track  { height: 4px; background: var(--bg4); border-radius: 3px; overflow: hidden; }
    .score-fill   { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold2)); border-radius: 3px; transition: width 0.8s ease; }
    .score-hint   { font-size: 10px; color: var(--text3); margin-top: 5px; font-family: var(--font-mono); }

    /* Discovery chips */
    .discovery-chips { display: flex; flex-direction: column; gap: 3px; margin-top: 10px; }
    .disc-chip {
      display: flex; align-items: center; gap: 6px;
      font-size: 10px; padding: 4px 6px; border-radius: 5px;
      transition: all 0.2s; cursor: pointer;
      color: var(--text3);
    }
    .disc-chip:hover:not(.unlocked) { background: var(--bg3); color: var(--gold2); }
    .disc-chip.unlocked { color: var(--green); cursor: default; }
    .dc-icon { font-size: 9px; flex-shrink: 0; width: 14px; text-align: center; }
    .dc-label { flex: 1; }
    .dc-pts {
      font-family: var(--font-mono); font-size: 9px;
      color: var(--gold); background: var(--gold-dim);
      padding: 1px 4px; border-radius: 4px;
    }

    .eco-pct {
      margin-top: 8px; font-size: 10px; color: var(--text3);
      font-family: var(--font-mono);
    }
    .eco-pct-value { color: var(--gold); font-weight: 600; font-size: 12px; }

    /* Nav */
    .nav-group { padding: 0 1.25rem; margin-bottom: 1.25rem; }
    .nav-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text3); font-family: var(--font-mono); margin-bottom: 4px; }
    .nav-item {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 8px; border-radius: 6px; cursor: pointer;
      font-size: 12.5px; color: var(--text2); transition: all 0.15s;
      margin-bottom: 1px; border: 1px solid transparent;
    }
    .nav-item:hover  { background: var(--bg3); color: var(--text); }
    .nav-item.active { background: var(--gold-dim); color: var(--gold2); border-color: rgba(201,168,76,0.18); }
    .ni     { font-size: 12px; flex-shrink: 0; }
    .badge  { margin-left: auto; font-size: 9px; background: var(--gold-dim); color: var(--gold); padding: 2px 5px; border-radius: 8px; font-family: var(--font-mono); }
    .badge.new { background: var(--blue-dim); color: var(--blue); }
  `],
})
export class SidebarComponent {
  profile   = inject(UserProfileService);
  portfolio = inject(PortfolioService);
  chat      = inject(ChatService);

  activeNav: string = 'AI Navigator';

  /** Expose discovery breakdown as array for template iteration */
  discoveryEntries = () => {
    const bd = this.profile.discoveryBreakdown();
    return Object.entries(bd).map(([key, val]) => ({ key, ...val }));
  };

  handleNavClick(navItem: string) {
    this.activeNav = navItem;

    // Track ecosystem discovery — unlock touchpoints when users explore
    if (navItem === 'AI Navigator') {
      this.chat.setMode('Navigator');
      this.chat.sendMessage('Hi');
    } else if (navItem === 'My Portfolio') {
      this.profile.unlockDiscovery('portfolioSync');
      this.chat.sendMessage('Show me my full portfolio snapshot');
    } else if (navItem === 'Goals Tracker') {
      this.profile.unlockDiscovery('goalSetting');
      this.chat.setMode('Goals');
    } else if (navItem === 'ET Prime') {
      this.profile.unlockDiscovery('primeContent');
      this.chat.sendMessage('What is new on ET Prime today?');
    } else if (navItem === 'ET Markets') {
      this.profile.unlockDiscovery('markets');
      this.chat.setMode('Markets');
    } else if (navItem === 'Masterclasses') {
      this.profile.unlockDiscovery('masterclass');
      this.chat.sendMessage('Show all upcoming ET masterclasses');
    } else if (navItem === 'Wealth Events') {
      this.profile.unlockDiscovery('events');
      this.chat.sendMessage('Register me for ET Wealth Summit on March 28');
    } else if (navItem === 'Services Hub') {
      this.profile.unlockDiscovery('services');
      this.chat.setMode('Services');
    }
  }
}
