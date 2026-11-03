import { LogoConfig, SectionConfig } from '../dynamic-page.model';
import { PageBuilderSection } from '../../../../services/dynamic-page.service';
import { getDefaultLogos } from '../dynamic-page.defaults';
import { ClassesConfig } from '../../sections/classes/classes.component';

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
  const isEnabled = Boolean(sections.find((s) => s.key === 'header')?.active ?? false);
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
    sort_order: 11,
    content: { logos: headerLogos },
  };
}

export function buildBannerSection(
  banner: Record<string, unknown>,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'banner')?.active ?? true);
  const rawBullets = banner['bullets'];
  const bannerBullets =
    Array.isArray(rawBullets) && rawBullets.length > 0
      ? (rawBullets as Array<{ text: string; show_desktop?: boolean; show_mobile?: boolean; sort_order?: number }>).map(
          (b, idx) => ({
            text: b.text || 'Excellence in Education',
            show_desktop: b.show_desktop ?? true,
            show_mobile: b.show_mobile ?? true,
            sort_order: idx + 1,
          }),
        )
      : [
          { text: 'Technologically driven stress-free curriculum', show_desktop: true, show_mobile: true, sort_order: 1 },
          { text: "Asia's one of the largest educational conglomerates", show_desktop: true, show_mobile: true, sort_order: 2 },
          { text: 'Learning that leads to careers, not just certificates', show_desktop: true, show_mobile: true, sort_order: 3 },
        ];

  return {
    section_type: 'BANNER',
    is_enabled: isEnabled,
    sort_order: 1,
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

export function buildClassesSection(
  classesConfig: Partial<ClassesConfig> | undefined,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'classes')?.active ?? true);
  const cards = classesConfig?.cards;
  const programs =
    Array.isArray(cards) && cards.length > 0
      ? cards.map((card, idx) => {
          const rawMediaId = (card as unknown as Record<string, unknown>)['mediaId'] ?? (card as unknown as Record<string, unknown>)['media_id'];
          const parsedMediaId = Number(rawMediaId);
          const desktopMediaId = Number.isInteger(parsedMediaId) && parsedMediaId > 0 ? parsedMediaId : 1;
          const code = `PROGRAM_${idx + 1}`;
          const features = (Array.isArray(card.listItems) && card.listItems.length > 0
            ? card.listItems
            : [{ id: 1, text: 'Interactive learning' }]
          ).map((item, itemIdx) => ({
            text: item.text || 'Comprehensive instruction',
            sort_order: itemIdx + 1,
          }));

          return {
            code,
            name: card.heading || `Program ${idx + 1}`,
            class_range: card.subHeading || 'Grade Level',
            summary: card.h3Heading || 'Foundational curriculum and interactive learning.',
            desktop_media_id: desktopMediaId,
            mobile_media_id: null,
            image_alt: card.heading || 'Class Program Image',
            features,
            fees_cta: {
              label: card.button1Text || 'Fee Structure',
              action: 'FEES_STRUCTURE',
              url: card.button1Url ? card.button1Url : null,
            },
            brochure_cta: {
              label: card.button2Text || 'Download Brochure',
              action: 'DOWNLOAD_BROCHURE',
              url: card.button2Url ? card.button2Url : null,
            },
            sort_order: idx + 1,
          };
        })
      : [
          {
            code: 'PRE_PRIMARY',
            name: 'Pre-Primary',
            class_range: 'Nursery to UKG',
            summary: 'Foundational learning with interactive pedagogical methods.',
            desktop_media_id: 1,
            mobile_media_id: null,
            image_alt: 'Pre-Primary Classes',
            features: [
              { text: 'Activity-based learning', sort_order: 1 },
              { text: 'Personalized attention', sort_order: 2 },
            ],
            fees_cta: { label: 'Fee Structure', action: 'FEES_STRUCTURE', url: null },
            brochure_cta: { label: 'Download Brochure', action: 'DOWNLOAD_BROCHURE', url: null },
            sort_order: 1,
          },
          {
            code: 'PRIMARY',
            name: 'Primary School',
            class_range: 'Grade 1 to 5',
            summary: 'Concept-oriented foundation with joyful learning atmosphere.',
            desktop_media_id: 1,
            mobile_media_id: null,
            image_alt: 'Primary School Classes',
            features: [
              { text: 'Interactive digital classrooms', sort_order: 1 },
              { text: 'Science and math foundation', sort_order: 2 },
            ],
            fees_cta: { label: 'Fee Structure', action: 'FEES_STRUCTURE', url: null },
            brochure_cta: { label: 'Download Brochure', action: 'DOWNLOAD_BROCHURE', url: null },
            sort_order: 2,
          },
          {
            code: 'HIGH_SCHOOL',
            name: 'High School',
            class_range: 'Grade 6 to 10',
            summary: 'Competitive exam orientation alongside board exam excellence.',
            desktop_media_id: 1,
            mobile_media_id: null,
            image_alt: 'High School Classes',
            features: [
              { text: 'Olympiad & competitive preparation', sort_order: 1 },
              { text: 'Rigorous assessment modules', sort_order: 2 },
            ],
            fees_cta: { label: 'Fee Structure', action: 'FEES_STRUCTURE', url: null },
            brochure_cta: { label: 'Download Brochure', action: 'DOWNLOAD_BROCHURE', url: null },
            sort_order: 3,
          },
        ];

  return {
    section_type: 'CLASSES',
    is_enabled: isEnabled,
    sort_order: 2,
    content: {
      heading: classesConfig?.sectionHeading || 'Our Classes & Programs',
      subheading: classesConfig?.sectionSubHeading || 'Comprehensive Curriculum from Pre-Primary to Higher Secondary',
      programs,
    },
  };
}
