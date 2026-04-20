import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuantityService } from '../../core/services/quantity.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>Operation History</h1>
        <p>Review your past measurements and calculations</p>
      </div>

      <div class="actions-bar">
        <div class="filter-chips">
          <button *ngFor="let filter of filters" 
                  [class.active]="selectedFilter === filter"
                  (click)="setFilter(filter)"
                  class="chip">
            {{filter}}
          </button>
        </div>
        
        <div class="search-export">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search values or units..." class="search-input">
          <button class="export-btn" (click)="exportCSV()">
            <span class="icon">↓</span> Export CSV
          </button>
        </div>
      </div>

      <div class="history-list" *ngIf="filteredHistory().length > 0; else emptyState">
        <div class="history-card fade-in" *ngFor="let item of filteredHistory()" 
     [ngClass]="item.operation?.toLowerCase()">
          <div class="type-badge">{{ item.operation }}</div>
          <div class="history-details">
             <div class="date">{{ item.createdAt | date:'medium' }}</div>
             <!-- The exact shape depends on the backend, we mock a general representation -->
             <div class="data-row">
               <span class="value">{{ item.operand1 }}</span>
               <span class="operator" *ngIf="item.operation !== 'CONVERT'">
                 {{ getOperator(item.operation) }}
               </span>
               <span class="value" *ngIf="item.operation !== 'CONVERT' && item.operand2">
                 {{ item.operand2 }}
               </span>
               <span class="operator">=</span>
               <span class="result">{{ item.result }}</span>
              </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state fade-in" *ngIf="!loading">
          <div class="empty-icon text-muted">∅</div>
          <h3>No records found</h3>
          <p>You haven't performed any operations matching this filter.</p>
        </div>
        <div class="loading-state" *ngIf="loading">
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 24px; max-width: 1000px; margin: 0 auto; }
    .page-header h1 { font-size: 1.8rem; margin-bottom: 4px; font-weight: 700; }
    .page-header p { color: var(--text-secondary); }

    .actions-bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 16px;}
    
    .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { 
      padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;
      background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border-color);
      transition: all 0.2s; cursor: pointer;
    }
    .chip:hover { background: var(--bg-card-hover); }
    .chip.active { background: var(--accent-cyan); color: white; border-color: var(--accent-cyan); box-shadow: var(--shadow-sm);}

    .search-export { display: flex; gap: 12px; }
    .search-input { width: 250px; border-radius: 20px; padding: 8px 16px; }
    .export-btn { 
      display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 20px;
      font-size: 0.85rem; font-weight: 600; background: var(--bg-body); border: 1px solid var(--border-color); color: var(--text-primary);
    }
    .export-btn:hover { background: var(--border-color); }

    .history-list { display: flex; flex-direction: column; gap: 16px; }
    .history-card { 
      background: var(--bg-card); border-radius: var(--radius-md); padding: 20px;
      border: 1px solid var(--border-color); border-left: 4px solid var(--border-color);
      box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 20px;
    }
    .history-card.convert { border-left-color: var(--accent-cyan); }
    .history-card.compare { border-left-color: var(--accent-purple); }
    .history-card.add { border-left-color: var(--accent-blue); }
    .history-card.subtract { border-left-color: var(--accent-red); }
    .history-card.divide { border-left-color: var(--accent-orange); }

    .type-badge { width: 100px; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; }
    .history-details { flex: 1; }
    .date { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px; }
    .data-row { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; }
    .value { font-weight: 500; color: var(--text-secondary); }
    .operator { color: var(--text-muted); font-weight: bold; }
    .result { font-weight: 700; color: var(--text-primary); }

    .empty-state { text-align: center; padding: 64px 20px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color); margin-top:20px;}
    .empty-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }
    
    .loading-state { display: flex; flex-direction: column; gap: 16px; }
    .skeleton-card { height: 80px; background: var(--bg-card); border-radius: var(--radius-md); animation: pulse 1.5s infinite; }

    @media (max-width: 700px) {
      .actions-bar { flex-direction: column; align-items: stretch; }
      .search-export { flex-direction: column; }
      .search-input { width: 100%; }
      .history-card { flex-direction: column; align-items: flex-start; gap: 12px; }
      .type-badge { width: auto; background: var(--bg-body); padding: 4px 8px; border-radius: 4px;}
    }
  `]
})
export class HistoryComponent implements OnInit {
  history: any[] = [];
  filters = ['ALL', 'CONVERT', 'COMPARE', 'ADD', 'SUBTRACT', 'DIVIDE'];
  selectedFilter = 'ALL';
  searchQuery = '';
  loading = false;

  constructor(private quantityService: QuantityService, private toast: ToastService) {}

  ngOnInit() {
    this.fetchHistory();
  }

  fetchHistory() {
    this.loading = true;
    this.history = [];
    this.quantityService.getHistory(this.selectedFilter).subscribe({
      next: (data) => {
        // Sort latest first (assuming createdAt is standard ISO string)
        this.history = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.loading = false;
      },
      error: (err) => {
        this.toast.error('Failed to load history');
        this.loading = false;
      }
    });
  }

  setFilter(f: string) {
    this.selectedFilter = f;
    this.fetchHistory();
  }

  getOperator(type: string): string {
    const map: any = { 'ADD': '+', 'SUBTRACT': '−', 'DIVIDE': '÷', 'COMPARE': 'vs' };
    return map[type] || '';
  }

  filteredHistory() {
    if (!this.searchQuery) return this.history;
    const q = this.searchQuery.toLowerCase();
    return this.history.filter(h => 
      JSON.stringify(h).toLowerCase().includes(q)
    );
  }

 exportCSV() {
  if (!this.history.length) return;
  const headers = 'ID,Type,Date,Operand1,Operand2,Result\n';
  const rows = this.history.map(h =>
    `${h.id},${h.operation},${h.createdAt},"${h.operand1}","${h.operand2 || ''}","${h.result}"`
  ).join('\n');
  const blob = new Blob([headers + rows], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `history-${this.selectedFilter}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}
}
