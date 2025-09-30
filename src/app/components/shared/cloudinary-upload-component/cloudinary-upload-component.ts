import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { cloudinaryConfig } from '../../../types/type';
import { CloudinaryService } from '../../../services/cloudinary/cloudinary';

@Component({
  selector: 'app-cloudinary-upload-component',
  imports: [CommonModule],

  templateUrl: './cloudinary-upload-component.html',
  styleUrl: './cloudinary-upload-component.css',
})
export class CloudinaryUploadComponent {
  @Input() config: cloudinaryConfig = { cloudName: '', uploadPreset: '' };
  @Input() placeholder = 'Upload Image';
  @Input() allowedFormats: string[] = ['jpg', 'jpeg', 'png', 'webp'];
  @Input() maxSize: number = 5 * 1024 * 1024;
  @Input() allowRemove = true;
  @Input() disabled = false;
  @Input() targetProperty = '';
  @Input()
  set imageUrl(url: string) {
    if (url) {
      this.currentImageUrl = url;
    } else {
      this.currentImageUrl = '';
    }
  }

  @Output() uploadSuccess = new EventEmitter<string>();
  @Output() uploadSuccessful = new EventEmitter<{
    url: string;
    property: string;
  }>();
  @Output() uploadErrorEvent = new EventEmitter<string>();
  @Output() imageRemoved = new EventEmitter<void>();
  private cloudinaryService = inject(CloudinaryService);

  currentImageUrl = '';
  isUploading = false;
  uploadProgress = 0;
  isDragOver = false;
  uploadError = '';

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
      // Notify error
      this.uploadErrorEvent.emit(validationError);
      return;
    }

    this.clearError();

    // Use the simplified service
    this.cloudinaryService
      .uploadFile(
        file,
        this.config.cloudName,
        this.config.uploadPreset,
        this.config.folder,
      )
      .subscribe({
        next: (url: string) => {
          this.handleUploadSuccess(url);
        },
        error: (err) => {
          const errorMessage = err.message || 'Image upload failed';
          this.handleUploadError(errorMessage);
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

    return null;
  }

  private handleUploadSuccess(url: string): void {
    this.currentImageUrl = url;
    this.uploadSuccessful.emit({
      url: url,
      property: this.targetProperty,
    });

    this.uploadSuccess.emit(url);
  }

  private handleUploadError(errorMessage: string): void {
    this.uploadError = errorMessage;
    this.uploadErrorEvent.emit(errorMessage);
  }

  removeImage(): void {
    this.currentImageUrl = '';
    this.imageRemoved.emit();
  }

  clearError(): void {
    this.uploadError = '';
  }
}
