import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="nav">
      <div class="nav-inner">
        <a routerLink="/" class="nav-brand">
          <span class="brand-icon">●</span>
          <span class="brand-text">Obiri</span>
        </a>
        <div class="nav-links">
          <a routerLink="/departments" routerLinkActive="active" class="nav-link">Departments</a>
          <a routerLink="/employees" routerLinkActive="active" class="nav-link">Employees</a>
          <a routerLink="/leave-requests" routerLinkActive="active" class="nav-link">Leave Requests</a>
        </div>
      </div>
    </nav>
    <main class="main">
      <router-outlet />
    </main>
  `,
  styles: [`
    .nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: oklch(100% 0 0 / 80%);
      backdrop-filter: blur(12px) saturate(180%);
      border-bottom: var(--border);
    }
    .nav-inner {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 var(--space-xl);
      height: 56px;
      display: flex;
      align-items: center;
      gap: var(--space-xl);
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      text-decoration: none;
    }
    .brand-icon {
      font-size: 1rem;
      color: var(--color-accent);
      line-height: 1;
    }
    .brand-text {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--color-ink);
      letter-spacing: -0.02em;
    }
    .nav-links {
      display: flex;
      gap: var(--space-xs);
      margin-left: auto;
    }
    .nav-link {
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--color-ink-3);
      text-decoration: none;
      transition: all var(--dur-fast) var(--ease-out);
    }
    .nav-link:hover {
      color: var(--color-ink);
      background: var(--color-paper-2);
    }
    .nav-link.active {
      color: var(--color-accent);
      background: var(--color-accent-light);
    }
    .main {
      min-height: calc(100vh - 56px);
    }
  `]
})
export class AppComponent {}
