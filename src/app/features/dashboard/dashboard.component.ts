import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuantityService } from '../../core/services/quantity.service';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-wrapper fade-in">
      
      <!-- HERO CARD -->
      <div class="hero-card">
        <div class="hero-content">
          <h1>Welcome back<span *ngIf="username">, {{username.split(' ')[0]}}</span>! 👋</h1>
          <p>Here's an overview of your measurement operations</p>
        </div>
        <div class="hero-icon-container">
          <span class="hero-ruler">📏</span>
        </div>
      </div>

      <!-- STATS GRID -->
      <div class="stats-grid">
        <div class="stat-card" *ngFor="let stat of stats; let i = index" [style.animation-delay]="i * 0.1 + 's'">
          <div class="stat-icon" [ngClass]="stat.colorClass">
            <span class="icon">{{stat.icon}}</span>
          </div>
          <div class="stat-info">
            <span class="label">{{stat.label}}</span>
            <span class="value" *ngIf="!loading">{{stat.count}}</span>
            <div class="skeleton-value" *ngIf="loading"></div>
          </div>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <h3 class="section-title">Quick Actions</h3>
      <div class="quick-actions">
        <a routerLink="/convert" class="action-btn">
          <span class="icon">⇆</span> Convert Units
        </a>
        <a routerLink="/compare" class="action-btn">
          <span class="icon">≠</span> Compare Values
        </a>
        <a routerLink="/arithmetic" class="action-btn">
          <span class="icon">±</span> Arithmetic
        </a>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-wrapper { display: flex; flex-direction: column; gap: 32px; }
    
    .hero-card {
      background: linear-gradient(135deg, var(--bg-card), var(--bg-card-hover));
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 32px;
      display: flex; justify-content: space-between; align-items: center;
      position: relative; overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .hero-card::after {
      content: ''; position: absolute; right: 0; bottom: 0; width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(11,197,234,0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-content h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
    .hero-content p { color: var(--text-secondary); }
    .hero-icon-container {
      width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
      display: flex; align-items: center; justify-content: center; font-size: 2rem;
      box-shadow: var(--shadow-neon); z-index: 1;
    }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;
    }
    .stat-card {
      background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md);
      padding: 20px; display: flex; align-items: center; gap: 16px;
      animation: slideUp 0.4s ease-out forwards; opacity: 0; transform: translateY(20px);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
    
    .stat-icon {
      width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
    }
    .bg-cyan-light { background: rgba(11,197,234,0.1); color: var(--accent-cyan); }
    .bg-purple-light { background: rgba(139,92,246,0.1); color: var(--accent-purple); }
    .bg-blue-light { background: rgba(59,130,246,0.1); color: var(--accent-blue); }
    .bg-red-light { background: rgba(239,68,68,0.1); color: var(--accent-red); }
    .bg-orange-light { background: rgba(245,158,11,0.1); color: var(--accent-orange); }

    .stat-info { display: flex; flex-direction: column; gap: 4px; }
    .stat-info .label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600;}
    .stat-info .value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
    
    .skeleton-value { height: 28px; width: 60px; background: var(--border-color); border-radius: 4px; animation: pulse 1.5s infinite; }

    .section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: -16px; color: var(--text-primary); }
    .quick-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .action-btn {
      background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md);
      padding: 12px 20px; display: flex; align-items: center; gap: 8px; font-weight: 500;
      color: var(--text-secondary); text-decoration: none; transition: all 0.2s;
    }
    .action-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); border-color: var(--text-muted); }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.3; }
      100% { opacity: 0.6; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  username = '';
  loading = true;

  stats = [
    { type: 'CONVERT', label: 'Conversions', icon: '⇆', colorClass: 'bg-cyan-light', count: 0 },
    { type: 'COMPARE', label: 'Comparisons', icon: '≠', colorClass: 'bg-purple-light', count: 0 },
    { type: 'ADD', label: 'Additions', icon: '+', colorClass: 'bg-blue-light', count: 0 },
    { type: 'SUBTRACT', label: 'Subtractions', icon: '−', colorClass: 'bg-red-light', count: 0 },
    { type: 'DIVIDE', label: 'Divisions', icon: '÷', colorClass: 'bg-orange-light', count: 0 }
  ];

  constructor(private quantityService: QuantityService, private authService: AuthService) {
    this.authService.profile$.subscribe(p => {
      if (p && p.name) this.username = p.name;
    });
  }

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    if (!this.authService.isLoggedIn()) {
      this.stats.forEach(s => s.count = 0);
      this.loading = false;
      return;
    }
    let completed = 0;
    this.stats.forEach(s => {
      this.quantityService.getCount(s.type).pipe(
        catchError(() => of(0))
      ).subscribe(count => {
        s.count = count;
        completed++;
        if (completed === this.stats.length) this.loading = false;
      });
    });
  }
}
