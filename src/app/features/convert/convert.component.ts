import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuantityService, Quantity } from '../../core/services/quantity.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-convert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>Unit Converter</h1>
        <p>Convert between any measurement units instantly</p>
      </div>

      <div class="card form-card">
        <form (ngSubmit)="onConvert()" #convertForm="ngForm">
          <div class="grid-layout">
            
            <div class="form-group">
              <label>VALUE</label>
              <input type="number" name="value" [(ngModel)]="value" placeholder="e.g. 100" required>
            </div>

            <div class="form-group">
              <label>MEASUREMENT TYPE</label>
              <select name="type" [(ngModel)]="measurementType" (change)="onTypeChange()" required>
                <option value="" disabled selected>Select type</option>
                <option value="LENGTH">Length</option>
                <option value="VOLUME">Volume</option>
                <option value="WEIGHT">Weight</option>
                <option value="TEMPERATURE">Temperature</option>
              </select>
            </div>
          </div>

          <div class="unit-grid">
             <div class="form-group flex-1">
              <label>FROM UNIT</label>
              <select name="from" [(ngModel)]="fromUnit" [disabled]="!measurementType" required>
                <option value="" disabled selected>Select unit</option>
                <option *ngFor="let u of availableUnits" [value]="u">{{u}}</option>
              </select>
            </div>

            <button type="button" class="swap-btn" (click)="swapUnits()" [disabled]="!fromUnit || !toUnit">⇆</button>

            <div class="form-group flex-1">
              <label>CONVERT TO</label>
              <select name="to" [(ngModel)]="toUnit" [disabled]="!measurementType" required>
                <option value="" disabled selected>Select target unit</option>
                <option *ngFor="let u of availableUnits" [value]="u">{{u}}</option>
              </select>
            </div>
          </div>

          <button type="submit" class="submit-btn bg-cyan" [disabled]="convertForm.invalid || loading">
            {{ loading ? 'Converting...' : 'Convert' }}
          </button>
        </form>
      </div>

      <div class="result-card fade-in" *ngIf="result">
        <div class="result-label">RESULT</div>
        <div class="result-value">
          <span class="highlight">{{value}}</span> {{fromUnit}} = <span class="highlight text-cyan">{{result.value}}</span> {{result.unit}}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: 24px; max-width: 900px; margin: 0 auto; }
    .page-header h1 { font-size: 1.8rem; margin-bottom: 4px; font-weight: 700; }
    .page-header p { color: var(--text-secondary); }
    
    .card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-sm); }
    
    .grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    @media (max-width: 600px) { .grid-layout { grid-template-columns: 1fr; } }
    
    .unit-grid { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 32px; }
    @media (max-width: 600px) { .unit-grid { flex-direction: column; align-items: stretch; } }
    
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .flex-1 { flex: 1; }
    label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.5px; }
    
    .swap-btn {
      width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--border-color);
      background: var(--bg-body); display: flex; justify-content: center; align-items: center;
      font-size: 1.2rem; align-self: flex-end; margin-bottom: 2px; transition: transform 0.2s;
    }
    .swap-btn:hover:not([disabled]) {
      transform: rotate(180deg); background: rgba(11,197,234,0.1); color: var(--accent-cyan); border-color: var(--accent-cyan);
    }
      
    
    .submit-btn {
      width: 200px; padding: 14px; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
      color: white; font-weight: 600; font-size: 1rem;
      float: right; margin-top: -8px;
    }
    .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

    .result-card {
      background: var(--bg-card); border: 1px solid var(--accent-cyan); border-left: 4px solid var(--accent-cyan);
      border-radius: var(--radius-md); padding: 24px; display: flex; flex-direction: column; gap: 8px;
      box-shadow: var(--shadow-neon); margin-top: 16px;
    }
    .result-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
    .result-value { font-size: 1.5rem; color: var(--text-primary); }
    .highlight { font-weight: 700; }
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
export class ConvertComponent {
  value: number | null = null;
  measurementType = '';
  fromUnit = '';
  toUnit = '';
  
  availableUnits: string[] = [];
  result: Quantity | null = null;
  loading = false;

  private unitsMap: { [key: string]: string[] } = {
    'LENGTH': ['INCH', 'FEET', 'YARD', 'CENTIMETER'],
    'VOLUME': ['GALLON', 'LITRE', 'MILLILITRE'],
    'WEIGHT': ['KG', 'GRAM', 'TONNE'],
    'TEMPERATURE': ['CELSIUS', 'FAHRENHEIT']
  };

  constructor(private quantityService: QuantityService, private toast: ToastService) {}

  onTypeChange() {
    this.availableUnits = this.unitsMap[this.measurementType] || [];
    this.fromUnit = '';
    this.toUnit = '';
    this.result = null;
  }

  swapUnits() {
    const temp = this.fromUnit;
    this.fromUnit = this.toUnit;
    this.toUnit = temp;
    this.result = null;
  }

  onConvert() {
    if (this.value == null || !this.fromUnit || !this.toUnit) return;
    this.loading = true;
    
    const quantity: Quantity = {
      value: this.value,
      unit: this.fromUnit,
      measurementType: this.measurementType
    };

    this.quantityService.convert(quantity, this.toUnit).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        this.toast.success('Conversion successful!');
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }
}
