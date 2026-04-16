import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts$ | async" 
           class="toast" [ngClass]="toast.type"
           @slideIn>
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'info'">i</span>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" (click)="toastService.remove(toast.id)">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      background: var(--bg-card);
      color: var(--text-primary);
      box-shadow: var(--shadow-md);
      border-left: 4px solid transparent;
      min-width: 300px;
      max-width: 400px;
    }
    .toast.success { border-left-color: var(--accent-green); }
    .toast.error { border-left-color: var(--accent-red); border-top: 1px solid var(--accent-red);}
    .toast.info { border-left-color: var(--accent-blue); }
    
    .toast-icon {
      margin-right: 12px;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
    .toast.success .toast-icon { color: var(--accent-green); background: rgba(16,185,129,0.1); }
    .toast.error .toast-icon { color: var(--accent-red); background: rgba(239,68,68,0.1); }
    .toast.info .toast-icon { color: var(--accent-blue); background: rgba(59,130,246,0.1); }
    
    .toast-message { flex: 1; font-size: 0.95rem; }
    
    .toast-close {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      color: var(--text-muted);
      cursor: pointer;
      margin-left: 12px;
      width: auto;
      padding: 0;
    }
    .toast-close:hover { color: var(--text-primary); }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
