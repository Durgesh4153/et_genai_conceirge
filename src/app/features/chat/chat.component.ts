import {
  Component, inject, ViewChild, ElementRef, AfterViewChecked, DoCheck,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AgentType, InsightCard, RecommendationChip, XSellItem, ActionItem } from '../../models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="chat-wrap">

      <!-- ── Top Bar ── -->
      <div class="chat-topbar glass">
        <div class="mode-tabs">
          @for (mode of modes; track mode) {
            <div class="mode-tab" [class.active]="chat.activeMode() === mode" (click)="chat.setMode(mode)">
              <span class="mode-icon">{{ modeIcon(mode) }}</span> {{ mode }}
            </div>
          }
        </div>
        <div class="agent-indicator">
          <div class="agent-pulse-wrap">
            <div class="agent-pulse" [class]="'pulse-' + chat.activeAgent()"></div>
            <div class="ai-dot" [class]="'dot-' + chat.activeAgent()"></div>
          </div>
          <span class="ai-label">{{ agentLabel(chat.activeAgent()) }}</span>
        </div>
        <div class="context-pill">
          <span class="ctx-dot"></span>
          Memory: Wealth Profile Active
        </div>
      </div>

      <!-- ── Chat Messages ── -->
      <div class="chat-messages" #scrollContainer>
        @for (msg of chat.messages(); track msg.id) {
          <div class="msg-row" [class.user]="msg.role === 'user'" [class.interrupt]="msg.interrupt">
            <!-- Avatar -->
            <div [class]="msg.role === 'ai' ? 'msg-avatar ai agent-' + msg.agent : 'msg-avatar user-av'">
              {{ msg.role === 'ai' ? 'D' : 'U' }}
            </div>
            <!-- Content -->
            <div class="msg-content" [class.user-content]="msg.role === 'user'">
              @if (msg.role === 'ai') {
                <div class="msg-meta">
                  <span class="agent-tag" [class]="'tag-' + msg.agent">{{ agentLabel(msg.agent) }}</span>
                  <span class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</span>
                </div>
              }
              <div class="msg-bubble glass-low" [class.user-bubble]="msg.role === 'user'" [class.interrupt-bubble]="msg.interrupt">
                <span [innerHTML]="msg.text"></span>
              </div>

              <!-- ── Insight Cards ── -->
              @if (msg.insights && msg.insights.length > 0) {
                <div class="insight-grid">
                  @for (card of msg.insights; track card.label) {
                    <div class="insight-card" [class]="'ic-' + card.color">
                      <div class="ic-label">{{ card.label }}</div>
                      <div class="ic-value">{{ card.value }}</div>
                      <div class="ic-sub">{{ card.sub }}</div>
                    </div>
                  }
                </div>
              }

              <!-- ── XSell Items (Opportunity Agent) ── -->
              @if (msg.xsellItems && msg.xsellItems.length > 0) {
                <div class="xsell-list">
                  @for (item of msg.xsellItems; track item.title) {
                    <div class="xsell-card" (click)="chat.sendMessage(item.prompt)">
                      <div class="xs-icon">{{ item.icon }}</div>
                      <div class="xs-body">
                        <div class="xs-title">{{ item.title }}</div>
                        <div class="xs-sub">{{ item.subtitle }}</div>
                      </div>
                      <span class="xs-tag">{{ item.tag }}</span>
                    </div>
                  }
                </div>
              }

              <!-- ── Action Items (Fulfilment Agent) ── -->
              @if (msg.actions && msg.actions.length > 0) {
                <div class="action-list">
                  @for (act of msg.actions; track act.label) {
                    <div class="action-item" [class.done]="act.done" (click)="chat.markActionDone(msg.id, act.label)">
                      <span class="act-check">{{ act.done ? '✓' : act.icon }}</span>
                      <span class="act-label">{{ act.label }}</span>
                      @if (!act.done) {
                        <span class="act-go">Execute →</span>
                      }
                    </div>
                  }
                </div>
              }

              <!-- ── Recommendation Chips ── -->
              @if (msg.chips && msg.chips.length > 0) {
                <div class="chip-row">
                  @for (chip of msg.chips; track chip.label) {
                    <button class="rec-chip" [class.highlight]="chip.highlight" (click)="chat.sendMessage(chip.prompt)">
                      {{ chip.label }}
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Typing indicator -->
        @if (chat.isTyping()) {
          <div class="msg-row">
            <div class="msg-avatar ai">ET</div>
            <div class="msg-content">
              <div class="msg-meta"><span class="agent-tag tag-navigator">Navigator Agent</span></div>
              <div class="typing-dots">
                <div class="td"></div><div class="td"></div><div class="td"></div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- ── Premium Input Area ── -->
      <div class="chat-input-area glass">
        <div class="input-container glow-gold">
          <textarea class="input-box" [(ngModel)]="inputText"
            placeholder="Ask Durgesh — markets, portfolio, tax, investments…"
            rows="1" (keydown.enter)="onEnter($event)" (input)="autoResize($event)">
          </textarea>
          <button class="send-btn" (click)="send()" [disabled]="chat.isTyping() || !inputText.trim()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </button>
        </div>
        <div class="input-hint">ET Concierge Powered by Gemini 1.5 · Live NSE/BSE Feed via ET Markets</div>
      </div>
    </section>
  `,
  styles: [`
    /* ── Layout ── */
    .chat-wrap { display:flex; flex-direction:column; height:100%; background:var(--bg); overflow: hidden; }

    /* ── Glassmorphism ── */
    .glass {
      background: rgba(15, 17, 21, 0.7) !important;
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      border-color: rgba(255, 255, 255, 0.05) !important;
    }
    .glass-low {
      background: rgba(22, 26, 32, 0.5) !important;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    .glow-gold:focus-within {
      box-shadow: 0 0 20px rgba(201, 168, 76, 0.15);
      border-color: rgba(201, 168, 76, 0.4) !important;
    }

    /* ── Top Bar ── */
    .chat-topbar {
      flex-shrink:0; height:52px; display:flex; align-items:center; gap:10px;
      padding:0 1.25rem; background:var(--bg2); border-bottom:1px solid var(--border);
      z-index: 10;
    }
    .mode-tabs { display:flex; gap:2px; }
    .mode-tab {
      padding:5px 12px; cursor:pointer; border-radius:6px; font-size:12px;
      color:var(--text3); display:flex; align-items:center; gap:4px;
      transition:all 0.2s; border:1px solid transparent;
    }
    .mode-tab:hover { background:var(--bg3); color:var(--text2); }
    .mode-tab.active {
      font-weight:600; color:var(--gold2); background:var(--gold-dim);
      border-color:rgba(201,168,76,0.2);
    }
    .mode-icon { font-size:11px; }
    .agent-indicator {
      margin-left:auto; display:flex; align-items:center; gap:8px;
      font-size:10px; font-family:var(--font-mono); color:var(--text3);
    }
    .agent-pulse-wrap { position: relative; width: 8px; height: 8px; display: flex; align-items: center; justify-content: center; }
    .ai-dot {
      width:6px; height:6px; border-radius:50%; background:#22c55e;
      position: relative; z-index: 2;
    }
    .agent-pulse {
      position: absolute; width: 6px; height: 6px; border-radius: 50%;
      background: #22c55e; opacity: 0.6;
      animation: agentPing 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    .dot-opportunity, .pulse-opportunity { background:var(--amber); }
    .dot-fulfilment, .pulse-fulfilment { background:var(--blue); }
    .context-pill {
      font-size:9px; font-family:var(--font-mono); color:var(--text3);
      background:var(--bg3); padding:4px 10px; border-radius:12px;
      display:flex; align-items:center; gap:6px;
      border:1px solid var(--border);
    }
    .ctx-dot { width:5px; height:5px; border-radius:50%; background:#22c55e; flex-shrink:0; }

    /* ── Messages ── */
    .chat-messages {
      flex:1; overflow-y:auto; padding:1.25rem; display:flex;
      flex-direction:column; gap:1.25rem;
      scroll-behavior:smooth;
    }
    .msg-row { display:flex; gap:10px; animation:msgFade 0.3s ease; }
    .msg-row.user { flex-direction:row-reverse; }
    .msg-row.interrupt { animation:interruptSlide 0.4s ease; }
    .msg-avatar {
      width:32px; height:32px; border-radius:10px; display:flex;
      align-items:center; justify-content:center; font-size:10px;
      font-weight:700; flex-shrink:0; letter-spacing:0.5px;
    }
    .msg-avatar.ai {
      background:linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.08));
      color:var(--gold); border:1px solid rgba(201,168,76,0.2);
    }
    .msg-avatar.agent-opportunity {
      background:linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08));
      color:var(--amber); border-color:rgba(245,158,11,0.2);
    }
    .msg-avatar.agent-fulfilment {
      background:linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.08));
      color:var(--blue); border-color:rgba(59,130,246,0.2);
    }
    .msg-avatar.user-av {
      background:var(--bg3); color:var(--text2); border:1px solid var(--border);
    }
    .msg-content { display:flex; flex-direction:column; max-width:75%; gap:6px; }
    .user-content { align-items:flex-end; }
    .msg-meta { display:flex; align-items:center; gap:6px; }
    .agent-tag {
      font-size:9px; font-family:var(--font-mono); padding:2px 6px;
      border-radius:4px; letter-spacing:0.3px;
    }
    .tag-navigator { background:var(--gold-dim); color:var(--gold); }
    .tag-opportunity { background:var(--amber-dim); color:var(--amber); }
    .tag-fulfilment { background:var(--blue-dim); color:var(--blue); }
    .tag-profiling { background:var(--green-dim); color:var(--green); }
    .msg-time { font-size:9px; color:var(--text3); font-family:var(--font-mono); }
    .msg-bubble {
      padding:12px 16px; border-radius:14px; background:var(--bg2);
      font-size:13px; line-height:1.65; color:var(--text);
      border:1px solid var(--border);
    }
    .user-bubble {
      background:linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.06));
      border-color:rgba(201,168,76,0.2); color:var(--text);
    }
    .interrupt-bubble {
      border-color:rgba(245,158,11,0.3);
      background:linear-gradient(135deg, rgba(245,158,11,0.08), transparent);
    }

    /* ── Insight Cards ── */
    .insight-grid {
      display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr));
      gap:6px; margin-top:2px;
    }
    .insight-card {
      background:var(--bg3); border:1px solid var(--border);
      border-radius:10px; padding:10px; text-align:center;
      transition:all 0.2s; cursor:default;
    }
    .insight-card:hover { border-color:rgba(201,168,76,0.3); transform:translateY(-1px); }
    .ic-label { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:var(--text3); font-family:var(--font-mono); margin-bottom:4px; }
    .ic-value { font-family:var(--font-display); font-size:17px; font-weight:700; margin-bottom:2px; }
    .ic-sub { font-size:9px; color:var(--text3); font-family:var(--font-mono); }
    .ic-gold .ic-value { color:var(--gold); }
    .ic-green .ic-value { color:var(--green); }
    .ic-red .ic-value { color:var(--red); }
    .ic-blue .ic-value { color:var(--blue); }

    /* ── XSell Cards ── */
    .xsell-list { display:flex; flex-direction:column; gap:5px; margin-top:2px; }
    .xsell-card {
      display:flex; align-items:center; gap:10px;
      background:var(--bg3); border:1px solid rgba(245,158,11,0.2);
      border-radius:10px; padding:10px 12px; cursor:pointer;
      transition:all 0.2s;
    }
    .xsell-card:hover { border-color:rgba(245,158,11,0.4); background:rgba(245,158,11,0.05); }
    .xs-icon { font-size:20px; flex-shrink:0; }
    .xs-body { flex:1; min-width:0; }
    .xs-title { font-size:12px; font-weight:600; color:var(--text); margin-bottom:2px; }
    .xs-sub { font-size:10px; color:var(--text3); line-height:1.4; }
    .xs-tag {
      font-size:8px; font-family:var(--font-mono); padding:2px 5px;
      border-radius:4px; background:var(--amber-dim); color:var(--amber);
      flex-shrink:0; letter-spacing:0.5px;
    }

    /* ── Action Items ── */
    .action-list { display:flex; flex-direction:column; gap:4px; margin-top:2px; }
    .action-item {
      display:flex; align-items:center; gap:8px;
      background:var(--bg3); border:1px solid var(--border);
      border-radius:8px; padding:8px 12px; cursor:pointer;
      transition:all 0.2s; font-size:12px;
    }
    .action-item:hover:not(.done) { border-color:rgba(59,130,246,0.3); background:rgba(59,130,246,0.04); }
    .action-item.done { opacity:0.5; cursor:default; }
    .act-check { font-size:14px; flex-shrink:0; }
    .act-label { flex:1; color:var(--text2); }
    .action-item.done .act-label { text-decoration:line-through; color:var(--text3); }
    .act-go {
      font-size:9px; font-family:var(--font-mono); color:var(--blue);
      padding:2px 6px; border-radius:4px; background:var(--blue-dim);
    }

    /* ── Recommendation Chips ── */
    .chip-row { display:flex; flex-wrap:wrap; gap:5px; margin-top:2px; }
    .rec-chip {
      font-size:11px; padding:6px 12px; border-radius:20px;
      background:var(--bg3); border:1px solid var(--border);
      color:var(--text2); cursor:pointer; transition:all 0.2s;
      font-family:var(--font-body); white-space:nowrap;
    }
    .rec-chip:hover { border-color:rgba(201,168,76,0.3); color:var(--gold2); background:var(--gold-dim); }
    .rec-chip.highlight {
      background:var(--gold-dim); border-color:rgba(201,168,76,0.3);
      color:var(--gold2); font-weight:500;
    }

    /* ── Typing ── */
    .typing-dots { display:flex; gap:4px; padding:8px 0; }
    .td {
      width:6px; height:6px; border-radius:50%; background:var(--gold);
      animation:typingBounce 1.2s infinite;
    }
    .td:nth-child(2) { animation-delay:0.2s; }
    .td:nth-child(3) { animation-delay:0.4s; }

    /* ── ChatGPT-style Input ── */
    .chat-input-area {
      flex-shrink:0; padding:12px 1.25rem 10px;
      background:var(--bg2); border-top:1px solid var(--border);
    }
    .input-container {
      display:flex; align-items:flex-end; gap:0;
      background:var(--bg3); border:1px solid var(--border2);
      border-radius:14px; padding:4px; transition:border-color 0.2s;
    }
    .input-container:focus-within {
      border-color:rgba(201,168,76,0.4);
      box-shadow:0 0 0 3px rgba(201,168,76,0.08);
    }
    .input-box {
      flex:1; padding:10px 14px; border:none; background:transparent;
      color:var(--text); font-size:13px; font-family:var(--font-body);
      resize:none; outline:none; line-height:1.5;
      max-height:110px;
    }
    .input-box::placeholder { color:var(--text3); }
    .send-btn {
      width:36px; height:36px; border-radius:10px; border:none;
      background:var(--gold); color:#000; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all 0.2s; flex-shrink:0;
    }
    .send-btn:hover:not(:disabled) { background:var(--gold2); transform:scale(1.05); }
    .send-btn:disabled { opacity:0.3; cursor:not-allowed; }
    .input-hint {
      font-size:9px; color:var(--text3); text-align:center;
      font-family:var(--font-mono); margin-top:6px; letter-spacing:0.3px;
    }

    /* ── Animations ── */
    @keyframes msgFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes interruptSlide { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
    @keyframes typingBounce { 0%,60%,100%{opacity:0.2;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  `],
})
export class ChatComponent implements AfterViewChecked, DoCheck {
  chat = inject(ChatService);
  inputText = '';
  private shouldScroll = false;
  private lastMessageCount = 0;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;

  readonly modes: Array<'Navigator' | 'Markets' | 'Services' | 'Goals'> = ['Navigator','Markets','Services','Goals'];

  ngDoCheck(): void {
    const currentCount = this.chat.messages().length;
    if (currentCount !== this.lastMessageCount) {
      this.shouldScroll = true;
      this.lastMessageCount = currentCount;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  send(): void {
    if (!this.inputText.trim() || this.chat.isTyping()) return;
    this.chat.sendMessage(this.inputText.trim());
    this.inputText = '';
    this.shouldScroll = true;
  }

  onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.send();
    }
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 110) + 'px';
  }

  agentLabel(type: AgentType | undefined): string {
    const map: Record<string,string> = { navigator:'Durgesh Navigator', opportunity:'Opportunity Agent', fulfilment:'Fulfilment Agent', profiling:'Profiling Agent' };
    return map[type ?? 'navigator'] ?? 'Durgesh - ET Concierge';
  }

  modeIcon(mode: string): string {
    const map: Record<string,string> = { Navigator:'◈', Markets:'📈', Services:'💼', Goals:'🎯' };
    return map[mode] ?? '◈';
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer?.nativeElement;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } catch {}
  }
}