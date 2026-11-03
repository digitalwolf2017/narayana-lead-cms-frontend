import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageUploadComponent } from '../../shared/image-upload/image-upload.component';

export interface LimitedSeatsLogo {
  id: number;
  name: string;
  image: string;
  mediaId?: number | null;
}

export interface LimitedSeatsConfig {
  image: string;
  mediaId?: number | null;
  feature_media_id?: number | null;
  background_media_id?: number | null;
  heading: string;
  subHeading: string;
  buttonText: string;
  logos: LimitedSeatsLogo[];
  schoolName: string;
  numberOfSchools: string;
  isActive: boolean;
  desktopActive: boolean;
  mobileActive: boolean;
}

@Component({
  selector: 'app-limited-seats-section',
  standalone: true,
  imports: [
    FormsModule,
    ImageUploadComponent,
  ],
  templateUrl: './limited-seats.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class LimitedSeatsComponent {

  @Input() limitedSeats: LimitedSeatsConfig = {
    image: '',
    heading: 'Limited Seats',
    subHeading: '',
    buttonText: 'Apply Now',
    logos: [],
    schoolName: '',
    numberOfSchools: '',
    isActive: true,
    desktopActive: true,
    mobileActive: true,
  };

  @Output() limitedSeatsChange =
    new EventEmitter<LimitedSeatsConfig>();

  isSectionOpen = false;

  isContentOpen = true;
  isLogosOpen = true;
  isSchoolDetailsOpen = true;

  openLogoId: number | null = null;

  private nextLogoId = 1;

  toggleSection(): void {
    this.isSectionOpen =
      !this.isSectionOpen;
  }

  toggleActive(): void {
    this.limitedSeats.isActive =
      !this.limitedSeats.isActive;

    this.emitChange();
  }

  toggleDesktop(): void {
    this.limitedSeats.desktopActive =
      !this.limitedSeats.desktopActive;

    this.emitChange();
  }

  toggleMobile(): void {
    this.limitedSeats.mobileActive =
      !this.limitedSeats.mobileActive;

    this.emitChange();
  }

  toggleContent(): void {
    this.isContentOpen =
      !this.isContentOpen;
  }

  toggleLogos(): void {
    this.isLogosOpen =
      !this.isLogosOpen;
  }

  toggleSchoolDetails(): void {
    this.isSchoolDetailsOpen =
      !this.isSchoolDetailsOpen;
  }

  toggleLogo(logoId: number): void {
    this.openLogoId =
      this.openLogoId === logoId
        ? null
        : logoId;
  }

  isLogoOpen(logoId: number): boolean {
    return this.openLogoId === logoId;
  }

  addLogo(): void {
    const newLogo: LimitedSeatsLogo = {
      id: this.nextLogoId++,
      name: '',
      image: '',
    };

    this.limitedSeats.logos.push(newLogo);

    this.openLogoId = newLogo.id;

    this.emitChange();
  }

  removeLogo(logoId: number): void {
    this.limitedSeats.logos =
      this.limitedSeats.logos.filter(
        (logo) => logo.id !== logoId
      );

    if (this.openLogoId === logoId) {
      this.openLogoId =
        this.limitedSeats.logos[0]?.id ?? null;
    }

    this.emitChange();
  }

  onImageChange(image: string): void {
    this.limitedSeats.image = image;

    this.emitChange();
  }

  onMediaIdChange(mediaId: number | null): void {
    this.limitedSeats.mediaId = mediaId;
    this.limitedSeats.feature_media_id = mediaId;
    this.limitedSeats.background_media_id = mediaId;
    this.emitChange();
  }

  onLogoMediaIdChange(logoId: number, mediaId: number | null): void {
    const logo = this.limitedSeats.logos.find((item) => item.id === logoId);
    if (!logo) return;
    logo.mediaId = mediaId;
    this.emitChange();
  }

  onLogoImageChange(
    logoId: number,
    image: string
  ): void {
    const logo =
      this.limitedSeats.logos.find(
        (item) => item.id === logoId
      );

    if (!logo) {
      return;
    }

    logo.image = image;

    this.emitChange();
  }

  emitChange(): void {
    this.limitedSeatsChange.emit({
      image: this.limitedSeats.image,
      mediaId: this.limitedSeats.mediaId,
      feature_media_id: this.limitedSeats.feature_media_id,
      background_media_id: this.limitedSeats.background_media_id,

      heading: this.limitedSeats.heading,

      subHeading:
        this.limitedSeats.subHeading,

      buttonText:
        this.limitedSeats.buttonText,

      logos:
        this.limitedSeats.logos.map(
          (logo) => ({
            ...logo,
          })
        ),

      schoolName:
        this.limitedSeats.schoolName,

      numberOfSchools:
        this.limitedSeats.numberOfSchools,

      isActive:
        this.limitedSeats.isActive,

      desktopActive:
        this.limitedSeats.desktopActive,

      mobileActive:
        this.limitedSeats.mobileActive,
    });
  }
}