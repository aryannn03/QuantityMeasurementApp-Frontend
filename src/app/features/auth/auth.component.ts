import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-wrapper fade-in">
      <div class="auth-modal">
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon bg-cyan"></span>
            <h2>QuantifyHub</h2>
          </div>
        </div>

        <div class="auth-tabs">
          <button [class.active]="isLogin" (click)="toggleMode(true)">Sign In</button>
          <button [class.active]="!isLogin" (click)="toggleMode(false)">Sign Up</button>
        </div>

        <button class="google-btn" type="button" (click)="loginWithGoogle()">
          <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="G" style="width: 20px;">
          Continue with Google
        </button>

        <div class="divider">
          <span>or</span>
        </div>

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group fade-in" *ngIf="!isLogin">
            <label>NAME</label>
            <input type="text" formControlName="name" placeholder="John Doe">
          </div>

          <div class="form-group">
            <label>EMAIL</label>
            <input type="email" formControlName="email" placeholder="ayu@gmail.com">
          </div>

          <div class="form-group password-group">
            <label>PASSWORD</label>
            <div class="input-wrapper">
              <span class="icon-left">🔒</span>
              <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="••••••••">
              <span class="icon-right" (click)="togglePassword()">👁</span>
            </div>
          </div>

          <button type="submit" class="submit-btn bg-cyan" [disabled]="authForm.invalid">
            {{ isLogin ? 'Sign In' : 'Sign Up' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(5px);
      display: flex; justify-content: center; align-items: center;
      z-index: 1000;
    }
    .auth-modal {
      background: var(--bg-card);
      width: 100%; max-width: 420px;
      border-radius: var(--radius-lg);
      padding: 32px;
      box-shadow: var(--shadow-md);
      position: relative;
    }
    .auth-header {
      display: flex; justify-content: center; align-items: center; margin-bottom: 24px;
    }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-icon { width: 24px; height: 24px; border-radius: 6px; display: inline-block; }
    h2 { font-size: 1.5rem; font-weight: 600; margin:0;}
    
    .auth-tabs {
      display: flex; background: var(--bg-body); border-radius: 8px; padding: 4px; margin-bottom: 24px;
    }
    .auth-tabs button {
      flex: 1; padding: 10px; border-radius: 6px; background: transparent; font-weight: 500;
    }
    .auth-tabs button.active { background: var(--bg-card); box-shadow: var(--shadow-sm); }
    
    .google-btn {
      width: 100%; padding: 12px;
      display: flex; align-items: center; justify-content: center; gap: 12px;
      background: var(--bg-body); font-weight: 500;
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }
    
    .divider {
      text-align: center; margin: 24px 0; position: relative;
    }
    .divider::before {
      content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: var(--border-color);
    }
    .divider span {
      background: var(--bg-card); padding: 0 12px; position: relative; color: var(--text-muted); font-size: 0.85rem;
    }
    
    .form-group { margin-bottom: 20px; }
    label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; font-weight: 600; text-transform: uppercase; }
    
    .password-group .input-wrapper { position: relative; }
    .password-group input { padding-left: 2.5rem; padding-right: 2.5rem; }
    .icon-left, .icon-right {
      position: absolute; top: 50%; transform: translateY(-50%); color: var(--text-muted); cursor: pointer; text-decoration: none; font-size: 14px;
    }
    .icon-left { left: 1rem; }
    .icon-right { right: 1rem; }
    
    .submit-btn {
      width: 100%; padding: 14px; background-image: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
      color: white; font-weight: 600; font-size: 1rem;
      border: none; margin-top: 10px; transition: transform 0.2s;
    }
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-neon);
    }
    .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow:none;}
  `]
})
export class AuthComponent implements OnInit {
  isLogin = true;
  showPassword = false;

  authForm: FormGroup;

  constructor(private authService: AuthService, private router: Router) {
    this.authForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      name: new FormControl('') 
    });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleMode(isLogin: boolean) {
    this.isLogin = isLogin;
    this.authForm.reset();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    const val = this.authForm.value;

    if (this.isLogin) {
      this.authService.login({ email: val.email, password: val.password }).subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
    } else {
      this.authService.signup({ name: val.name, email: val.email, password: val.password }).subscribe(() => {
        this.toggleMode(true);
      });
    }
  }

  loginWithGoogle() {
    this.authService.googleLogin();
  }
}
