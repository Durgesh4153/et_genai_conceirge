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

          <!-- Header -->
          <div class="modal-eyebrow">
            <span class="agent-chip">⬡ Profiling Agent</span>
            <span class="step-count">{{ profile.profilingStep() + 1 }} / {{ profile.profilingQuestions.length }}</span>
          </div>
          <div class="modal-title">Welcome to ET Concierge</div>
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
                  <div class="opt-radio" [class.filled]="profile.selectedOption() === opt"></div>
                  {{ opt }}
                </div>
              }
            </div>
          }

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn-ghost" (click)="profile.skipProfile()">Skip for now</button>
            <button class="btn-primary"
                    [disabled]="!profile.selectedOption()"
                    (click)="profile.nextQuestion()">
              {{ profile.isLastQuestion() ? 'Build my profile →' : 'Continue →' }}
            </button>
          </div>

          <!-- What unlocks -->
          <div class="unlock-hint">
            Completing this unlocks Navigator Agent, Opportunity Agent &amp; Fulfilment Agent
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.75);
      z-index: 300;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(3px);
      animation: fadeIn 0.2s ease;
    }
    .modal {
      background: var(--bg2);
      border: 1px solid var(--border2);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      width: 460px; max-width: 92vw;
      animation: fadeUp 0.25s ease;
    }

    /* Header */
    .modal-eyebrow {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 10px;
    }
    .agent-chip {
      font-size: 10px; font-family: var(--font-mono);
      background: var(--amber-dim); color: var(--amber);
      padding: 2px 8px; border-radius: 12px;
    }
    .step-count { font-size: 10px; font-family: var(--font-mono); color: var(--text3); }
    .modal-title {
      font-family: var(--font-display); font-size: 21px;
      color: var(--gold2); margin-bottom: 5px;
    }
    .modal-sub {
      font-size: 12.5px; color: var(--text3);
      margin-bottom: 1.25rem; line-height: 1.6;
    }

    /* Step bar */
    .step-bar { display: flex; gap: 4px; margin-bottom: 1.25rem; }
    .step-seg { flex: 1; height: 3px; border-radius: 2px; background: var(--bg4); transition: background 0.3s; }
    .step-seg.done   { background: var(--gold); }
    .step-seg.active { background: var(--gold2); animation: shimmer 1.5s infinite; }

    /* Question */
    .profile-q {
      font-size: 14.5px; color: var(--text);
      margin-bottom: 0.875rem; font-weight: 500; line-height: 1.5;
    }
    .profile-opts { display: flex; flex-direction: column; gap: 7px; }
    .profile-opt {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm); cursor: pointer;
      font-size: 13px; color: var(--text2);
      transition: all 0.15s; background: var(--bg3); line-height: 1.4;
    }
    .profile-opt:hover,
    .profile-opt.selected {
      border-color: rgba(201,168,76,0.4);
      background: var(--gold-dim); color: var(--gold2);
    }
    .opt-radio {
      width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;
      border: 1.5px solid var(--border2); transition: all 0.15s;
    }
    .opt-radio.filled { background: var(--gold); border-color: var(--gold); }

    /* Footer */
    .modal-footer {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 1.25rem;
    }
    .btn-primary {
      padding: 8px 18px; background: var(--gold); color: #000;
      border: none; border-radius: var(--radius-sm);
      font-family: var(--font-body); font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.15s;
    }
    .btn-primary:hover:not(:disabled) { background: var(--gold2); }
    .btn-primary:disabled { opacity: 0.38; cursor: not-allowed; }
    .btn-ghost {
      padding: 8px 14px; background: transparent;
      color: var(--text3); border: 1px solid var(--border);
      border-radius: var(--radius-sm); font-family: var(--font-body);
      font-size: 12px; cursor: pointer; transition: all 0.15s;
    }
    .btn-ghost:hover { color: var(--text2); border-color: var(--border2); }

    .unlock-hint {
      margin-top: 1rem; font-size: 10px; color: var(--text3);
      text-align: center; font-family: var(--font-mono);
      border-top: 1px solid var(--border); padding-top: 0.875rem;
    }

    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
  `],
})
export class ProfilingModalComponent {
  profile = inject(UserProfileService);
}
