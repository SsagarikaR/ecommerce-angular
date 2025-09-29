import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { Dialog } from './dialog';
import { DialogService, DialogData } from '../../../services/dialog/dialog';

describe('DialogComponent', () => {
  let component: Dialog;
  let fixture: ComponentFixture<Dialog>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  const dialogDataSubject = new Subject<DialogData>();

  beforeEach(async () => {
    // Create a mock DialogService using Jasmine's spyOn
    mockDialogService = jasmine.createSpyObj('DialogService', ['confirm'], {
      dialogData$: dialogDataSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [Dialog],
      providers: [{ provide: DialogService, useValue: mockDialogService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Dialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invisible by default', () => {
    expect(component.visible).toBe(false);
    const dialogElement = fixture.debugElement.query(By.css('.fixed'));
    expect(dialogElement).toBeNull();
  });

  it('should display the dialog with correct content when the service emits data', () => {
    // Arrange
    const testData: DialogData = {
      title: 'Test Title',
      message: 'This is a test message.',
    };

    // Act
    dialogDataSubject.next(testData);
    fixture.detectChanges();

    // Assert
    expect(component.visible).toBe(true);
    expect(component.title).toBe(testData.title);
    expect(component.message).toBe(testData.message);

    const dialogElement = fixture.debugElement.query(By.css('.fixed'));
    expect(dialogElement).toBeTruthy();
    expect(
      dialogElement.query(By.css('h2')).nativeElement.textContent
    ).toContain('Test Title');
    expect(
      dialogElement.query(By.css('p')).nativeElement.textContent
    ).toContain('This is a test message.');
  });

  it('should call confirm(true) and hide the dialog on OK click', () => {
    // Arrange: Make the dialog visible first
    const testData: DialogData = {
      title: 'Confirm Action',
      message: 'Proceed?',
    };
    dialogDataSubject.next(testData);
    fixture.detectChanges();

    // Act
    const okButton = fixture.debugElement.query(By.css('button.bg-blue-600'));
    okButton.nativeElement.click();
    fixture.detectChanges();

    // Assert
    expect(mockDialogService.confirm).toHaveBeenCalledWith(true);
    expect(component.visible).toBe(false);
    expect(fixture.debugElement.query(By.css('.fixed'))).toBeNull();
  });

  it('should call confirm(false) and hide the dialog on Cancel click', () => {
    // Arrange: Make the dialog visible first
    const testData: DialogData = {
      title: 'Confirm Cancel',
      message: 'Cancel action?',
    };
    dialogDataSubject.next(testData);
    fixture.detectChanges();

    // Act
    const cancelButton = fixture.debugElement.query(
      By.css('button.bg-gray-200')
    );
    cancelButton.nativeElement.click();
    fixture.detectChanges();

    // Assert
    expect(mockDialogService.confirm).toHaveBeenCalledWith(false);
    expect(component.visible).toBe(false);
    expect(fixture.debugElement.query(By.css('.fixed'))).toBeNull();
  });

  it('should unsubscribe from the dialog service on destroy', () => {
    // Arrange: Create a spy on the subscription's unsubscribe method
    const unsubscribeSpy = spyOn(component['subscription'], 'unsubscribe');

    // Act
    component.ngOnDestroy();

    // Assert
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
