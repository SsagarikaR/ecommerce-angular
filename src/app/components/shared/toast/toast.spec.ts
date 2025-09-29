import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Toast } from './toast';

describe('Toast', () => {
  let component: Toast;
  let fixture: ComponentFixture<Toast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toast],
    }).compileComponents();

    fixture = TestBed.createComponent(Toast);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be visible by default', () => {
    const toastElement = fixture.debugElement.query(By.css('div'));
    expect(toastElement).toBeNull();
  });

  it('should be visible when `visible` input is true', () => {
    // Arrange
    component.visible = true;

    // Act
    fixture.detectChanges();

    // Assert
    const toastElement = fixture.debugElement.query(By.css('div'));
    expect(toastElement).toBeTruthy();
  });

  it('should display the correct message', () => {
    // Arrange
    const testMessage = 'This is a test message.';
    component.message = testMessage;
    component.visible = true;

    // Act
    fixture.detectChanges();

    // Assert
    const toastElement = fixture.debugElement.query(By.css('div'));
    expect(toastElement.nativeElement.textContent).toContain(testMessage);
  });

  it('should apply the "success" class for type "success"', () => {
    // Arrange
    component.visible = true;
    component.type = 'success';

    // Act
    fixture.detectChanges();

    // Assert
    const toastElement = fixture.debugElement.query(By.css('div'));
    expect(toastElement.classes['bg-green-600']).toBe(true);
    expect(toastElement.classes['bg-red-600']).toBeFalsy();
    expect(toastElement.classes['bg-blue-600']).toBeFalsy();
  });

  it('should apply the "error" class for type "error"', () => {
    // Arrange
    component.visible = true;
    component.type = 'error';

    // Act
    fixture.detectChanges();

    // Assert
    const toastElement = fixture.debugElement.query(By.css('div'));
    expect(toastElement.classes['bg-red-600']).toBe(true);
    expect(toastElement.classes['bg-green-600']).toBeFalsy();
    expect(toastElement.classes['bg-blue-600']).toBeFalsy();
  });

  it('should apply the "info" class for type "info"', () => {
    // Arrange
    component.visible = true;
    component.type = 'info';

    // Act
    fixture.detectChanges();

    // Assert
    const toastElement = fixture.debugElement.query(By.css('div'));
    expect(toastElement.classes['bg-blue-600']).toBe(true);
    expect(toastElement.classes['bg-green-600']).toBeFalsy();
    expect(toastElement.classes['bg-red-600']).toBeFalsy();
  });
});
