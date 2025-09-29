import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CloudinaryUploadComponent } from './cloudinary-upload-component';
import { CloudinaryService } from '../../../services/cloudinary/cloudinary';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of, throwError, Observable } from 'rxjs';
import { CloudinaryConfig, UploadResult } from '../../../types/type';

describe('CloudinaryUploadComponent', () => {
  let component: CloudinaryUploadComponent;
  let fixture: ComponentFixture<CloudinaryUploadComponent>;
  let mockCloudinaryService: jasmine.SpyObj<CloudinaryService>;

  const mockConfig: CloudinaryConfig = {
    cloudName: 'test_cloud',
    uploadPreset: 'test_preset',
  };
  const mockFile = new File([''], 'test-image.jpg', { type: 'image/jpeg' });
  const mockCloudinaryResponse = {
    secure_url:
      'https://res.cloudinary.com/test_cloud/image/upload/v123456/test-image.jpg',
    public_id: 'test-image',
    original_filename: 'test-image',
    format: 'jpg',
    bytes: 123456,
  };
  const mockUploadResult: UploadResult = {
    url: mockCloudinaryResponse.secure_url,
    publicId: mockCloudinaryResponse.public_id,
    originalFilename: mockCloudinaryResponse.original_filename,
    format: mockCloudinaryResponse.format,
    bytes: mockCloudinaryResponse.bytes,
  };

  beforeEach(async () => {
    mockCloudinaryService = jasmine.createSpyObj('CloudinaryService', [
      'uploadFile',
    ]);

    await TestBed.configureTestingModule({
      imports: [CloudinaryUploadComponent, HttpClientTestingModule],
      providers: [
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CloudinaryUploadComponent);
    component = fixture.componentInstance;
    component.config = mockConfig;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Initial State Tests ---
  it('should display the empty state with placeholder text on initialization', () => {
    const emptyState = fixture.debugElement.query(By.css('.upload-prompt'));
    expect(emptyState).toBeTruthy();
    expect(emptyState.query(By.css('h4')).nativeElement.textContent).toBe(
      'Upload Image'
    );
  });

  it('should disable the file input and not trigger click when disabled input is true', () => {
    component.disabled = true;
    fixture.detectChanges();
    const fileInput = component.fileInput.nativeElement;
    spyOn(fileInput, 'click');

    component.triggerFileInput();
    expect(fileInput.disabled).toBeTrue();
    expect(fileInput.click).not.toHaveBeenCalled();
  });

  // --- File Validation and Upload Tests ---
  it('should display an error for an unsupported file format', () => {
    const invalidFile = new File([''], 'test.gif', { type: 'image/gif' });
    component['uploadFile'](invalidFile);
    fixture.detectChanges();
    expect(component.uploadError).toContain('File type not supported.');
    const errorState = fixture.debugElement.query(By.css('.upload-error'));
    expect(errorState).toBeTruthy();
  });

  it('should display an error for a file exceeding the max size', () => {
    const largeFile = new File([''], 'large-image.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }); // 6 MB
    component.maxSize = 5 * 1024 * 1024; // 5 MB
    component['uploadFile'](largeFile);
    fixture.detectChanges();
    expect(component.uploadError).toContain('File size too large.');
  });

  it('should emit uploadSuccessful and uploadSuccess events on successful upload', fakeAsync(() => {
    mockCloudinaryService.uploadFile.and.returnValue(
      of({ response: mockCloudinaryResponse })
    );

    spyOn(component.uploadSuccessful, 'emit');
    spyOn(component.uploadSuccess, 'emit');

    component.targetProperty = 'productThumbnail';
    component['uploadFile'](mockFile);
    tick();

    expect(component.uploadSuccessful.emit).toHaveBeenCalledWith({
      url: mockUploadResult.url,
      property: 'productThumbnail',
    });
    expect(component.uploadSuccess.emit).toHaveBeenCalledWith(mockUploadResult);
  }));

  // --- Image Management ---
  it('should remove the image and emit imageRemoved event', () => {
    component.currentImageUrl = mockUploadResult.url;
    component.uploadResult = mockUploadResult;
    spyOn(component.imageRemoved, 'emit');

    component.removeImage();

    expect(component.currentImageUrl).toBe('');
    expect(component.uploadResult).toBeNull();
    expect(component.imageRemoved.emit).toHaveBeenCalled();
  });

  it('should show the image preview and "Change" button after successful upload', fakeAsync(() => {
    mockCloudinaryService.uploadFile.and.returnValue(
      of({ response: mockCloudinaryResponse })
    );
    component['uploadFile'](mockFile);
    tick();
    fixture.detectChanges();

    const imagePreview = fixture.debugElement.query(By.css('.image-preview'));
    const changeButton = imagePreview.query(By.css('.change-btn'));

    expect(imagePreview).toBeTruthy();
    expect(imagePreview.query(By.css('img')).nativeElement.src).toContain(
      mockUploadResult.url
    );
    expect(changeButton).toBeTruthy();
  }));
});
