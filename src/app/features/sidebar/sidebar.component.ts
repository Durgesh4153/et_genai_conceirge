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

      <!-- Discovery score -->
      <div class="score-block">
        <div class="score-header">
          <span class="score-label">Discovery Score</span>
          <span class="score-pts">{{ profile.profile().discoveryScore }}<span class="score-max">/100</span></span>
        </div>
        <div class="score-track">
          <div class="score-fill" [style.width.%]="profile.profile().discoveryScore"></div>
        </div>
        <div class="score-hint">Complete journey → unlock ET Wealth RM</div>
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

      <!-- Ecosystem coverage -->
      <div class="eco-widget">
        <div class="eco-title">ET Ecosystem Coverage</div>
        @for (item of portfolio.ecosystemCoverage(); track item.name) {
          <div class="eco-row">
            <span class="eco-name">{{ item.name }}</span>
            @if (item.status === 'active') {
              <span class="eco-val done">✓ Active</span>
            } @else if (item.status === 'partial') {
              <span class="eco-val partial">{{ item.value }}</span>
            } @else {
              <span class="eco-val locked" (click)="chat.sendMessage('Tell me about ' + item.name + ' and how to unlock it')">
                Unlock +{{ item.pts }}pts →
              </span>
            }
          </div>
        }
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

    /* Score */
    .score-block {
      padding: 0 1.25rem 1.25rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1rem;
    }
    .score-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
    .score-label  { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); font-family: var(--font-mono); }
    .score-pts    { font-family: var(--font-display); font-size: 20px; color: var(--gold); font-weight: 600; }
    .score-max    { font-size: 12px; color: var(--text3); }
    .score-track  { height: 3px; background: var(--bg4); border-radius: 2px; overflow: hidden; }
    .score-fill   { height: 100%; background: var(--gold); border-radius: 2px; transition: width 0.8s ease; }
    .score-hint   { font-size: 10px; color: var(--text3); margin-top: 5px; }

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

    /* Ecosystem */
    .eco-widget {
      margin: auto 1.25rem 0;
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 10px 12px;
    }
    .eco-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); font-family: var(--font-mono); margin-bottom: 8px; }
    .eco-row   { display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 4px; }
    .eco-name  { color: var(--text2); }
    .eco-val.done    { color: var(--green); }
    .eco-val.partial { color: var(--gold); }
    .eco-val.locked  { color: var(--text3); cursor: pointer; transition: color 0.15s; }
    .eco-val.locked:hover { color: var(--gold2); }
  `],
})
export class SidebarComponent {
  profile   = inject(UserProfileService);
  portfolio = inject(PortfolioService);
  chat      = inject(ChatService);

  activeNav: string = 'AI Navigator';

  handleNavClick(navItem: string) {
    this.activeNav = navItem;
    
    // Wire up to existing Mock Backend
    if (navItem === 'AI Navigator') {
      this.chat.setMode('Navigator');
      // Reset by saying hi or start over if needed
      this.chat.sendMessage('Hi');
    } else if (navItem === 'My Portfolio') {
      this.chat.sendMessage('Show me my full portfolio snapshot');
    } else if (navItem === 'Goals Tracker') {
      this.chat.setMode('Goals');
    } else if (navItem === 'ET Prime') {
      this.chat.sendMessage('What is new on ET Prime today?');
    } else if (navItem === 'ET Markets') {
      this.chat.setMode('Markets');
    } else if (navItem === 'Masterclasses') {
      this.chat.sendMessage('Show all upcoming ET masterclasses');
    } else if (navItem === 'Wealth Events') {
      this.chat.sendMessage('Register me for ET Wealth Summit on March 28');
    } else if (navItem === 'Services Hub') {
      this.chat.setMode('Services');
    }
  }
}
