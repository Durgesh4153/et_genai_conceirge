import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '../../services/user-profile.service';
import { PortfolioService } from '../../services/portfolio.service';
import { ChatService } from '../../services/chat.service';
import { NewsService } from '../../services/news.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar">

      <!-- Profile Card -->
      <div class="profile-card">
        <div class="avatar">{{ profile.profile().initials }}</div>
        <div class="profile-info">
          <div class="pname">{{ profile.profile().name }}</div>
          <div class="ptier">
            <span class="tier-dot"></span>
            {{ profile.tierLabel() }}
          </div>
        </div>
        <div class="profile-score-badge">{{ profile.computedScore() }}</div>
      </div>

      <!-- Discovery Score -->
      <div class="score-block">
        <div class="score-header">
          <span class="score-label">ET Discovery Score</span>
          <span class="score-pts">{{ profile.computedScore() }}<span class="score-max">/100</span></span>
        </div>
        <div class="score-track">
          <div class="score-fill" [style.width.%]="profile.computedScore()"></div>
        </div>
        <div class="score-hint">{{ profile.scoreTierLabel() }}</div>
        <div class="eco-pct">
          <span class="eco-pct-value">{{ profile.ecosystemPct() }}%</span> of ET ecosystem explored
        </div>
      </div>

      <!-- ET Live Headlines -->
      <div class="news-section">
        <div class="news-header">
          <span class="news-label">ET Live Headlines</span>
          @if (news.loading()) {
            <span class="news-loading-dot"></span>
          } @else {
            <span class="news-live-dot"></span>
          }
        </div>
        <div class="news-list">
          @if (news.loading()) {
            @for (i of [1,2,3,4]; track i) {
              <div class="news-skeleton">
                <div class="sk-line long"></div>
                <div class="sk-line short"></div>
              </div>
            }
          } @else {
            @for (item of news.headlines().slice(0, 6); track item.title) {
              <div class="news-item" (click)="openNewsLink(item.link, item.title)" id="news-{{ $index }}">
                <div class="news-category">{{ item.category }}</div>
                <div class="news-title">{{ item.title }}</div>
                <div class="news-time">{{ news.getFormattedTime(item.pubDate) }}</div>
              </div>
            }
          }
        </div>
        <a href="https://economictimes.indiatimes.com" target="_blank" class="news-more-link">
          View all on ET →
        </a>
      </div>

      <!-- Concierge nav -->
      <div class="nav-group">
        <div class="nav-label">Concierge</div>
        <div class="nav-item" [class.active]="activeNav === 'AI Navigator'" (click)="handleNavClick('AI Navigator')" id="nav-ai-navigator">
          <span class="ni">◈</span> AI Navigator
        </div>
        <div class="nav-item" [class.active]="activeNav === 'My Portfolio'" (click)="handleNavClick('My Portfolio')" id="nav-portfolio">
          <span class="ni">◎</span> My Portfolio
          <span class="badge">Live</span>
        </div>
        <div class="nav-item" [class.active]="activeNav === 'Goals Tracker'" (click)="handleNavClick('Goals Tracker')" id="nav-goals">
          <span class="ni">◇</span> Goals Tracker
        </div>
      </div>

      <!-- ET Ecosystem nav -->
      <div class="nav-group">
        <div class="nav-label">ET Ecosystem</div>
        <div class="nav-item" [class.active]="activeNav === 'ET Prime'" (click)="handleNavClick('ET Prime')" id="nav-et-prime">
          <span class="ni et-r">▣</span> ET Prime
          <span class="badge prime">Active</span>
        </div>
        <div class="nav-item" [class.active]="activeNav === 'ET Markets'" (click)="handleNavClick('ET Markets')" id="nav-markets">
          <span class="ni">◈</span> ET Markets
        </div>
        <div class="nav-item" [class.active]="activeNav === 'Masterclasses'" (click)="handleNavClick('Masterclasses')" id="nav-masterclasses">
          <span class="ni">◎</span> Masterclasses
          <span class="badge new">3 New</span>
        </div>
        <div class="nav-item" [class.active]="activeNav === 'Wealth Events'" (click)="handleNavClick('Wealth Events')" id="nav-events">
          <span class="ni">◇</span> Wealth Events
        </div>
        <div class="nav-item" [class.active]="activeNav === 'Services Hub'" (click)="handleNavClick('Services Hub')" id="nav-services">
          <span class="ni">▣</span> Services Hub
        </div>
      </div>

    </aside>
  `,
  styles: [`
    .sidebar {
      background: var(--bg2);
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      overflow-y: auto; padding: 1rem 0; gap: 0;
    }

    /* ── Profile ── */
    .profile-card {
      display: flex; align-items: center; gap: 10px;
      padding: 0 1.1rem 1rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 0.9rem;
      flex-shrink: 0;
    }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
      background: var(--gold-dim); border: 1.5px solid var(--gold);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; color: var(--gold); font-weight: 700;
    }
    .profile-info { flex: 1; min-width: 0; }
    .pname { font-size: 12.5px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ptier {
      display: flex; align-items: center; gap: 5px;
      font-size: 9.5px; color: var(--gold); font-family: var(--font-mono); margin-top: 1px;
    }
    .tier-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }
    .profile-score-badge {
      width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
      background: var(--gold-dim); border: 1px solid rgba(201,168,76,0.3);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-mono); font-size: 10px; font-weight: 600; color: var(--gold);
    }

    /* ── Discovery Score ── */
    .score-block {
      padding: 0 1.1rem 1rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 0.9rem;
      flex-shrink: 0;
    }
    .score-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
    .score-label  { font-size: 9.5px; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); font-family: var(--font-mono); }
    .score-pts    { font-family: var(--font-display); font-size: 20px; color: var(--gold); font-weight: 600; }
    .score-max    { font-size: 11px; color: var(--text3); }
    .score-track  { height: 3px; background: var(--bg4); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
    .score-fill   { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold2)); border-radius: 3px; transition: width 0.8s ease; }
    .score-hint   { font-size: 9.5px; color: var(--text3); font-family: var(--font-mono); }

    .eco-pct       { margin-top: 8px; font-size: 9.5px; color: var(--text3); font-family: var(--font-mono); }
    .eco-pct-value { color: var(--gold); font-weight: 600; font-size: 11px; }

    /* ── Nav ── */
    .nav-group { padding: 0 1.1rem; margin-bottom: 1rem; flex-shrink: 0; }
    .nav-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text3); font-family: var(--font-mono); margin-bottom: 3px; }
    .nav-item {
      display: flex; align-items: center; gap: 7px;
      padding: 6px 8px; border-radius: 7px; cursor: pointer;
      font-size: 12px; color: var(--text2); transition: all 0.15s;
      margin-bottom: 1px; border: 1px solid transparent;
    }
    .nav-item:hover  { background: var(--bg3); color: var(--text); }
    .nav-item.active { background: var(--gold-dim); color: var(--gold2); border-color: rgba(201,168,76,0.15); font-weight: 500; }
    .ni       { font-size: 11px; flex-shrink: 0; }
    .ni.et-r  { color: var(--et-red, #e21b2f); }
    .badge    { margin-left: auto; font-size: 9px; background: var(--gold-dim); color: var(--gold); padding: 2px 5px; border-radius: 8px; font-family: var(--font-mono); }
    .badge.prime { background: var(--et-red-dim, rgba(226,27,47,0.1)); color: var(--et-red, #e21b2f); }
    .badge.new { background: var(--blue-dim); color: var(--blue); }

    /* ── ET Headlines ── */
    .news-section {
      padding: 0 1.1rem 1.1rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 0.9rem;
    }
    .news-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 8px;
    }
    .news-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text3); font-family: var(--font-mono); }
    .news-live-dot {
      width: 6px; height: 6px; border-radius: 50%; background: var(--green);
      animation: pulse 2s infinite;
    }
    .news-loading-dot {
      width: 6px; height: 6px; border-radius: 50%; background: var(--gold);
      animation: pulse 1s infinite;
    }
    .news-list { display: flex; flex-direction: column; gap: 1px; }
    
    .news-item {
      padding: 7px 8px; border-radius: 7px; cursor: pointer;
      transition: background 0.15s; border: 1px solid transparent;
    }
    .news-item:hover { background: var(--bg3); border-color: var(--border); }
    .news-category {
      font-size: 8.5px; font-family: var(--font-mono); color: var(--gold);
      text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 3px;
    }
    .news-title {
      font-size: 11px; color: var(--text2); line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .news-time { font-size: 9px; color: var(--text3); font-family: var(--font-mono); margin-top: 3px; }

    /* Skeleton loaders */
    .news-skeleton { padding: 7px 8px; }
    .sk-line {
      height: 8px; background: var(--bg3); border-radius: 4px;
      margin-bottom: 5px; animation: shimmer 1.5s infinite;
    }
    .sk-line.long { width: 90%; }
    .sk-line.short { width: 55%; }

    .news-more-link {
      display: block; margin-top: 10px; flex-shrink: 0;
      font-size: 10px; color: var(--gold);
      text-decoration: none; font-family: var(--font-mono);
      transition: color 0.2s;
    }
    .news-more-link:hover { color: var(--gold2); }

    @keyframes pulse   { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
    @keyframes shimmer { 0%,100%{opacity:0.5;} 50%{opacity:0.2;} }
  `],
})
export class SidebarComponent {
  profile   = inject(UserProfileService);
  portfolio = inject(PortfolioService);
  chat      = inject(ChatService);
  news      = inject(NewsService);

  activeNav: string = 'AI Navigator';

  discoveryEntries = () => {
    const bd = this.profile.discoveryBreakdown();
    return Object.entries(bd).map(([key, val]) => ({ key, ...val }));
  };

  handleNavClick(navItem: string) {
    this.activeNav = navItem;
    if (navItem === 'AI Navigator')   { this.chat.setMode('Navigator'); }
    else if (navItem === 'My Portfolio') { this.profile.unlockDiscovery('portfolioSync'); this.chat.sendMessage('Show me my full portfolio snapshot'); }
    else if (navItem === 'Goals Tracker')  { this.profile.unlockDiscovery('goalSetting'); this.chat.setMode('Goals'); }
    else if (navItem === 'ET Prime')       { this.profile.unlockDiscovery('primeContent'); this.chat.sendMessage('What is new on ET Prime today? Show me top articles.'); }
    else if (navItem === 'ET Markets')     { this.profile.unlockDiscovery('markets'); this.chat.setMode('Markets'); }
    else if (navItem === 'Masterclasses')  { this.profile.unlockDiscovery('masterclass'); this.chat.sendMessage('Show all upcoming ET masterclasses and courses'); }
    else if (navItem === 'Wealth Events')  { this.profile.unlockDiscovery('events'); this.chat.sendMessage('Register me for ET Wealth Summit and upcoming wealth events'); }
    else if (navItem === 'Services Hub')   { this.profile.unlockDiscovery('services'); this.chat.setMode('Services'); }
  }

  openNewsLink(link: string, title: string): void {
    this.chat.sendMessage(`Tell me more about this news: "${title}"`);
    this.profile.unlockDiscovery('primeContent');
  }
}
