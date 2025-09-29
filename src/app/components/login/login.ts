import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Auth } from '../../services/auth/auth';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { Toast } from '../../services/toast/toast';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private toast = inject(Toast);
  loginForm!: FormGroup;
  fb = inject(FormBuilder);
  auth = inject(Auth);
  router = inject(Router);
  cookieService = inject(CookieService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.auth.login(this.loginForm.value).subscribe({
      next: (result: any) => {
        this.cookieService.set('auth_token', result.token, { expires: 7 });

        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.toast.show(err.error?.message || 'Login failed', 'error');
      },
    });
  }
}
