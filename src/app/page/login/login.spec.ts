import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Login } from './login';
import { Auth } from '../../services/auth/auth';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Toast } from '../../services/toast/toast';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockAuthService: jasmine.SpyObj<Auth>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockToastService: jasmine.SpyObj<Toast>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('Auth', ['login']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['set']);
    mockToastService = jasmine.createSpyObj('Toast', ['show']);

    await TestBed.configureTestingModule({
      imports: [
        Login,
        ReactiveFormsModule,
        CommonModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Auth, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: CookieService, useValue: mockCookieService },
        { provide: Toast, useValue: mockToastService },
        FormBuilder, // Provide FormBuilder here
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the login form with email and password controls', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('should make the email field required', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.errors?.['required']).toBeTruthy();
  });

  it('should validate the email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.errors?.['email']).toBeTruthy();
  });

  it('should make the password field required and have a minimum length of 6', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('12345');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();
  });

  it('should show an error toast on failed submission', fakeAsync(() => {
    const mockError = { error: { message: 'Invalid credentials' } };
    mockAuthService.login.and.returnValue(throwError(() => mockError));

    component.loginForm.get('email')?.setValue('test@example.com');
    component.loginForm.get('password')?.setValue('password123');

    component.onSubmit();
    tick(); expect(mockToastService.show).toHaveBeenCalledWith(
      'Invalid credentials',
      'error'
    );

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  }));

  it('should not submit the form if it is invalid', () => {
    component.loginForm.get('email')?.setValue('');
    component.loginForm.get('password')?.setValue('');

    component.onSubmit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });
});
