import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuantityService, Quantity } from '../../core/services/quantity.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>Compare Quantities</h1>
        <p>Check if two measurements are equivalent</p>
      </div>

      <form (ngSubmit)="onCompare()" #compareForm="ngForm">
        <div class="compare-grid">
          <!-- Quantity 1 -->
          <div class="card q-card">
            <div class="card-title">
               <span class="badge">1</span> First Quantity
            </div>
            
            <div class="grid-layout">
              <div class="form-group">
                <label>VALUE</label>
                <input type="number" name="val1" [(ngModel)]="q1.value" placeholder="e.g. 1" required>
              </div>

              <div class="form-group">
                <label>TYPE</label>
                <select name="type1" [(ngModel)]="q1.measurementType" (change)="onTypeChange(1)" required>
                  <option value="" disabled selected>Select type</option>
                  <option value="LENGTH">Length</option>
                  <option value="VOLUME">Volume</option>
                  <option value="WEIGHT">Weight</option>
                  <option value="TEMPERATURE">Temperature</option>
                </select>
              </div>
            </div>

            <div class="form-group margin-top">
              <label>UNIT</label>
              <select name="unit1" [(ngModel)]="q1.unit" [disabled]="!q1.measurementType" required>
                <option value="" disabled selected>Select unit</option>
                <option *ngFor="let u of availableUnits1" [value]="u">{{u}}</option>
              </select>
            </div>
          </div>

          <div class="vs-badge">VS</div>

          <!-- Quantity 2 -->
          <div class="card q-card">
            <div class="card-title">
               <span class="badge">2</span> Second Quantity
            </div>
            
            <div class="grid-layout">
              <div class="form-group">
                <label>VALUE</label>
                <input type="number" name="val2" [(ngModel)]="q2.value" placeholder="e.g. 12" required>
              </div>

              <div class="form-group">
                <label>TYPE</label>
                <select name="type2" [(ngModel)]="q2.measurementType" (change)="onTypeChange(2)" required>
                  <option value="" disabled selected>Select type</option>
                  <option value="LENGTH">Length</option>
                  <option value="VOLUME">Volume</option>
                  <option value="WEIGHT">Weight</option>
                  <option value="TEMPERATURE">Temperature</option>
                </select>
              </div>
            </div>

            <div class="form-group margin-top">
              <label>UNIT</label>
              <select name="unit2" [(ngModel)]="q2.unit" [disabled]="!q2.measurementType" required>
                <option value="" disabled selected>Select unit</option>
                <option *ngFor="let u of availableUnits2" [value]="u">{{u}}</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn bg-cyan" [disabled]="compareForm.invalid || loading">
          <span class="icon">≠</span> {{ loading ? 'Comparing...' : 'Compare' }}
        </button>
      </form>

      <div class="result-card fade-in" *ngIf="comparisonResult !== null" [ngClass]="comparisonResult ? 'equal' : 'not-equal'">
        <div class="result-icon">
          {{ comparisonResult ? '✓' : '✕' }}
        </div>
        <div class="result-text">
          <div class="title">{{ comparisonResult ? 'Measurements are Equal' : 'Measurements are NOT Equal' }}</div>
          <div class="subtitle">
            {{q1.value}} {{q1.unit}} is {{ comparisonResult ? 'equal' : 'not equal' }} to {{q2.value}} {{q2.unit}}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 24px; max-width: 1000px; margin: 0 auto; }
    .page-header h1 { font-size: 1.8rem; margin-bottom: 4px; font-weight: 700; }
    .page-header p { color: var(--text-secondary); }
    
    .compare-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: center; margin-bottom: 24px; position:relative;}
    @media (max-width: 800px) {
      .compare-grid { grid-template-columns: 1fr; gap: 32px; }
      .vs-badge { display:none;}
    }

    .card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); }
    .q-card { flex: 1; }
    
    .card-title { display: flex; align-items: center; gap: 12px; font-weight: 600; margin-bottom: 24px; color: var(--text-primary);}
    .badge { background: var(--accent-cyan); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
    
    .vs-badge {
      background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 50%;
      width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: var(--text-muted); font-size: 0.9rem; z-index: 2; margin: 0 -20px;
    }

    .grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .margin-top { margin-top: 16px;}
    label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.5px; }

    .submit-btn {
      width: 200px; padding: 14px; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
      color: white; font-weight: 600; font-size: 1rem; border-radius: 8px;
      float: right; display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

    .result-card {
      margin-top: 16px; border-radius: var(--radius-md); padding: 24px;
      display: flex; align-items: center; gap: 20px; border-left: 4px solid;
    }
    .result-card.equal { background: rgba(16,185,129,0.05); border-color: var(--accent-green); }
    .result-card.not-equal { background: rgba(239,68,68,0.05); border-color: var(--accent-red); }
    
    .result-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; font-weight: bold; color: white;}
    .result-card.equal .result-icon { background: var(--accent-green); box-shadow: 0 0 15px rgba(16,185,129,0.3);}
    .result-card.not-equal .result-icon { background: var(--accent-red); box-shadow: 0 0 15px rgba(239,68,68,0.3);}
    
    .title { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;}
    .subtitle { color: var(--text-secondary); }
    input, select {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-body);
  color: var(--text-primary);
  width: 100%;
}

select option {
  background: var(--bg-card);
  color: var(--text-primary);
}
  `]
})
export class CompareComponent {
  q1: Partial<Quantity> = { value: null as any, measurementType: '', unit: '' };
  q2: Partial<Quantity> = { value: null as any, measurementType: '', unit: '' };
  
  availableUnits1: string[] = [];
  availableUnits2: string[] = [];
  
  loading = false;
  comparisonResult: boolean | null = null;

  private unitsMap: { [key: string]: string[] } = {
    'LENGTH': ['INCH', 'FEET', 'YARD', 'CM'],
    'VOLUME': ['GALLON', 'LITRE', 'MILLILITRE'],
    'WEIGHT': ['KG', 'GRAM', 'TONNE'],
    'TEMPERATURE': ['CELSIUS', 'FAHRENHEIT']
  };

  constructor(private quantityService: QuantityService, private toast: ToastService) {}

  onTypeChange(index: number) {
    if (index === 1) {
      this.availableUnits1 = this.unitsMap[this.q1.measurementType!] || [];
      this.q1.unit = '';
    } else {
      this.availableUnits2 = this.unitsMap[this.q2.measurementType!] || [];
      this.q2.unit = '';
    }
  }

  onCompare() {
    this.loading = true;
    const req = [this.q1 as Quantity, this.q2 as Quantity];

    this.quantityService.compare(req).subscribe({
      next: (res: any) => {
        // Assume API returns string 'Measurements are Equal' or similar, or boolean
        if (typeof res === 'string') {
           this.comparisonResult = res.toLowerCase().includes('are equal');
        } else {
           this.comparisonResult = !!res; // fallback if boolean
        }
        
        this.loading = false;
        this.toast.success('Comparison successful');
      },
      error: (err) => {
        this.loading = false;
        this.comparisonResult = null;
      }
    });
  }
}
