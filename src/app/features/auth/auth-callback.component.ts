import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({ selector: 'app-auth-callback', standalone: true, template: '' })
export class AuthCallbackComponent implements OnInit {
  private handled = false; 

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService 
  ) {}

  ngOnInit() {
    if (this.handled) return;
    this.handled = true;

    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.authService.handleGoogleCallback(token);
      this.toast.success('Successfully logged in with Google!');
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } else {
      this.router.navigate(['/auth']);
    }
  }
}