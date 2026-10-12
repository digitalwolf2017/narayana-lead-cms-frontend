import { LogoConfig, SectionConfig } from '../dynamic-page.model';
import { PageBuilderSection } from '../../../../services/dynamic-page.service';
import { getDefaultLogos } from '../dynamic-page.defaults';

export function getMediaId(item: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = item[key];
    if (value !== null && value !== undefined && value !== '') {
      const id = Number(value);
      if (Number.isInteger(id) && id > 0) return id;
    }
  }
  return null;
}

export function buildHeaderSection(
  logos: LogoConfig[],
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'header')?.active ?? true);
  const headerLogos = (Array.isArray(logos) && logos.length > 0 ? logos : getDefaultLogos()).map(
    (logo: LogoConfig, idx: number) => {
      const parsedMediaId = getMediaId(
        logo as unknown as Record<string, unknown>,
        'mediaId', 'media_id',
      );
      return {
        media_id: parsedMediaId && parsedMediaId > 0 ? parsedMediaId : 1,
        name: (logo.name || `Logo ${idx + 1}`).trim(),
        alt: (logo.name || `Logo ${idx + 1}`).trim(),
        show_desktop: logo.desktopActive ?? true,
        show_mobile: logo.mobileActive ?? true,
        sort_order: idx + 1,
      };
    },
  );
  return {
    section_type: 'HEADER',
    is_enabled: isEnabled,
    sort_order: 1,
    content: { logos: headerLogos },
  };
}

export function buildBannerSection(
  banner: Record<string, unknown>,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'banner')?.active ?? true);
  const bannerBullets =
    Array.isArray(banner['bullets']) && (banner['bullets'] as Array<{ text: string }>).length > 0
      ? (banner['bullets'] as Array<{ text: string; show_desktop?: boolean; show_mobile?: boolean; sort_order?: number }>).map(
          (b, idx) => ({
            text: b.text || 'Excellence in Education',
            show_desktop: b.show_desktop ?? true,
            show_mobile: b.show_mobile ?? true,
            sort_order: idx + 1,
          }),
        )
      : [{ text: String(banner['subHeading'] || 'Leading Educational Group'), show_desktop: true, show_mobile: true, sort_order: 1 }];

  return {
    section_type: 'BANNER',
    is_enabled: isEnabled,
    sort_order: 2,
    content: {
      desktop_background_media_id: Number(banner['desktop_background_media_id'] || banner['mediaId'] || 1),
      mobile_background_media_id:
        banner['mobile_background_media_id'] !== undefined && banner['mobile_background_media_id'] !== null
          ? Number(banner['mobile_background_media_id'])
          : null,
      background_alt: String(banner['heading'] || 'Banner Background'),
      eyebrow: banner['eyebrow'] ? String(banner['eyebrow']) : '',
      heading: String(banner['heading'] || banner['h1'] || 'Welcome to Narayana Schools'),
      highlighted_text: banner['highlighted_text'] ? String(banner['highlighted_text']) : '',
      bullets: bannerBullets,
      primary_cta: { label: 'Admissions Open', action: 'OPEN_ADMISSION_MODAL', url: null },
      form_title: 'Admission Enquiry',
      form_enabled: true,
      default_form_intent: 'ENQUIRY',
    },
  };
}

export function buildClassesSection(sections: SectionConfig[]): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'classes')?.active ?? true);
  return {
    section_type: 'CLASSES',
    is_enabled: isEnabled,
    sort_order: 3,
    content: {
      heading: 'Our Classes & Programs',
      subheading: 'Comprehensive Curriculum from Pre-Primary to Higher Secondary',
      programs: [
        {
          code: 'PRE_PRIMARY', name: 'Pre-Primary', class_range: 'Nursery to UKG',
          summary: 'Foundational learning with interactive pedagogical methods.',
          desktop_media_id: 1, mobile_media_id: null, image_alt: 'Pre-Primary Classes',
          features: [{ text: 'Activity-based learning', sort_order: 1 }, { text: 'Personalized attention', sort_order: 2 }],
          fees_cta: { label: 'Fee Structure', action: 'FEES_STRUCTURE', url: null },
          brochure_cta: { label: 'Download Brochure', action: 'DOWNLOAD_BROCHURE', url: null },
          sort_order: 1,
        },
        {
          code: 'PRIMARY', name: 'Primary School', class_range: 'Grade 1 to 5',
          summary: 'Concept-oriented foundation with joyful learning atmosphere.',
          desktop_media_id: 1, mobile_media_id: null, image_alt: 'Primary School Classes',
          features: [{ text: 'Interactive digital classrooms', sort_order: 1 }, { text: 'Science and math foundation', sort_order: 2 }],
          fees_cta: { label: 'Fee Structure', action: 'FEES_STRUCTURE', url: null },
          brochure_cta: { label: 'Download Brochure', action: 'DOWNLOAD_BROCHURE', url: null },
          sort_order: 2,
        },
        {
          code: 'HIGH_SCHOOL', name: 'High School', class_range: 'Grade 6 to 10',
          summary: 'Competitive exam orientation alongside board exam excellence.',
          desktop_media_id: 1, mobile_media_id: null, image_alt: 'High School Classes',
          features: [{ text: 'Olympiad & competitive preparation', sort_order: 1 }, { text: 'Rigorous assessment modules', sort_order: 2 }],
          fees_cta: { label: 'Fee Structure', action: 'FEES_STRUCTURE', url: null },
          brochure_cta: { label: 'Download Brochure', action: 'DOWNLOAD_BROCHURE', url: null },
          sort_order: 3,
        },
      ],
    },
  };
}
