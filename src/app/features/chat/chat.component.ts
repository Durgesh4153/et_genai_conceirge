import {
  Component, inject, ViewChild, ElementRef, AfterViewChecked, DoCheck,
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

      <!-- Chat Messages Scroll Area -->
      <div class="chat-messages" #scrollContainer>
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

      <!-- Input Area Fixed at Bottom -->
      <div class="chat-input-area">
        <textarea class="input-box" [(ngModel)]="inputText"
          placeholder="Ask your ET Concierge anything…"
          rows="1" (keydown.enter)="onEnter($event)" (input)="autoResize($event)">
        </textarea>
        <button class="send-btn" (click)="send()" [disabled]="chat.isTyping()">
          Send
        </button>
      </div>
    </section>
  `,
  styles: [`
    .chat-wrap { display:flex; flex-direction:column; height:100vh; background:var(--bg); }
    .chat-topbar { flex-shrink:0; height:50px; display:flex; align-items:center; gap:10px; padding:0 1rem; background:var(--bg2); border-bottom:1px solid var(--border); }
    .mode-tabs { display:flex; gap:3px; }
    .mode-tab { padding:3px 10px; cursor:pointer; border-radius:5px; }
    .mode-tab.active { font-weight:600; }
    .agent-indicator { margin-left:auto; display:flex; align-items:center; gap:5px; font-size:11px; }
    .chat-messages { flex:1; overflow-y:auto; padding:1rem; display:flex; flex-direction:column; gap:1rem; }
    .msg-row { display:flex; gap:10px; }
    .msg-row.user { flex-direction:row-reverse; }
    .msg-avatar { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
    .msg-avatar.ai { background:var(--gold-dim); }
    .msg-avatar.user-av { background:var(--bg3); }
    .msg-content { display:flex; flex-direction:column; max-width:70%; }
    .msg-bubble { padding:10px 14px; border-radius:12px; background:var(--bg2); }
    .user-bubble { background:var(--gold-dim); }
    .typing-dots { display:flex; gap:4px; }
    .td { width:5px; height:5px; border-radius:50%; background:var(--text3); animation:typingBounce 1.2s infinite; }
    .td:nth-child(2) { animation-delay:0.2s; }
    .td:nth-child(3) { animation-delay:0.4s; }
    @keyframes typingBounce { 0%,60%,100%{opacity:0.2;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }

    .chat-input-area { flex-shrink:0; display:flex; gap:8px; padding:10px 1rem; border-top:1px solid var(--border); background:var(--bg2); position:sticky; bottom:0; }
    .input-box { flex:1; padding:10px; border-radius:10px; resize:none; outline:none; }
    .send-btn { padding:0 14px; border-radius:8px; background:var(--gold); cursor:pointer; }
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
    // Auto-scroll when new message arrives
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
    const map: Record<string,string> = { navigator:'Navigator Agent', opportunity:'Opportunity Agent', fulfilment:'Fulfilment Agent', profiling:'Profiling Agent' };
    return map[type ?? 'navigator'] ?? 'ET Concierge';
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer?.nativeElement;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } catch {}
  }
}