import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  success(message: string) { this.addToast('success', message); }
  error(message: string) { this.addToast('error', message); }
  info(message: string) { this.addToast('info', message); }

  private addToast(type: 'success' | 'error' | 'info', message: string) {
    const id = Math.random().toString(36).substring(2, 9);
    const toasts = [...this.toastsSubject.value, { id, type, message }];
    this.toastsSubject.next(toasts);
    setTimeout(() => this.remove(id), 5000);
  }

  remove(id: string) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}
