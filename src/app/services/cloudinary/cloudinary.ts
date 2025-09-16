import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  uploadFile(
    file: File,
    cloudName: string,
    uploadPreset: string,
    folder?: string
  ): Observable<any> {
    return new Observable((observer) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      if (folder) {
        formData.append('folder', folder);
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          observer.next({ progress });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            observer.next({ response });
            observer.complete();
          } catch (err) {
            observer.error('Failed to parse response');
          }
        } else {
          observer.error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        observer.error('Network error occurred');
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  }
}
