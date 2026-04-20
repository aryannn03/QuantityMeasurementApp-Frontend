import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDarkSubject = new BehaviorSubject<boolean>(true);
  isDark$ = this.isDarkSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('theme');
    const isDark = saved ? saved === 'dark' : true; 
    this.isDarkSubject.next(isDark);
    this.applyTheme(isDark);
  }

  toggleTheme() {
    const isDark = !this.isDarkSubject.value;
    this.isDarkSubject.next(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
