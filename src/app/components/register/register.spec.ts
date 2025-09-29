import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Register } from './register';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Toast } from '../../services/toast/toast';
import { Auth } from '../../services/auth/auth';
import { CookieService } from 'ngx-cookie-service';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let mockAuthService: jasmine.SpyObj<Auth>;
  let mockToastService: jasmine.SpyObj<Toast>;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spy objects for the services
    mockAuthService = jasmine.createSpyObj('Auth', ['signup']);
    mockToastService = jasmine.createSpyObj('Toast', ['show']);
    mockCookieService = jasmine.createSpyObj('CookieService', ['set']);
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        Register,
      ],
      providers: [
        FormBuilder,
        { provide: Auth, useValue: mockAuthService },
        { provide: Toast, useValue: mockToastService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers ngOnInit to initialize the form
  });

  // Test Case 1: Component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test Case 2: Form initialization
  it('should initialize the form with correct controls and validators', () => {
    const form = component.registerForm;
    expect(form).toBeDefined();
    expect(form.get('name')).toBeDefined();
    expect(form.get('email')).toBeDefined();
    expect(form.get('contactNo')).toBeDefined();
    expect(form.get('password')).toBeDefined();
    expect(form.valid).toBeFalse();
  });

  // Test Case 3: Validation for invalid name
  it('should invalidate the form if name is less than 3 characters', () => {
    const nameControl = component.registerForm.get('name');
    nameControl?.setValue('ab');
    expect(nameControl?.invalid).toBeTrue();
    expect(component.registerForm.invalid).toBeTrue();
  });

  // Test Case 4: Validation for invalid email
  it('should invalidate the form if email is invalid', () => {
    const emailControl = component.registerForm.get('email');
    emailControl?.setValue('test@');
    expect(emailControl?.invalid).toBeTrue();
    expect(component.registerForm.invalid).toBeTrue();
  });

  // Test Case 5: Validation for invalid contact number
  it('should invalidate the form if contactNo is not 10 digits', () => {
    const contactNoControl = component.registerForm.get('contactNo');
    contactNoControl?.setValue('12345');
    expect(contactNoControl?.invalid).toBeTrue();
    expect(component.registerForm.invalid).toBeTrue();
  });

  // Test Case 6: Validation for invalid password
  it('should invalidate the form if password is less than 6 characters', () => {
    const passwordControl = component.registerForm.get('password');
    passwordControl?.setValue('pass');
    expect(passwordControl?.invalid).toBeTrue();
    expect(component.registerForm.invalid).toBeTrue();
  });

  // Test Case 7: Form and button are valid with correct data
  it('should validate the form and enable the button with valid data', () => {
    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john.doe@test.com',
      contactNo: '1234567890',
      password: 'password123',
    });
    expect(component.registerForm.valid).toBeTrue();
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(
      By.css('button[type="submit"]')
    );
    expect(submitButton.nativeElement.disabled).toBeFalse();
  });

  // Test Case 8: Successful form submission
  it('should handle successful registration', fakeAsync(() => {
    const mockResponse = {
      message: 'Registration successful!',
      token: 'mock-token',
    };
    mockAuthService.signup.and.returnValue(of(mockResponse));

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john.doe@test.com',
      contactNo: '1234567890',
      password: 'password123',
    });

    component.onSubmit();
    tick();

    expect(mockAuthService.signup).toHaveBeenCalledWith(
      component.registerForm.value
    );
    expect(mockCookieService.set).toHaveBeenCalledWith(
      'auth_token',
      mockResponse.token,
      { expires: 7 }
    );
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    expect(mockToastService.show).toHaveBeenCalledWith(
      mockResponse.message,
      'success'
    );
  }));

  // Test Case 9: Failed form submission (server error)
  it('should handle failed registration with server error', fakeAsync(() => {
    const mockError = { error: { message: 'Email already exists.' } };
    mockAuthService.signup.and.returnValue(throwError(() => mockError));

    component.registerForm.setValue({
      name: 'John Doe',
      email: 'john.doe@test.com',
      contactNo: '1234567890',
      password: 'password123',
    });

    component.onSubmit();
    tick();

    expect(mockAuthService.signup).toHaveBeenCalled();
    expect(mockToastService.show).toHaveBeenCalledWith(
      mockError.error.message,
      'error'
    );
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  }));

  // Test Case 10: Submission with invalid form data
  it('should not call authService on invalid form submission', () => {
    // Form is already invalid on init
    component.onSubmit();
    expect(mockAuthService.signup).not.toHaveBeenCalled();
    expect(mockToastService.show).toHaveBeenCalledWith(
      'Please fix the errors. ',
      'error'
    );
  });
});
