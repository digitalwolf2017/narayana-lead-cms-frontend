import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { MediaService, MediaUploadResponse } from '../../../../services/media.service';
import { normalizeImageUrl } from '../../models/dynamic-page.model';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  templateUrl: './image-upload.component.html',
})
export class ImageUploadComponent {
  private readonly mediaService = inject(MediaService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() label = 'Image';
  @Input() description = 'Upload or drag and drop an image';
  @Input() imagePreview = '';
  @Input() mediaId?: number | null = null;

  @Output() imageChange = new EventEmitter<string>();
  @Output() mediaIdChange = new EventEmitter<number | null>();
  @Output() fileChange = new EventEmitter<File | null>();

  errorMessage = '';
  isDragging = false;
  isUploading = false;

  selectedFileName = '';
  selectedFileSize = '';

  // =========================================================
  // DRAG OVER
  // =========================================================

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isUploading) return;
    this.isDragging = true;
  }

  // =========================================================
  // DRAG LEAVE
  // =========================================================

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  // =========================================================
  // DROP
  // =========================================================

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (this.isUploading) return;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    this.processFile(files[0]);
  }

  // =========================================================
  // FILE SELECT
  // =========================================================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.isUploading) {
      return;
    }

    this.processFile(file);
    input.value = '';
  }

  // =========================================================
  // PROCESS FILE
  // =========================================================

  private processFile(file: File): void {
    this.errorMessage = '';

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file (PNG, JPG, WEBP, SVG).';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.errorMessage = 'Image size must be less than 5MB.';
      return;
    }

    this.selectedFileName = file.name;
    this.selectedFileSize = this.formatFileSize(file.size);

    // Immediate local preview for responsive UX
    const reader = new FileReader();
    reader.onload = (): void => {
      const result = reader.result;
      if (typeof result === 'string') {
        this.imagePreview = result;
        this.cdr.markForCheck();
      }
    };
    reader.readAsDataURL(file);

    // Upload to server media endpoint
    this.isUploading = true;
    this.mediaService.uploadMedia(file).subscribe({
      next: (res: MediaUploadResponse) => {
        this.isUploading = false;
        if (!res.success || !res.data) {
          this.errorMessage = res.message || 'Image upload failed. Please try again.';
          this.cdr.markForCheck();
          return;
        }

        const d = res.data;
        const newMediaId = Number(d.media_id ?? d.id);
        const rawImageUrl = String(
          d.public_url ??
          d.url ??
          d['file_url'] ??
          d.relative_path ??
          d.path ??
          ''
        );
        const resolvedUrl = normalizeImageUrl(rawImageUrl);

        if (!Number.isInteger(newMediaId) || newMediaId <= 0) {
          this.errorMessage = 'Image uploaded, but invalid Media ID was returned.';
          this.cdr.markForCheck();
          return;
        }

        this.mediaId = newMediaId;
        if (resolvedUrl) {
          this.imagePreview = resolvedUrl;
        }
        this.mediaIdChange.emit(newMediaId);
        this.imageChange.emit(this.imagePreview);
        this.fileChange.emit(file);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isUploading = false;
        this.errorMessage =
          err?.error?.message || err?.message || 'Failed to upload image. Please check network and file size.';
        this.cdr.markForCheck();
      },
    });
  }

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  removeImage(): void {
    this.imagePreview = '';
    this.mediaId = null;
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.errorMessage = '';

    this.imageChange.emit('');
    this.mediaIdChange.emit(null);
    this.fileChange.emit(null);
    this.cdr.markForCheck();
  }

  // =========================================================
  // FILE SIZE
  // =========================================================

  private formatFileSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
}
