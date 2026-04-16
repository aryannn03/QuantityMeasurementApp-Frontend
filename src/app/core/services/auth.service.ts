import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

export interface Profile {
  email: string;
  name: string;
  provider: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  public token$ = this.tokenSubject.asObservable();
  
  private profileSubject = new BehaviorSubject<Profile | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private toast: ToastService) {
  const savedToken = localStorage.getItem('token');
  if (savedToken) {
    this.tokenSubject.next(savedToken);
    setTimeout(() => this.fetchProfile(), 0); 
  }
}

  get token(): string | null {
    return this.tokenSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  login(credentials: any) {
    return this.http.post(`${this.baseUrl}/login`, credentials, { responseType: 'text' }).pipe(
      tap((token: string) => {
        this.saveToken(token);
        this.toast.success('Logged in successfully!');
      })
    );
  }

  signup(data: any) {
    return this.http.post(`${this.baseUrl}/signup`, data, { responseType: 'text' }).pipe(
      tap(() => this.toast.success('Signed up successfully! You can now log in.'))
    );
  }

  logout() {
    if (this.token) {
        this.http.post(`${this.baseUrl}/logout`, {}, { responseType: 'text' }).subscribe({
  error: () => {}
});
    }
    this.clearToken();
    this.toast.info('Logged out successfully.');
    this.router.navigate(['/auth']);
  }

  googleLogin() {
    window.location.href = '${environment.apiUrl}/oauth2/authorization/google';
  }

  handleGoogleCallback(token: string) {
    this.saveToken(token);

  }

  private saveToken(token: string) {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
    this.fetchProfile();
  }

  private clearToken() {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.profileSubject.next(null);
  }

  fetchProfile() {
  if (!this.tokenSubject.value) return; // ← guard
  this.http.get<Profile>(`${this.baseUrl}/me`).subscribe({
    next: (profile) => this.profileSubject.next(profile),
    error: (err) => {
      if (err.status === 401) this.clearToken(); 
    }
  });
}
}
