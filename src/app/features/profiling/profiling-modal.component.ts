import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-profiling-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (profile.showProfilingModal()) {
      <div class="overlay" [class.blur-out]="false">

        <!-- ─── PHASE: LANDING ─── -->
        @if (phase === 'landing') {
          <div class="auth-screen" [@.disabled]="true">

            <!-- Left: Branding Panel -->
            <div class="auth-left">
              <div class="auth-left-bg"></div>
              <div class="auth-brand-content">
                <div class="auth-et-logo">
                  <span class="et-badge-large">ET</span>
                  <div class="auth-brand-text">
                    <div class="auth-brand-name">Economic Times</div>
                    <div class="auth-brand-sub">Intelligence Platform</div>
                  </div>
                </div>
                <h1 class="auth-headline">Your Personal<br><span class="headline-gold">AI Concierge</span><br>for Finance</h1>
                <p class="auth-desc">The entire ET ecosystem — markets, wealth management, masterclasses, events, and financial services — guided by your personal AI navigator.</p>
                <div class="auth-features">
                  <div class="af-item"><span class="af-icon">◈</span> Navigator Agent — Personalized AI guidance</div>
                  <div class="af-item"><span class="af-icon">◎</span> Opportunity Agent — Real-time cross-sell engine</div>
                  <div class="af-item"><span class="af-icon">◇</span> Fulfilment Agent — Executes financial actions</div>
                  <div class="af-item"><span class="af-icon">▣</span> Live market data — SENSEX, NIFTY, Gold, Forex</div>
                </div>
                <div class="auth-stats">
                  <div class="auth-stat"><span class="as-num">2M+</span><span class="as-label">ET Prime Users</span></div>
                  <div class="auth-stat-divider"></div>
                  <div class="auth-stat"><span class="as-num">₹50Cr+</span><span class="as-label">Avg AUM Managed</span></div>
                  <div class="auth-stat-divider"></div>
                  <div class="auth-stat"><span class="as-num">4 AI</span><span class="as-label">Specialised Agents</span></div>
                </div>
              </div>
            </div>

            <!-- Right: Auth Panel -->
            <div class="auth-right">
              <div class="auth-card">

                <div class="auth-card-header">
                  <div class="auth-card-logo">
                    <span class="et-badge-sm">ET</span>
                    <span class="auth-card-title">Concierge</span>
                    <span class="auth-card-version">v2 · Agentic AI</span>
                  </div>
                  <h2 class="auth-card-h2">Welcome back</h2>
                  <p class="auth-card-sub">Sign in to unlock your personalised financial intelligence layer across the ET ecosystem</p>
                </div>

                <!-- Google Sign-In -->
                <button class="btn-google" id="google-signin-btn" (click)="startGoogleSignIn()">
                  <svg class="google-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div class="auth-divider">
                  <span class="divider-line"></span>
                  <span class="divider-text">or</span>
                  <span class="divider-line"></span>
                </div>

                <!-- ET Member Login -->
                <button class="btn-et-member" id="et-member-btn" (click)="startMemberLogin()">
                  <span class="et-badge-btn">ET</span>
                  Continue with ET Account
                </button>

                <div class="auth-guest-row">
                  <button class="btn-guest" id="guest-btn" (click)="continueAsGuest()">
                    Explore as Guest →
                  </button>
                </div>

                <div class="auth-footer-note">
                  By signing in, you agree to Economic Times'
                  <a href="https://economictimes.indiatimes.com" target="_blank">Terms of Service</a>
                  and <a href="https://economictimes.indiatimes.com" target="_blank">Privacy Policy</a>
                </div>

                <!-- Partners row -->
                <div class="auth-partners">
                  <span class="partners-label">Powered by</span>
                  <span class="partner-chip">Gemini AI</span>
                  <span class="partner-chip">ET Markets</span>
                  <span class="partner-chip">NSE Live</span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ─── PHASE: SIGNING IN (OAuth simulation) ─── -->
        @if (phase === 'signing-in') {
          <div class="signingin-overlay">
            <div class="signing-card">
              <div class="signing-spinner-wrap">
                <div class="signing-spinner"></div>
                <svg class="signing-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div class="signing-text">Signing in with Google...</div>
              <div class="signing-sub">Connecting to ET Intelligence Platform</div>
              <div class="signing-steps">
                <div class="signing-step" [class.done]="signingStep >= 1" [class.active]="signingStep === 0">
                  <span class="step-check">{{ signingStep >= 1 ? '✓' : '○' }}</span> Authenticating with Google
                </div>
                <div class="signing-step" [class.done]="signingStep >= 2" [class.active]="signingStep === 1">
                  <span class="step-check">{{ signingStep >= 2 ? '✓' : '○' }}</span> Verifying ET account
                </div>
                <div class="signing-step" [class.done]="signingStep >= 3" [class.active]="signingStep === 2">
                  <span class="step-check">{{ signingStep >= 3 ? '✓' : '○' }}</span> Loading financial profile
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ─── PHASE: WELCOME ─── -->
        @if (phase === 'welcome') {
          <div class="welcome-overlay">
            <div class="welcome-card">
              <div class="welcome-check-wrap">
                <div class="welcome-check">✓</div>
              </div>
              <div class="welcome-name">Welcome, {{ profile.profile().name.split(' ')[0] }}!</div>
              <div class="welcome-sub">Your ET Concierge is ready</div>
              <div class="welcome-badges">
                <span class="wb">Navigator Agent ●</span>
                <span class="wb">Opportunity Agent ●</span>
                <span class="wb">Fulfilment Agent ●</span>
              </div>
              <div class="welcome-hint">Launching your personalised dashboard...</div>
            </div>
          </div>
        }

        <!-- ─── PHASE: QUIZ ─── -->
        @if (phase === 'quiz') {
          <div class="modal-overlay-bg">
            <div class="modal" role="dialog" aria-modal="true">

              <!-- Gradient top bar -->
              <div class="modal-gradient"></div>

              <!-- Header -->
              <div class="modal-eyebrow">
                <span class="agent-chip">
                  <span class="chip-dot"></span>
                  Profiling Agent
                </span>
                <span class="step-count">{{ profile.profilingStep() + 1 }} / {{ profile.profilingQuestions.length }}</span>
              </div>
              <div class="modal-title">Build Your <span class="gold">Intelligence Profile</span></div>
              <div class="modal-sub">{{ profile.profile().name.split(' ')[0] }}, answer {{ profile.profilingQuestions.length }} quick questions so I can personalise your entire ET experience</div>

              <!-- Step bar -->
              <div class="step-bar">
                @for (q of profile.profilingQuestions; track $index; let i = $index) {
                  <div class="step-seg"
                       [class.done]="i < profile.profilingStep()"
                       [class.active]="i === profile.profilingStep()">
                  </div>
                }
              </div>

              <!-- Question -->
              @if (profile.currentQuestion(); as q) {
                <div class="profile-q">{{ q.question }}</div>
                <div class="profile-opts">
                  @for (opt of q.options; track opt) {
                    <div class="profile-opt"
                         [class.selected]="profile.selectedOption() === opt"
                         (click)="profile.selectOption(opt)">
                      <div class="opt-radio" [class.filled]="profile.selectedOption() === opt">
                        @if (profile.selectedOption() === opt) {
                          <div class="opt-check">✓</div>
                        }
                      </div>
                      {{ opt }}
                    </div>
                  }
                </div>
              }

              <!-- Footer -->
              <div class="modal-footer">
                <div class="footer-left">
                  @if (profile.profilingStep() > 0) {
                    <button class="btn-ghost" (click)="profile.skipProfile()">Skip for now</button>
                  }
                </div>
                <button class="btn-primary"
                        [disabled]="!profile.selectedOption()"
                        (click)="profile.nextQuestion()">
                  {{ profile.isLastQuestion() ? '✨ Build My Profile' : 'Continue →' }}
                </button>
              </div>

            </div>
          </div>
        }

      </div>
    }
  `,
  styles: [`
    /* ─── Full-page overlay ─── */
    .overlay {
      position: fixed; inset: 0; z-index: 500;
      animation: fadeIn 0.3s ease;
    }

    /* ════════════════════════════
       AUTH SCREEN (LANDING)
    ════════════════════════════ */
    .auth-screen {
      display: grid;
      grid-template-columns: 1fr 1fr;
      height: 100vh;
      overflow: hidden;
    }

    /* ── Left Brand Panel ── */
    .auth-left {
      position: relative;
      background: linear-gradient(135deg, #070a0f 0%, #0c1520 40%, #070a0f 100%);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .auth-left-bg {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 60% 50% at 30% 40%, rgba(226,27,47,0.08) 0%, transparent 70%),
        radial-gradient(ellipse 50% 60% at 70% 70%, rgba(201,168,76,0.06) 0%, transparent 60%);
    }
    /* Subtle grid pattern */
    .auth-left::before {
      content: '';
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .auth-brand-content {
      position: relative; z-index: 2;
      padding: 3rem;
      animation: fadeUp 0.6s ease 0.1s both;
    }
    .auth-et-logo {
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 2.5rem;
    }
    .et-badge-large {
      width: 54px; height: 54px; border-radius: 10px;
      background: #e21b2f; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: 900; letter-spacing: 1px;
      box-shadow: 0 0 30px rgba(226,27,47,0.3);
    }
    .auth-brand-text { line-height: 1.2; }
    .auth-brand-name { font-size: 18px; font-weight: 600; color: var(--text); }
    .auth-brand-sub  { font-size: 12px; color: var(--text3); font-family: var(--font-mono); margin-top: 2px; }

    .auth-headline {
      font-family: var(--font-display);
      font-size: 44px; font-weight: 700; line-height: 1.1;
      color: var(--text); margin-bottom: 1.25rem;
      letter-spacing: -0.02em;
    }
    .headline-gold {
      background: linear-gradient(90deg, var(--gold), var(--gold2), var(--gold3));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .auth-desc {
      font-size: 14px; color: var(--text2); line-height: 1.7;
      max-width: 400px; margin-bottom: 2rem;
    }
    .auth-features {
      display: flex; flex-direction: column; gap: 10px;
      margin-bottom: 2.5rem;
    }
    .af-item {
      display: flex; align-items: center; gap: 10px;
      font-size: 13px; color: var(--text2);
    }
    .af-icon {
      color: var(--gold); font-size: 14px; flex-shrink: 0;
    }
    .auth-stats {
      display: flex; align-items: center; gap: 1.5rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: 12px; padding: 16px 20px;
    }
    .auth-stat { text-align: center; }
    .as-num   { display: block; font-family: var(--font-display); font-size: 22px; color: var(--gold); font-weight: 700; }
    .as-label { display: block; font-size: 10px; color: var(--text3); font-family: var(--font-mono); margin-top: 2px; }
    .auth-stat-divider { width: 1px; height: 36px; background: var(--border); }

    /* ── Right Auth Panel ── */
    .auth-right {
      background: var(--bg2);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
      border-left: 1px solid var(--border);
    }
    .auth-card {
      width: 100%; max-width: 420px;
      animation: slideIn 0.5s ease 0.2s both;
    }
    .auth-card-header { margin-bottom: 2rem; }
    .auth-card-logo {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 1.5rem;
    }
    .et-badge-sm {
      background: #e21b2f; color: white;
      padding: 3px 8px; border-radius: 5px;
      font-weight: 900; font-size: 13px;
    }
    .auth-card-title { font-size: 16px; font-weight: 600; color: var(--text); }
    .auth-card-version { font-size: 10px; color: var(--text3); font-family: var(--font-mono); margin-left: auto; }

    .auth-card-h2 { font-family: var(--font-display); font-size: 28px; color: var(--text); margin-bottom: 8px; font-weight: 600; }
    .auth-card-sub { font-size: 13px; color: var(--text2); line-height: 1.6; }

    /* ── Google Button ── */
    .btn-google {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 12px;
      padding: 13px 20px;
      background: #ffffff; color: #1f2937;
      border: 1.5px solid rgba(255,255,255,0.9);
      border-radius: 10px;
      font-family: var(--font-body); font-size: 15px; font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      margin-bottom: 14px;
    }
    .btn-google:hover {
      background: #f8faff;
      box-shadow: 0 4px 16px rgba(66,133,244,0.25);
      transform: translateY(-1px);
    }
    .google-logo { width: 20px; height: 20px; flex-shrink: 0; }

    /* ── Divider ── */
    .auth-divider {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 14px;
    }
    .divider-line { flex: 1; height: 1px; background: var(--border); }
    .divider-text { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; }

    /* ── ET Member Button ── */
    .btn-et-member {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 12px 20px;
      background: transparent; color: var(--text2);
      border: 1px solid var(--border2);
      border-radius: 10px;
      font-family: var(--font-body); font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.2s;
      margin-bottom: 16px;
    }
    .btn-et-member:hover { background: var(--bg3); color: var(--text); border-color: var(--border3); }
    .et-badge-btn {
      background: var(--et-red); color: white;
      padding: 2px 6px; border-radius: 4px;
      font-size: 11px; font-weight: 900;
    }

    /* ── Guest ── */
    .auth-guest-row { text-align: center; margin-bottom: 1.5rem; }
    .btn-guest {
      background: none; border: none; color: var(--text3);
      font-size: 12px; cursor: pointer; padding: 6px 10px;
      transition: color 0.2s; font-family: var(--font-body);
    }
    .btn-guest:hover { color: var(--gold); }

    .auth-footer-note {
      font-size: 11px; color: var(--text3);
      text-align: center; line-height: 1.6;
      margin-bottom: 1.25rem;
    }
    .auth-footer-note a { color: var(--gold); text-decoration: none; }
    .auth-footer-note a:hover { text-decoration: underline; }

    .auth-partners {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding-top: 1rem; border-top: 1px solid var(--border);
    }
    .partners-label { font-size: 10px; color: var(--text3); font-family: var(--font-mono); }
    .partner-chip {
      font-size: 10px; color: var(--gold);
      background: var(--gold-dim); padding: 2px 8px;
      border-radius: 10px; font-family: var(--font-mono);
    }

    /* ════════════════════════════
       SIGNING-IN PHASE
    ════════════════════════════ */
    .signingin-overlay {
      position: fixed; inset: 0;
      background: rgba(7,10,15,0.95);
      backdrop-filter: blur(20px);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    .signing-card {
      text-align: center;
      animation: fadeScale 0.4s ease;
      max-width: 340px; width: 100%;
    }
    .signing-spinner-wrap {
      position: relative; width: 72px; height: 72px;
      margin: 0 auto 1.5rem;
    }
    .signing-spinner {
      position: absolute; inset: 0;
      border: 2px solid rgba(255,255,255,0.08);
      border-top-color: #4285F4;
      border-right-color: #34A853;
      border-bottom-color: #FBBC05;
      border-left-color: #EA4335;
      border-radius: 50%;
      animation: spinCircle 0.8s linear infinite;
    }
    .signing-google-icon {
      position: absolute; inset: 0;
      margin: auto; width: 32px; height: 32px;
    }
    .signing-text {
      font-size: 18px; font-weight: 600; color: var(--text);
      margin-bottom: 6px;
    }
    .signing-sub { font-size: 13px; color: var(--text3); margin-bottom: 2rem; }
    .signing-steps {
      display: flex; flex-direction: column; gap: 8px;
      text-align: left;
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: 12px; padding: 16px 20px;
    }
    .signing-step {
      display: flex; align-items: center; gap: 10px;
      font-size: 12px; color: var(--text3);
      font-family: var(--font-mono); transition: color 0.3s;
    }
    .signing-step.active { color: var(--text); }
    .signing-step.done   { color: var(--green); }
    .step-check { font-size: 13px; flex-shrink: 0; width: 16px; }

    /* ════════════════════════════
       WELCOME PHASE
    ════════════════════════════ */
    .welcome-overlay {
      position: fixed; inset: 0;
      background: rgba(7,10,15,0.95);
      backdrop-filter: blur(20px);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    .welcome-card {
      text-align: center; padding: 3rem 2rem;
      animation: fadeScale 0.5s ease;
      max-width: 400px;
    }
    .welcome-check-wrap {
      width: 80px; height: 80px; border-radius: 50%;
      background: rgba(34,197,94,0.12);
      border: 2px solid rgba(34,197,94,0.4);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.5rem;
      animation: countUp 0.4s ease;
      box-shadow: 0 0 30px rgba(34,197,94,0.15);
    }
    .welcome-check { font-size: 36px; color: var(--green); }
    .welcome-name {
      font-family: var(--font-display); font-size: 32px;
      color: var(--text); margin-bottom: 8px; font-weight: 600;
    }
    .welcome-sub { font-size: 14px; color: var(--text2); margin-bottom: 1.5rem; }
    .welcome-badges {
      display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .wb {
      font-size: 10px; font-family: var(--font-mono);
      background: var(--green-dim); color: var(--green);
      padding: 4px 10px; border-radius: 12px;
    }
    .welcome-hint { font-size: 12px; color: var(--text3); font-family: var(--font-mono); }

    /* ════════════════════════════
       QUIZ PHASE
    ════════════════════════════ */
    .modal-overlay-bg {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.25s ease;
    }
    .modal {
      background: var(--bg2);
      border: 1px solid var(--border2);
      border-radius: 18px;
      padding: 0 2rem 1.75rem;
      width: 500px; max-width: 95vw;
      animation: fadeScale 0.35s ease;
      position: relative; overflow: hidden;
    }
    .modal-gradient {
      height: 3px; margin: 0 -2rem 1.75rem;
      background: linear-gradient(90deg, var(--et-red), var(--gold), var(--gold2), var(--et-red));
      background-size: 300% 100%;
      animation: gradientShift 4s ease infinite;
    }
    .modal-eyebrow {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px;
    }
    .agent-chip {
      font-size: 10px; font-family: var(--font-mono);
      background: var(--amber-dim); color: var(--amber);
      padding: 3px 10px; border-radius: 12px;
      display: flex; align-items: center; gap: 5px;
      border: 1px solid rgba(245,158,11,0.2);
    }
    .chip-dot {
      width: 5px; height: 5px; border-radius: 50%; background: var(--amber);
      animation: pulse 1.5s infinite;
    }
    .step-count { font-size: 10px; font-family: var(--font-mono); color: var(--text3); }
    .modal-title {
      font-family: var(--font-display); font-size: 24px;
      color: var(--text); margin-bottom: 6px; font-weight: 600;
    }
    .modal-title .gold { color: var(--gold2); }
    .modal-sub { font-size: 13px; color: var(--text3); margin-bottom: 1.25rem; line-height: 1.6; }
    .step-bar { display: flex; gap: 4px; margin-bottom: 1.5rem; }
    .step-seg {
      flex: 1; height: 3px; border-radius: 2px;
      background: var(--bg4); transition: all 0.3s;
    }
    .step-seg.done   { background: var(--gold); }
    .step-seg.active {
      background: linear-gradient(90deg, var(--gold), var(--gold2));
      animation: shimmer 1.5s infinite;
    }
    .profile-q {
      font-size: 16px; color: var(--text);
      margin-bottom: 1rem; font-weight: 500; line-height: 1.5;
    }
    .profile-opts { display: flex; flex-direction: column; gap: 8px; }
    .profile-opt {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px;
      border: 1px solid var(--border);
      border-radius: 10px; cursor: pointer;
      font-size: 13px; color: var(--text2);
      transition: all 0.2s; background: var(--bg3);
    }
    .profile-opt:hover {
      border-color: rgba(201,168,76,0.3);
      background: rgba(201,168,76,0.04);
      color: var(--text);
    }
    .profile-opt.selected {
      border-color: var(--gold);
      background: var(--gold-dim); color: var(--gold2);
    }
    .opt-radio {
      width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
      border: 1.5px solid var(--border2); transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .opt-radio.filled { background: var(--gold); border-color: var(--gold); }
    .opt-check { font-size: 9px; color: #000; font-weight: 700; }
    .modal-footer {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 1.5rem;
    }
    .btn-primary {
      padding: 11px 24px; background: var(--gold); color: #000;
      border: none; border-radius: 10px;
      font-family: var(--font-body); font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--gold2); transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(201,168,76,0.3);
    }
    .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
    .btn-ghost {
      padding: 8px 14px; background: transparent;
      color: var(--text3); border: 1px solid var(--border);
      border-radius: 10px; font-family: var(--font-body);
      font-size: 12px; cursor: pointer; transition: all 0.2s;
    }
    .btn-ghost:hover { color: var(--text2); border-color: var(--border2); }

    /* ─── Global animations ─── */
    @keyframes fadeIn      { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeUp      { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeScale   { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes slideIn     { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes spinCircle  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes countUp     { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
    @keyframes shimmer     { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
    @keyframes pulse       { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    @keyframes gradientShift { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
  `],
})
export class ProfilingModalComponent implements OnInit {
  profile = inject(UserProfileService);

  /** 'landing' | 'signing-in' | 'welcome' | 'quiz' */
  phase: string = 'landing';
  signingStep: number = 0;

  ngOnInit() {
    // Start on landing always
    this.phase = 'landing';
  }

  startGoogleSignIn(): void {
    this.phase = 'signing-in';
    this.signingStep = 0;

    // Simulate OAuth signing-in flow
    setTimeout(() => { this.signingStep = 1; }, 800);
    setTimeout(() => { this.signingStep = 2; }, 1600);
    setTimeout(() => { this.signingStep = 3; }, 2400);
    setTimeout(() => {
      // Initialize profile WITHOUT closing the modal (we handle that after welcome)
      this.profile.initializeMemberProfile();
      this.phase = 'welcome';
      // After welcome animation, close modal
      setTimeout(() => {
        this.profile.showProfilingModal.set(false);
      }, 2200);
    }, 3000);
  }

  startMemberLogin(): void {
    this.phase = 'signing-in';
    this.signingStep = 0;
    setTimeout(() => { this.signingStep = 1; }, 600);
    setTimeout(() => { this.signingStep = 2; }, 1200);
    setTimeout(() => { this.signingStep = 3; }, 1800);
    setTimeout(() => {
      this.profile.initializeMemberProfile();
      this.phase = 'welcome';
      setTimeout(() => {
        this.profile.showProfilingModal.set(false);
      }, 2000);
    }, 2400);
  }

  continueAsGuest(): void {
    // Show profiling quiz
    this.phase = 'quiz';
  }
}
