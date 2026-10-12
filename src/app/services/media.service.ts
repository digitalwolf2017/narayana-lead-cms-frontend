import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { API_ENDPOINTS } from '../core/constants/api-endpoints';
import { ApiResponse } from '../core/models/api-response.model';
import { HttpClient } from '@angular/common/http';

export interface MediaUploadResponseData {
  id: number;
  media_id?: number;
  filename?: string;
  original_filename?: string;
  original_name?: string;
  stored_name?: string;
  mime_type?: string;
  file_size?: number;
  url?: string;
  public_url?: string;
  path?: string;
  relative_path?: string;
  [key: string]: unknown;
}

export type MediaUploadResponse = ApiResponse<MediaUploadResponseData>;

@Injectable({
  providedIn: 'root',
})

export class MediaService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  /**
   * Upload an image/file to the backend media store
   * Endpoint: POST /backend/media
   */
  uploadMedia(file: File): Observable<MediaUploadResponse> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  return this.http.post<MediaUploadResponse>(
    '/api/v1/backend/media',
    formData
  );
}

  /**
   * Delete an unreferenced media record by ID
   * Endpoint: DELETE /backend/media/{id}
   */
  deleteMedia(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `/api/v1/backend/media/${id}`
    );
  }

  /**
   * Get media details by ID
   * Endpoint: GET /backend/media/{id}
   */
  getMediaById(id: number): Observable<ApiResponse<MediaUploadResponseData>> {
    return this.api.get<ApiResponse<MediaUploadResponseData>>(
      API_ENDPOINTS.MEDIA.BY_ID(id)
    );
  }

}

