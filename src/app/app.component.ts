import { Component } from '@angular/core';
import { HeaderComponent }        from './features/header/header.component';
import { SidebarComponent }       from './features/sidebar/sidebar.component';
import { ChatComponent }          from './features/chat/chat.component';
import { RightPanelComponent }    from './features/right-panel/right-panel.component';
import { ProfilingModalComponent } from './features/profiling/profiling-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    ChatComponent,
    RightPanelComponent,
    ProfilingModalComponent,
  ],
  template: `
    <app-profiling-modal />
    <app-header />
    <div class="layout">
      <app-sidebar />
      <app-chat />
      <app-right-panel />
    </div>
  `,
  styles: [`
    :host    { display: block; height: 100vh; overflow: auto; }
    .layout  {
      display: grid;
      grid-template-columns: 255px 1fr 310px;
      height: calc(100vh - 58px);
    }
  `],
})
export class AppComponent {}
