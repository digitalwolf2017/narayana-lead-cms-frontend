import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageUploadComponent } from '../../shared/image-upload/image-upload.component';

interface BannerStat {
  id: number;
  value: string;
  label: string;
}

export interface BannerConfig {
  subHeading: string;
  heading: string;
  stats: BannerStat[];
  buttonText: string;
  buttonUrl: string;
  backgroundImage: string;
  desktopActive: boolean;
  mobileActive: boolean;
}

@Component({
  selector: 'app-banner-section',
  standalone: true,
  imports: [
    FormsModule,
    ImageUploadComponent,
  ],
  templateUrl: './banner-section.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class BannerSectionComponent {

  @Input() banner: BannerConfig = {
    subHeading: '',
    heading: '',
    stats: [
      {
        id: 1,
        value: '900+',
        label: 'Campus',
      },
      {
        id: 2,
        value: '250+',
        label: 'Cities',
      },
      {
        id: 3,
        value: '47+',
        label: 'Legacy',
      },
      {
        id: 4,
        value: '600000+',
        label: 'Learners All Over India',
      },
    ],
    buttonText: '',
    buttonUrl: '',
    backgroundImage: '',
    desktopActive: true,
    mobileActive: true,
  };

  @Output() bannerChange =
    new EventEmitter<BannerConfig>();

  isSectionOpen = false;
  isActive = true;

  isContentOpen = true;
  isStatisticsOpen = true;
  isCtaOpen = false;
  isBackgroundOpen = false;

  openStatId: number | null = 1;

  private nextStatId = 5;

  toggleSection(): void {
    this.isSectionOpen = !this.isSectionOpen;
  }

  toggleActive(): void {
    this.isActive = !this.isActive;

    this.emitChange();
  }

  toggleDesktop(): void {
    this.banner.desktopActive =
      !this.banner.desktopActive;

    this.emitChange();
  }

  toggleMobile(): void {
    this.banner.mobileActive =
      !this.banner.mobileActive;

    this.emitChange();
  }

  toggleContent(): void {
    this.isContentOpen =
      !this.isContentOpen;
  }

  toggleStatistics(): void {
    this.isStatisticsOpen =
      !this.isStatisticsOpen;
  }

  toggleCta(): void {
    this.isCtaOpen =
      !this.isCtaOpen;
  }

  toggleBackground(): void {
    this.isBackgroundOpen =
      !this.isBackgroundOpen;
  }

  toggleStat(statId: number): void {
    this.openStatId =
      this.openStatId === statId
        ? null
        : statId;
  }

  isStatOpen(statId: number): boolean {
    return this.openStatId === statId;
  }

  addStat(): void {
    const newStat: BannerStat = {
      id: this.nextStatId++,
      value: '',
      label: '',
    };

    this.banner.stats.push(newStat);

    this.openStatId = newStat.id;

    this.emitChange();
  }

  removeStat(statId: number): void {
    this.banner.stats =
      this.banner.stats.filter(
        (stat) => stat.id !== statId
      );

    if (this.openStatId === statId) {
      this.openStatId =
        this.banner.stats[0]?.id ?? null;
    }

    this.emitChange();
  }

  onBackgroundImageChange(
    imageUrl: string
  ): void {
    this.banner.backgroundImage =
      imageUrl;

    this.emitChange();
  }

  emitChange(): void {
    this.bannerChange.emit({
      subHeading:
        this.banner.subHeading,

      heading:
        this.banner.heading,

      stats:
        this.banner.stats.map(
          (stat) => ({
            ...stat,
          })
        ),

      buttonText:
        this.banner.buttonText,

      buttonUrl:
        this.banner.buttonUrl,

      backgroundImage:
        this.banner.backgroundImage,

      desktopActive:
        this.banner.desktopActive,

      mobileActive:
        this.banner.mobileActive,
    });
  }
}