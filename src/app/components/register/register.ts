import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Toast } from '../../services/toast/toast';
import { Auth } from '../../services/auth/auth';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private toast: Toast,
    private cookieService: CookieService
  ) {}
  router = inject(Router);
  authService = inject(Auth);
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      contactNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.signup(this.registerForm.value).subscribe({
        next: (result: any) => {
          this.cookieService.set('auth_token', result.token, { expires: 7 });
          this.router.navigateByUrl('/');
          this.toast.show(result.message, 'success');
        },
        error: (err) => {
          const message =
            err.error?.message || 'Server error. Please try again later.';
          this.toast.show(message, 'error');
        },
      });
    } else {
      this.toast.show('Please fix the errors. ', 'error');
      this.registerForm.markAllAsTouched();
    }
  }
}
