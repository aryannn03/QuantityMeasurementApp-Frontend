import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadComponent: () => import('./features/auth/auth.component').then(c => c.AuthComponent) 
  },
  { 
    path: 'oauth2/callback', 
    loadComponent: () => import('./features/auth/auth-callback.component').then(c => c.AuthCallbackComponent) 
  },
  { 
    path: '', 
    loadComponent: () => import('./features/layout/layout.component').then(c => c.LayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent) },
      { path: 'convert', loadComponent: () => import('./features/convert/convert.component').then(c => c.ConvertComponent) },
      { path: 'compare', loadComponent: () => import('./features/compare/compare.component').then(c => c.CompareComponent) },
      { path: 'arithmetic', loadComponent: () => import('./features/arithmetic/arithmetic.component').then(c => c.ArithmeticComponent) },
      { path: 'history', loadComponent: () => import('./features/history/history.component').then(c => c.HistoryComponent), canActivate: [authGuard] }, // ✅ only history protected
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];