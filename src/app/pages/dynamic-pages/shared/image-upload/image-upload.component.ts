import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  templateUrl: './image-upload.component.html',
})
export class ImageUploadComponent {

  @Input() label = 'Image';

  @Input() description = 'Upload or drag and drop an image';

  @Input() imagePreview = '';

  @Output() imageChange = new EventEmitter<string>();

  @Output() fileChange = new EventEmitter<File | null>();

  errorMessage = '';
  isDragging = false;

  selectedFileName = '';

  selectedFileSize = '';

  // =========================================================
  // DRAG OVER
  // =========================================================

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

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

    if (!file) {
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
      this.errorMessage = 'Please select an image file.';
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorMessage = 'Image size must be less than 5MB.';
      return;
    }

    this.selectedFileName = file.name;

    this.selectedFileSize = this.formatFileSize(file.size);

    const reader = new FileReader();

    reader.onload = (): void => {

      const result = reader.result;

      if (typeof result !== 'string') {
        return;
      }

      this.imagePreview = result;

      this.imageChange.emit(result);

      this.fileChange.emit(file);
    };

    reader.readAsDataURL(file);
  }

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  removeImage(): void {

    this.imagePreview = '';

    this.selectedFileName = '';

    this.selectedFileSize = '';

    this.imageChange.emit('');

    this.fileChange.emit(null);
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