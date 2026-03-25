import {
  Component, inject, ViewChild, ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AgentType } from '../../models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="chat-wrap">
      <div class="chat-topbar">
        <div class="mode-tabs">
          @for (mode of modes; track mode) {
            <div class="mode-tab" [class.active]="chat.activeMode() === mode" (click)="chat.setMode(mode)">
              {{ mode }}
            </div>
          }
        </div>
        <div class="agent-indicator">
          <div class="ai-dot" [class]="'dot-' + chat.activeAgent()"></div>
          <span class="ai-label">{{ agentLabel(chat.activeAgent()) }}</span>
        </div>
        <div class="context-pill">Memory: Wealth Profile Active</div>
      </div>

      <div class="chat-messages" #scrollAnchor>
        @for (msg of chat.messages(); track msg.id) {
          <div class="msg-row" [class.user]="msg.role === 'user'" [class.interrupt]="msg.interrupt">
            <div [class]="msg.role === 'ai' ? 'msg-avatar ai agent-' + msg.agent : 'msg-avatar user-av'">
              {{ msg.role === 'ai' ? 'ET' : 'R' }}
            </div>
            <div class="msg-content" [class.user-content]="msg.role === 'user'">
              @if (msg.role === 'ai') {
                <div class="msg-meta">
                  <span class="agent-tag" [class]="'tag-' + msg.agent">{{ agentLabel(msg.agent) }}</span>
                  <span class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</span>
                </div>
              }
              <div class="msg-bubble" [class.user-bubble]="msg.role === 'user'" [class.interrupt-bubble]="msg.interrupt">
                <span [innerHTML]="msg.text"></span>

                @if (msg.insights?.length) {
                  <div class="insight-grid">
                    @for (card of msg.insights; track card.label) {
                      <div class="insight-card" (click)="onInsight(card.action)">
                        <div class="ic-label">{{ card.label }}</div>
                        <div class="ic-val" [class]="'ic-' + card.color">{{ card.value }}</div>
                        <div class="ic-sub">{{ card.sub }}</div>
                      </div>
                    }
                  </div>
                }

                @if (msg.xsellItems?.length) {
                  <div class="xsell-list">
                    @for (item of msg.xsellItems; track item.title) {
                      <div class="xsell-banner" (click)="chat.sendMessage(item.prompt)">
                        <div class="xsell-icon">{{ item.icon }}</div>
                        <div class="xsell-body">
                          <div class="xt-title">{{ item.title }}</div>
                          <div class="xt-sub">{{ item.subtitle }}</div>
                        </div>
                        <span class="xsell-tag" [class]="'xtag-' + item.tag.toLowerCase()">{{ item.tag }}</span>
                      </div>
                    }
                  </div>
                }

                @if (msg.actions?.length) {
                  <div class="action-list">
                    @for (action of msg.actions; track action.label) {
                      <div class="action-row" [class.done]="action.done" (click)="!action.done && chat.markActionDone(msg.id, action.label)">
                        <div class="action-check" [class.checked]="action.done">{{ action.done ? '✓' : action.icon }}</div>
                        <div class="action-label">{{ action.label }}</div>
                        @if (!action.done) {
                          <div class="action-execute">Execute →</div>
                        } @else {
                          <div class="action-done-label">Done</div>
                        }
                      </div>
                    }
                  </div>
                }

                @if (msg.chips?.length) {
                  <div class="rec-chips">
                    @for (chip of msg.chips; track chip.label) {
                      <div class="rec-chip" [class.highlight]="chip.highlight" (click)="chat.sendMessage(chip.prompt)">
                        {{ chip.label }}
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }

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

      <div class="chat-input-area">
        <div class="quick-prompts">
          @for (p of chat.quickPrompts; track p) {
            <div class="qp" (click)="chat.sendMessage(p)">{{ p }}</div>
          }
        </div>
        <div class="input-row">
          <textarea class="input-box" [(ngModel)]="inputText" placeholder="Ask your ET Concierge anything…"
            rows="1" (keydown.enter)="onEnter($event)" (input)="autoResize($event)"></textarea>
          <button class="send-btn" (click)="send()" [disabled]="chat.isTyping()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .chat-wrap { display:flex; flex-direction:column; background:var(--bg); height:100%; overflow:hidden; }
    .chat-topbar { height:50px; border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 1.25rem; gap:10px; background:var(--bg2); flex-shrink:0; }
    .mode-tabs { display:flex; gap:3px; background:var(--bg3); padding:3px; border-radius:8px; border:1px solid var(--border); }
    .mode-tab { padding:3px 10px; border-radius:5px; font-size:11.5px; cursor:pointer; color:var(--text3); transition:all 0.15s; font-weight:500; }
    .mode-tab.active { background:var(--surface); color:var(--gold2); }
    .agent-indicator { display:flex; align-items:center; gap:5px; font-size:11px; font-family:var(--font-mono); }
    .ai-dot { width:6px; height:6px; border-radius:50%; background:var(--text3); transition:background 0.3s; }
    .ai-dot.dot-navigator   { background:var(--gold); }
    .ai-dot.dot-opportunity { background:var(--blue); }
    .ai-dot.dot-fulfilment  { background:var(--green); }
    .ai-dot.dot-profiling   { background:var(--amber); }
    .ai-label { color:var(--text3); }
    .context-pill { margin-left:auto; background:var(--blue-dim); border:1px solid rgba(74,143,255,0.18); border-radius:20px; padding:3px 9px; font-size:10px; color:var(--blue); font-family:var(--font-mono); }
    .chat-messages { flex:1; overflow-y:auto; padding:1.25rem 1.25rem 0.5rem; display:flex; flex-direction:column; gap:1.25rem; }
    .msg-row { display:flex; gap:10px; animation:fadeUp 0.28s ease; }
    .msg-row.user { flex-direction:row-reverse; }
    .msg-row.interrupt { border-left:2px solid rgba(74,143,255,0.35); padding-left:8px; margin-left:-10px; }
    .msg-avatar { width:30px; height:30px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; margin-top:22px; }
    .msg-avatar.ai { background:var(--gold-dim); border:1px solid rgba(201,168,76,0.3); color:var(--gold); font-family:var(--font-display); }
    .msg-avatar.agent-opportunity { border-color:rgba(74,143,255,0.4)!important; }
    .msg-avatar.agent-fulfilment  { border-color:rgba(61,201,122,0.4)!important; }
    .msg-avatar.user-av { background:var(--bg3); border:1px solid var(--border2); color:var(--text2); }
    .msg-content { display:flex; flex-direction:column; max-width:74%; }
    .user-content { align-items:flex-end; }
    .msg-meta { display:flex; align-items:center; gap:6px; margin-bottom:5px; }
    .agent-tag { font-size:9px; font-family:var(--font-mono); padding:2px 6px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px; }
    .tag-navigator   { background:var(--gold-dim);  color:var(--gold2); }
    .tag-opportunity { background:var(--blue-dim);  color:var(--blue);  }
    .tag-fulfilment  { background:var(--green-dim); color:var(--green); }
    .tag-profiling   { background:var(--amber-dim); color:var(--amber); }
    .tag-undefined   { background:var(--gold-dim);  color:var(--gold2); }
    .msg-time { font-size:9px; color:var(--text3); font-family:var(--font-mono); }
    .msg-bubble { background:var(--bg2); border:1px solid var(--border); border-radius:12px; padding:11px 14px; font-size:13px; line-height:1.65; color:var(--text); }
    .user-bubble    { background:var(--gold-dim); border-color:rgba(201,168,76,0.2); }
    .interrupt-bubble { border-color:rgba(74,143,255,0.25); background:rgba(74,143,255,0.04); }
    .insight-grid { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-top:10px; }
    .insight-card { background:var(--bg3); border:1px solid var(--border); border-radius:8px; padding:9px 11px; cursor:pointer; transition:all 0.15s; }
    .insight-card:hover { border-color:rgba(201,168,76,0.3); background:var(--bg4); }
    .ic-label { font-size:9px; color:var(--text3); font-family:var(--font-mono); margin-bottom:3px; text-transform:uppercase; letter-spacing:0.5px; }
    .ic-val   { font-size:15px; font-family:var(--font-display); font-weight:600; margin-bottom:1px; }
    .ic-val.ic-gold  { color:var(--gold2); }
    .ic-val.ic-green { color:var(--green); }
    .ic-val.ic-red   { color:var(--red);   }
    .ic-val.ic-blue  { color:var(--blue);  }
    .ic-sub { font-size:9px; color:var(--text3); }
    .xsell-list { display:flex; flex-direction:column; gap:6px; margin-top:10px; }
    .xsell-banner { display:flex; align-items:center; gap:10px; background:rgba(74,143,255,0.04); border:1px solid rgba(74,143,255,0.15); border-radius:8px; padding:9px 11px; cursor:pointer; transition:all 0.15s; }
    .xsell-banner:hover { border-color:rgba(74,143,255,0.3); }
    .xsell-icon { width:30px; height:30px; border-radius:6px; background:var(--blue-dim); display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; }
    .xsell-body { flex:1; min-width:0; }
    .xt-title { font-size:12px; font-weight:500; color:var(--text); }
    .xt-sub   { font-size:10px; color:var(--text3); margin-top:1px; }
    .xsell-tag { font-size:9px; padding:2px 5px; border-radius:4px; font-family:var(--font-mono); flex-shrink:0; }
    .xtag-event   { background:var(--gold-dim);  color:var(--gold);  }
    .xtag-service { background:var(--green-dim); color:var(--green); }
    .xtag-market  { background:var(--blue-dim);  color:var(--blue);  }
    .action-list { display:flex; flex-direction:column; gap:6px; margin-top:10px; }
    .action-row { display:flex; align-items:center; gap:10px; background:var(--bg3); border:1px solid var(--border); border-radius:8px; padding:9px 12px; cursor:pointer; transition:all 0.15s; }
    .action-row:hover:not(.done) { border-color:rgba(61,201,122,0.3); background:var(--green-dim); }
    .action-row.done { opacity:0.55; cursor:default; }
    .action-check { width:24px; height:24px; border-radius:50%; background:var(--bg4); border:1px solid var(--border2); display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0; transition:all 0.2s; }
    .action-check.checked { background:var(--green-dim); border-color:rgba(61,201,122,0.4); color:var(--green); }
    .action-label   { flex:1; font-size:12px; color:var(--text2); }
    .action-execute { font-size:10px; color:var(--green); font-family:var(--font-mono); flex-shrink:0; }
    .action-done-label { font-size:10px; color:var(--green); font-family:var(--font-mono); flex-shrink:0; }
    .rec-chips { display:flex; flex-wrap:wrap; gap:5px; margin-top:10px; }
    .rec-chip { padding:4px 11px; border-radius:20px; font-size:11.5px; border:1px solid var(--border2); background:var(--bg3); color:var(--text2); cursor:pointer; transition:all 0.15s; }
    .rec-chip:hover     { border-color:var(--gold); color:var(--gold2); background:var(--gold-dim2); }
    .rec-chip.highlight { background:var(--gold-dim); border-color:rgba(201,168,76,0.35); color:var(--gold2); }
    .typing-dots { display:flex; gap:4px; padding:10px 14px; background:var(--bg2); border:1px solid var(--border); border-radius:12px; }
    .td { width:5px; height:5px; border-radius:50%; background:var(--text3); animation:typingBounce 1.2s infinite; }
    .td:nth-child(2) { animation-delay:0.2s; }
    .td:nth-child(3) { animation-delay:0.4s; }
    .chat-input-area { padding:0.875rem 1.25rem; border-top:1px solid var(--border); background:var(--bg2); flex-shrink:0; }
    .quick-prompts { display:flex; gap:5px; margin-bottom:8px; flex-wrap:wrap; }
    .qp { padding:3px 9px; border-radius:14px; font-size:11px; background:var(--bg3); border:1px solid var(--border); color:var(--text3); cursor:pointer; transition:all 0.12s; white-space:nowrap; }
    .qp:hover { color:var(--text2); border-color:var(--border2); }
    .input-row { display:flex; gap:8px; align-items:flex-end; }
    .input-box { flex:1; background:var(--bg3); border:1px solid var(--border2); border-radius:10px; padding:9px 13px; color:var(--text); font-family:var(--font-body); font-size:13px; outline:none; resize:none; min-height:40px; max-height:110px; transition:border-color 0.15s; line-height:1.5; }
    .input-box:focus { border-color:rgba(201,168,76,0.4); }
    .input-box::placeholder { color:var(--text3); }
    .send-btn { width:38px; height:38px; border-radius:8px; background:var(--gold); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; color:#000; }
    .send-btn:hover:not(:disabled) { background:var(--gold2); transform:scale(1.05); }
    .send-btn:disabled { opacity:0.5; cursor:not-allowed; }
    .send-btn svg { width:15px; height:15px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes typingBounce { 0%,60%,100%{opacity:0.2;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }
  `],
})
export class ChatComponent implements AfterViewChecked {
  chat = inject(ChatService);
  inputText = '';
  private shouldScroll = false;
  @ViewChild('scrollAnchor') private scrollContainer!: ElementRef<HTMLDivElement>;

  readonly modes: Array<'Navigator' | 'Markets' | 'Services' | 'Goals'> = ['Navigator','Markets','Services','Goals'];

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  send(): void {
    if (!this.inputText.trim() || this.chat.isTyping()) return;
    this.chat.sendMessage(this.inputText.trim());
    this.inputText = '';
    this.shouldScroll = true;
  }

  onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) { ke.preventDefault(); this.send(); }
  }

  onInsight(action: string): void {
    const prompts: Record<string,string> = {
      portfolio:'Give me a full portfolio snapshot and analysis',
      gap:'Explain my retirement gap and fastest way to close it',
      opps:'Show me all 4 opportunities matched to my profile today',
      discovery:'How do I improve my Discovery Score to 85?',
      equity:'Analyse my equity mutual fund performance in detail',
      stocks:'How are my direct stocks performing vs the index?',
      debt:'Should I restructure my FD and debt allocation?',
      gold:'Is my gold allocation too high and should I switch to SGB?',
    };
    this.chat.sendMessage(prompts[action] ?? 'Tell me more about my ' + action);
    this.shouldScroll = true;
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 110) + 'px';
  }

  agentLabel(type: AgentType | undefined): string {
    const map: Record<string,string> = { navigator:'Navigator Agent', opportunity:'Opportunity Agent', fulfilment:'Fulfilment Agent', profiling:'Profiling Agent' };
    return map[type ?? 'navigator'] ?? 'ET Concierge';
  }

  private scrollToBottom(): void {
    try { const el = this.scrollContainer?.nativeElement; if(el) el.scrollTop = el.scrollHeight; } catch {}
  }
}
