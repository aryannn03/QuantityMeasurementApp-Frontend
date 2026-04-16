import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuantityService, Quantity } from '../../core/services/quantity.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-arithmetic',
  standalone: true,
  imports: [CommonModule, FormsModule],

  template: `
    <div class="page-container fade-in">
      <div class="page-header">
        <h1>Arithmetic Operations</h1>
        <p>Add, subtract, or divide measurement quantities</p>
      </div>

      <form (ngSubmit)="onCalculate()" #calcForm="ngForm">

        <!-- Tabs -->
        <div class="tabs-container">
          <div class="op-tabs">
            <button
              type="button"
              [class.active]="operation === 'ADD'"
              (click)="setOperation('ADD')">
              <span class="text-green">+</span> Add
            </button>

            <button
              type="button"
              [class.active]="operation === 'SUBTRACT'"
              (click)="setOperation('SUBTRACT')">
              <span class="text-red">−</span> Subtract
            </button>

            <button
              type="button"
              [class.active]="operation === 'DIVIDE'"
              (click)="setOperation('DIVIDE')">
              <span class="text-orange">÷</span> Divide
            </button>
          </div>
        </div>

        <!-- Inputs -->
        <div class="compare-grid">

          <!-- Quantity 1 -->
          <div class="card q-card">
            <div class="card-title">
              <span class="badge">1</span> First Quantity
            </div>

            <div class="grid-layout">
              <div class="form-group">
                <label>VALUE</label>
                <input
                  type="number"
                  name="val1"
                  [(ngModel)]="q1.value"
                  required>
              </div>

              <div class="form-group">
                <label>TYPE</label>
                <select
                  name="type1"
                  [(ngModel)]="q1.measurementType"
                  (change)="onTypeChange(1)"
                  required>
                  <option value="">Select type</option>
                  <option value="LENGTH">Length</option>
                  <option value="VOLUME">Volume</option>
                  <option value="WEIGHT">Weight</option>
                  <option value="TEMPERATURE">Temperature</option>
                </select>
              </div>
            </div>

            <div class="form-group margin-top">
              <label>UNIT</label>
              <select
                name="unit1"
                [(ngModel)]="q1.unit"
                [disabled]="!q1.measurementType"
                required>
                <option value="">Select unit</option>
                <option *ngFor="let u of availableUnits1" [value]="u">
                  {{ u }}
                </option>
              </select>
            </div>
          </div>

          <!-- Symbol -->
          <div class="op-badge">
            <span *ngIf="operation === 'ADD'" class="text-green">+</span>
            <span *ngIf="operation === 'SUBTRACT'" class="text-red">−</span>
            <span *ngIf="operation === 'DIVIDE'" class="text-orange">÷</span>
          </div>

          <!-- Quantity 2 -->
          <div class="card q-card">
            <div class="card-title">
              <span class="badge">2</span> Second Quantity
            </div>

            <div class="grid-layout">
              <div class="form-group">
                <label>VALUE</label>
                <input
                  type="number"
                  name="val2"
                  [(ngModel)]="q2.value"
                  required>
              </div>

              <div class="form-group">
                <label>TYPE</label>
                <select
                  name="type2"
                  [(ngModel)]="q2.measurementType"
                  (change)="onTypeChange(2)"
                  required>
                  <option value="">Select type</option>
                  <option value="LENGTH">Length</option>
                  <option value="VOLUME">Volume</option>
                  <option value="WEIGHT">Weight</option>
                  <option value="TEMPERATURE">Temperature</option>
                </select>
              </div>
            </div>

            <div class="form-group margin-top">
              <label>UNIT</label>
              <select
                name="unit2"
                [(ngModel)]="q2.unit"
                [disabled]="!q2.measurementType"
                required>
                <option value="">Select unit</option>
                <option *ngFor="let u of availableUnits2" [value]="u">
                  {{ u }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="submit-btn bg-cyan"
          [disabled]="calcForm.invalid || loading">

          <span class="icon">=</span>
          {{ loading ? 'Calculating...' : 'Calculate' }}
        </button>
      </form>

      <!-- Result -->
      <div class="result-card fade-in" *ngIf="result !== null">

        <div class="result-label">
          RESULT ({{ operation }})
        </div>

        <!-- Add / Subtract -->
        <div
          class="result-value"
          *ngIf="operation !== 'DIVIDE'">

          <span class="highlight text-cyan">
            {{ ($any(result)).value }}
          </span>

          {{ ($any(result)).unit }}
        </div>

        <!-- Divide -->
        <div
          class="result-value"
          *ngIf="operation === 'DIVIDE'">

          <span class="highlight text-cyan">
            {{ result }}
          </span>
        </div>
      </div>
    </div>
  `,

  styles: [`
    .page-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header h1 {
      font-size: 1.8rem;
      margin-bottom: 4px;
      font-weight: 700;
    }

    .page-header p {
      color: var(--text-secondary);
    }

    .tabs-container {
      margin-bottom: 16px;
    }

    .op-tabs {
      display: inline-flex;
      background: var(--bg-card);
      padding: 6px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }

    .op-tabs button {
      padding: 8px 20px;
      font-weight: 600;
      background: transparent;
      border-radius: 8px;
      color: var(--text-secondary);
    }

    .op-tabs button.active {
      background: var(--bg-body);
      color: var(--text-primary);
    }

    .compare-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
    }

    @media (max-width: 800px) {
      .compare-grid {
        grid-template-columns: 1fr;
      }

      .op-badge {
        display: none;
      }
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 24px;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .badge {
      background: var(--accent-cyan);
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: grid;
      place-items: center;
      font-size: 0.8rem;
    }

    .op-badge {
      font-size: 2rem;
      font-weight: 700;
    }

    .grid-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .margin-top {
      margin-top: 16px;
    }

    label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    input, select {
      padding: 12px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--bg-body);
      color: var(--text-primary);
    }

    .submit-btn {
      width: 220px;
      padding: 14px;
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
      color: white;
      font-weight: 600;
      border-radius: 10px;
      float: right;
    }

    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .result-card {
      margin-top: 16px;
      padding: 24px;
      border-radius: 14px;
      background: var(--bg-card);
      border-left: 4px solid var(--accent-cyan);
    }

    .result-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .result-value {
      font-size: 1.8rem;
      font-weight: 700;
    }

    .text-green { color: #22c55e; }
    .text-red { color: #ef4444; }
    .text-orange { color: #f59e0b; }
    .text-cyan { color: var(--accent-cyan); }
  `]
})
export class ArithmeticComponent {

  q1: Partial<Quantity> = {
    value: null as any,
    unit: '',
    measurementType: ''
  };

  q2: Partial<Quantity> = {
    value: null as any,
    unit: '',
    measurementType: ''
  };

  availableUnits1: string[] = [];
  availableUnits2: string[] = [];

  operation: 'ADD' | 'SUBTRACT' | 'DIVIDE' = 'ADD';

  loading = false;

  result: Quantity | number | null = null;

  private unitsMap: { [key: string]: string[] } = {
    LENGTH: ['INCH', 'FEET', 'YARD', 'CENTIMETER'],
    VOLUME: ['GALLON', 'LITRE', 'MILLILITRE'],
    WEIGHT: ['MILLIGRAM', 'GRAM', 'KILOGRAM', 'POUND', 'TONNE'],
    TEMPERATURE: ['CELSIUS', 'FAHRENHEIT']
  };

  constructor(
    private quantityService: QuantityService,
    private toast: ToastService
  ) {}

  setOperation(op: 'ADD' | 'SUBTRACT' | 'DIVIDE') {
    this.operation = op;
    this.result = null;
  }

  onTypeChange(index: number) {
    if (index === 1) {
      this.availableUnits1 =
        this.unitsMap[this.q1.measurementType || ''] || [];
      this.q1.unit = '';
    } else {
      this.availableUnits2 =
        this.unitsMap[this.q2.measurementType || ''] || [];
      this.q2.unit = '';
    }
  }

  onCalculate() {
    this.loading = true;
    this.result = null;

    const req = [
      this.q1 as Quantity,
      this.q2 as Quantity
    ];

    let source: any;

    if (this.operation === 'ADD') {
      source = this.quantityService.add(req);
    } else if (this.operation === 'SUBTRACT') {
      source = this.quantityService.subtract(req);
    } else {
      source = this.quantityService.divide(req);
    }

    source.subscribe({
      next: (res: any) => {
        this.result = res;
        this.loading = false;
        this.toast.success(
          `${this.operation} successful`
        );
      },
      error: (err: any) => {
  this.loading = false;
  this.result = null;
}
    });
  }
}