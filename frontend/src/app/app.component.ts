import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <a routerLink="/">Obiri HR System</a>
      </div>
      <div class="nav-links">
        <a routerLink="/departments" routerLinkActive="active">Departments</a>
        <a routerLink="/employees" routerLinkActive="active">Employees</a>
        <a routerLink="/leave-requests" routerLinkActive="active">Leave Requests</a>
      </div>
    </nav>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar { background: #1e293b; color: white; padding: 0 2rem; display: flex; align-items: center; height: 56px; }
    .nav-brand a { color: white; text-decoration: none; font-size: 1.2rem; font-weight: 700; }
    .nav-links { margin-left: 2rem; display: flex; gap: 1.5rem; }
    .nav-links a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; padding: 0.25rem 0; }
    .nav-links a.active { color: white; border-bottom: 2px solid #3b82f6; }
    main { min-height: calc(100vh - 56px); background: #f8fafc; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  `]
})
export class AppComponent {}
