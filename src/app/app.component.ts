import { Component, inject } from '@angular/core';
import { HeaderComponent }         from './features/header/header.component';
import { SidebarComponent }        from './features/sidebar/sidebar.component';
import { ChatComponent }           from './features/chat/chat.component';
import { RightPanelComponent }     from './features/right-panel/right-panel.component';
import { ProfilingModalComponent } from './features/profiling/profiling-modal.component';
import { UserProfileService }      from './services/user-profile.service';
import { CommonModule }            from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    ChatComponent,
    RightPanelComponent,
    ProfilingModalComponent,
  ],
  template: `
    <app-profiling-modal />
    @if (!profile.showProfilingModal()) {
      <app-header />
      <div class="layout">
        <app-sidebar />
        <app-chat />
        <app-right-panel />
      </div>
    }
  `,
  styles: [`
    :host   { display: block; height: 100vh; overflow: hidden; }
    .layout {
      display: grid;
      grid-template-columns: 260px 1fr 315px;
      height: calc(100vh - 54px);
      overflow: hidden;
    }
    app-sidebar, app-chat, app-right-panel {
      display: block;
      height: 100%;
      min-height: 0;
    }
  `],
})
export class AppComponent {
  profile = inject(UserProfileService);
}
