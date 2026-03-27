import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-profiling-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (profile.showProfilingModal()) {
      <div class="modal-overlay">
        <div class="modal" role="dialog" aria-modal="true">

          <!-- Decorative gradient top -->
          <div class="modal-gradient"></div>

          <!-- Header -->
          <div class="modal-eyebrow">
            <span class="agent-chip">
              <span class="chip-dot"></span>
              Profiling Agent
            </span>
            <span class="step-count">{{ profile.profilingStep() + 1 }} / {{ profile.profilingQuestions.length }}</span>
          </div>
          <div class="modal-title">Welcome to <span class="gold">ET Concierge</span></div>
          <div class="modal-sub">3-minute profile — I'll unlock your personalised financial intelligence layer across the entire ET ecosystem</div>

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
              <button class="btn-member" (click)="profile.loginAsMember()">
                <span class="member-icon">👤</span>
                Already a member? →
              </button>
              @if (profile.profilingStep() > 0) {
                <button class="btn-ghost" (click)="profile.skipProfile()">Skip</button>
              }
            </div>
            <button class="btn-primary"
                    [disabled]="!profile.selectedOption()"
                    (click)="profile.nextQuestion()">
              {{ profile.isLastQuestion() ? '✨ Build My Profile' : 'Continue →' }}
            </button>
          </div>

          <!-- What unlocks -->
          <div class="unlock-hint">
            <span class="unlock-icon">🔓</span>
            Completing this unlocks <strong>Navigator</strong>, <strong>Opportunity</strong> &amp; <strong>Fulfilment</strong> Agents
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.8);
      z-index: 300;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(8px);
      animation: fadeIn 0.25s ease;
    }
    .modal {
      background: var(--bg2);
      border: 1px solid var(--border2);
      border-radius: 16px;
      padding: 0 2rem 1.75rem;
      width: 480px; max-width: 92vw;
      animation: fadeUp 0.3s ease;
      position: relative; overflow: hidden;
    }

    /* Decorative gradient */
    .modal-gradient {
      height: 3px; margin: 0 -2rem 1.75rem;
      background: linear-gradient(90deg, var(--gold), var(--amber), var(--gold2), var(--gold));
      background-size: 200% 100%;
      animation: gradientShift 3s linear infinite;
    }

    /* Header */
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
      font-family: var(--font-display); font-size: 22px;
      color: var(--text); margin-bottom: 6px;
    }
    .modal-title .gold { color: var(--gold2); }
    .modal-sub {
      font-size: 12.5px; color: var(--text3);
      margin-bottom: 1.25rem; line-height: 1.6;
    }

    /* Step bar */
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

    /* Question */
    .profile-q {
      font-size: 15px; color: var(--text);
      margin-bottom: 1rem; font-weight: 500; line-height: 1.5;
    }
    .profile-opts { display: flex; flex-direction: column; gap: 8px; }
    .profile-opt {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px;
      border: 1px solid var(--border);
      border-radius: 10px; cursor: pointer;
      font-size: 13px; color: var(--text2);
      transition: all 0.2s; background: var(--bg3); line-height: 1.4;
    }
    .profile-opt:hover {
      border-color: rgba(201,168,76,0.3);
      background: rgba(201,168,76,0.04);
    }
    .profile-opt.selected {
      border-color: var(--gold);
      background: var(--gold-dim); color: var(--gold2);
    }
    .opt-radio {
      width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
      border: 1.5px solid var(--border2); transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .opt-radio.filled { background: var(--gold); border-color: var(--gold); }
    .opt-check { font-size: 9px; color: #000; font-weight: 700; }

    /* Footer */
    .modal-footer {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 1.5rem;
    }
    .footer-left { display: flex; align-items: center; gap: 6px; }
    .btn-primary {
      padding: 10px 20px; background: var(--gold); color: #000;
      border: none; border-radius: 10px;
      font-family: var(--font-body); font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: var(--gold2); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
    .btn-member {
      padding: 8px 14px; background: transparent;
      color: var(--gold); border: 1px solid rgba(201,168,76,0.3);
      border-radius: 10px; font-family: var(--font-body);
      font-size: 11px; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; gap: 5px;
    }
    .btn-member:hover { background: var(--gold-dim); border-color: var(--gold); }
    .member-icon { font-size: 12px; }
    .btn-ghost {
      padding: 8px 12px; background: transparent;
      color: var(--text3); border: 1px solid var(--border);
      border-radius: 10px; font-family: var(--font-body);
      font-size: 11px; cursor: pointer; transition: all 0.2s;
    }
    .btn-ghost:hover { color: var(--text2); border-color: var(--border2); }

    .unlock-hint {
      margin-top: 1.25rem; font-size: 10px; color: var(--text3);
      text-align: center; font-family: var(--font-mono);
      border-top: 1px solid var(--border); padding-top: 1rem;
      display: flex; align-items: center; justify-content: center; gap: 5px;
    }
    .unlock-hint strong { color: var(--text2); }
    .unlock-icon { font-size: 12px; }

    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeUp  { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    @keyframes gradientShift { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
  `],
})
export class ProfilingModalComponent {
  profile = inject(UserProfileService);
}
