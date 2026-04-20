import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout-container">
      
      <!-- SIDEBAR -->
      <aside class="sidebar" [class.open]="mobileSidebarOpen">
        <div class="brand">
          <span class="logo-icon bg-cyan"></span>
          <span class="brand-text">QuantifyHub</span>
          <button class="mobile-close" (click)="toggleSidebar()">×</button>
        </div>
        
        <nav class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
             <span class="icon">⊞</span> Dashboard
          </a>
          <a routerLink="/convert" routerLinkActive="active" class="nav-link">
             <span class="icon">⇆</span> Convert
          </a>
          <a routerLink="/compare" routerLinkActive="active" class="nav-link">
             <span class="icon">≠</span> Compare
          </a>
          <a routerLink="/arithmetic" routerLinkActive="active" class="nav-link">
             <span class="icon">±</span> Arithmetic
          </a>
          <a routerLink="/history" routerLinkActive="active" class="nav-link">
             <span class="icon">↺</span> History
          </a>
        </nav>

        <div class="sidebar-bottom">
          <ng-container *ngIf="authService.isLoggedIn(); else loginBtn">
            <div class="user-profile" *ngIf="authService.profile$ | async as prof">
              <span class="icon">👤</span> {{prof.name || prof.email}}
            </div>
            <button class="logout-btn" (click)="logout()">
              <span class="icon">→</span> Sign Out
            </button>
          </ng-container>
          <ng-template #loginBtn>
            <a class="logout-btn" routerLink="/auth" style="text-decoration: none;">
              <span class="icon">➜</span> Sign In
            </a>
          </ng-template>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="main-wrapper">
        <header class="topbar">
          <div class="left">
            <button class="hamburger" (click)="toggleSidebar()">☰</button>
            <h2 class="page-title">{{pageTitle}}</h2>
          </div>
          <div class="right">
            <button class="theme-toggle" (click)="themeService.toggleTheme()">
              {{ (themeService.isDark$ | async) ? '🌙' : '☀️' }}
            </button>
          </div>
        </header>

        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>

      <div class="sidebar-overlay" *ngIf="mobileSidebarOpen" (click)="toggleSidebar()"></div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    
    /* SIDEBAR */
    .sidebar {
      width: 260px;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
      z-index: 100;
    }
    .brand {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border-color);
    }
    .logo-icon { width: 28px; height: 28px; border-radius: 8px; }
    .brand-text { font-size: 1.25rem; font-weight: 700; letter-spacing: 0.5px; }
    .mobile-close { display: none; background: transparent; font-size: 1.5rem; color: var(--text-primary); border: none; margin-left: auto;}
    
    .nav-links {
      flex: 1; padding: 20px 16px; display: flex; flex-direction: column; gap: 8px;
    }
    .nav-link {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; border-radius: 8px; color: var(--text-secondary);
      text-decoration: none; font-weight: 500; transition: all 0.2s;
    }
    .nav-link:hover { background: var(--bg-card-hover); color: var(--text-primary); }
    .nav-link.active {
      background: rgba(11, 197, 234, 0.1); color: var(--accent-cyan);
      box-shadow: inset 3px 0 0 var(--accent-cyan);
    }
    .nav-link .icon { font-size: 1.2rem; }

    .sidebar-bottom { padding: 20px 16px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap:10px; }
    .logout-btn { background: transparent; color: var(--text-secondary); text-align: left; padding: 12px 16px; border-radius: 8px; display: flex; align-items:center; gap:12px; font-weight:500;}
    .logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: var(--accent-red); }
    .user-profile { font-size: 0.9rem; color: var(--text-primary); padding: 0 16px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-weight:600;}

    /* MAIN WRAPPER */
    .main-wrapper {
      flex: 1; display: flex; flex-direction: column; overflow: hidden;
      background: var(--bg-body);
    }
    .topbar {
      height: 70px; padding: 0 24px; border-bottom: 1px solid var(--border-color);
      display: flex; align-items: center; justify-content: space-between;
      background: var(--bg-card); z-index: 10;
    }
    .topbar .left { display: flex; align-items: center; gap: 16px; }
    .hamburger { display: none; background: transparent; font-size: 1.5rem; color: var(--text-primary); padding: 0; border: none;}
    .page-title { font-size: 1.2rem; font-weight: 600; text-transform: capitalize; margin:0;}
    .theme-toggle { background: var(--bg-body); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color); border-radius: 20px;}

    .content-area {
      flex: 1; overflow-y: auto; padding: 32px;
    }

    /* RESPONSIVE */
    .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 90;}
    @media (max-width: 900px) {
      .sidebar { position: fixed; height: 100%; transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .hamburger, .mobile-close, .sidebar-overlay { display: block; }
      .content-area { padding: 16px; }
    }
  `]
})
export class LayoutComponent {
  mobileSidebarOpen = false;
  pageTitle = 'Dashboard';

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const path = this.router.url.split('/')[1];
      this.pageTitle = path || 'Dashboard';
      this.mobileSidebarOpen = false;
    });
  }

  toggleSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  logout() {
    this.authService.logout();
  }
}
