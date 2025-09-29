import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudinaryConfig, UploadResult } from '../../../types/type';
import { HttpClient } from '@angular/common/http';
import { CloudinaryService } from '../../../services/cloudinary/cloudinary';

@Component({
  selector: 'app-cloudinary-upload-component',
  imports: [CommonModule],

  templateUrl: './cloudinary-upload-component.html',
  styleUrl: './cloudinary-upload-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloudinaryUploadComponent {
  private http = inject(HttpClient);
  @Input() config: CloudinaryConfig = { cloudName: '', uploadPreset: '' };
  @Input() placeholder: string = 'Upload Image';
  @Input() allowedFormats: string[] = ['jpg', 'jpeg', 'png', 'webp'];
  @Input() maxSize: number = 5 * 1024 * 1024;
  @Input() allowRemove: boolean = true;
  @Input() showInfo: boolean = false;
  @Input() disabled: boolean = false;
  @Input() targetProperty: string = '';
  @Input()
  set imageUrl(url: string) {
    if (url) {
      this.currentImageUrl = url;
    } else {
      this.currentImageUrl = '';
      this.uploadResult = null;
    }
  }

  @Output() uploadSuccess = new EventEmitter<UploadResult>();
  @Output() uploadSuccessful = new EventEmitter<{
    url: string;
    property: string;
  }>();
  @Output() uploadErrorEvent = new EventEmitter<string>();
  @Output() imageRemoved = new EventEmitter<void>();
  private cloudinaryService = inject(CloudinaryService);

  currentImageUrl: string = '';
  uploadResult: UploadResult | null = null;
  isUploading: boolean = false;
  uploadProgress: number = 0;
  isDragOver: boolean = false;
  uploadError: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  triggerFileInput(): void {
    if (this.disabled || this.isUploading) return;
    this.fileInput.nativeElement.click();
  }
  get acceptedTypes(): string {
    return this.allowedFormats.map((format) => `.${format}`).join(',');
  }
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      this.uploadFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  private uploadFile(file: File): void {
    const validationError = this.validateFile(file);
    if (validationError) {
      this.uploadError = validationError;
      return;
    }

    this.clearError();
    this.isUploading = true;
    this.uploadProgress = 0;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.config.uploadPreset);

    this.cloudinaryService
      .uploadFile(
        file,
        this.config.cloudName,
        this.config.uploadPreset,
        this.config.folder
      )
      .subscribe({
        next: (event) => {
          if (event.progress !== undefined) {
            this.uploadProgress = event.progress;
          }
          if (event.response) {
            this.handleUploadSuccess(event.response);
            this.isUploading = false;
          }
        },
        error: (err) => {
          this.isUploading = false;
          this.handleUploadError(err);
        },
      });
  }

  private validateFile(file: File): string | null {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.allowedFormats.includes(fileExtension)) {
      return `File type not supported. Allowed formats: ${this.allowedFormats
        .join(', ')
        .toUpperCase()}`;
    }

    if (this.maxSize && file.size > this.maxSize) {
      return `File size too large. Maximum size: ${this.formatFileSize(
        this.maxSize
      )}`;
    }

    return null;
  }

  private handleUploadSuccess(response: any): void {
    const result: UploadResult = {
      url: response.secure_url,
      publicId: response.public_id,
      originalFilename: response.original_filename,
      format: response.format,
      bytes: response.bytes,
    };

    this.uploadResult = result;
    this.currentImageUrl = result.url;
    this.uploadSuccessful.emit({
      url: result.url,
      property: this.targetProperty,
    });
    this.uploadSuccess.emit(result);
  }

  private handleUploadError(errorMessage: string): void {
    this.uploadError = errorMessage;
    this.uploadErrorEvent.emit(errorMessage);
  }

  removeImage(): void {
    this.currentImageUrl = '';
    this.uploadResult = null;
    this.imageRemoved.emit();
  }

  clearError(): void {
    this.uploadError = '';
  }

  formatFileSize(bytes: number | undefined): string {
    if (bytes === 0 || bytes === undefined) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
