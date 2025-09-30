import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private http = inject(HttpClient);

  /**
   * Uploads a file to Cloudinary.
   * @returns An Observable that emits the secure URL of the uploaded image.
   */
  uploadFile(
    file: File,
    cloudName: string,
    uploadPreset: string,
    folder?: string,
  ): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (folder) {
      formData.append('folder', folder);
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    return this.http
      .post<any>(uploadUrl, formData)
      .pipe(map((response) => response.secure_url));
  }
}
