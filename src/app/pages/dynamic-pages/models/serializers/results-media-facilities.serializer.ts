import { SectionConfig } from '../dynamic-page.model';
import { AcademicResultsConfig } from '../../sections/academic-results/academic-results.component';
import { ImageSectionConfig } from '../../sections/image-section/image-section.component';
import { ParentsSayConfig } from '../../sections/parents-say/parents-say.component';
import { FacilitiesConfig } from '../../sections/facilities/facilities.component';
import { PageBuilderSection } from '../../../../services/dynamic-page.service';

export function buildAcademicResultsSection(
  academicResults: Partial<AcademicResultsConfig>,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'academic-results')?.active ?? true);
  const resultCards =
    Array.isArray(academicResults.results) && academicResults.results.length > 0
      ? academicResults.results
      : [
          { id: 1, image: '', studentName: 'JEE Advanced Rankers', marks: '100+', boardName: 'CBSE', buttonText: '', buttonUrl: '' },
          { id: 2, image: '', studentName: 'NEET Top Scores', marks: '500+', boardName: 'CBSE', buttonText: '', buttonUrl: '' },
        ];

  return {
    section_type: 'ACADEMIC_RESULTS',
    is_enabled: isEnabled,
    sort_order: 7,
    content: {
      heading: academicResults.sectionHeading || 'Outstanding Academic Results',
      subheading: academicResults.sectionSubHeading || 'Our students consistently excel at state and national levels',
      results: resultCards.map((card, idx: number) => ({
        student_name: card.studentName || `Topper ${idx + 1}`,
        score: card.marks || 'Top Rank',
        exam: card.boardName || 'National Board / Competitive Exam',
        year: 2024,
        media_id: Number((card as unknown as Record<string, unknown>)['mediaId'] || 1),
        image_alt: card.studentName || 'Result Image',
        sort_order: idx + 1,
      })),
      cta: { label: 'View All Results', action: 'OPEN_ADMISSION_MODAL', url: null },
    },
  };
}

export function buildImageSection(
  imageSec: Partial<ImageSectionConfig>,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'image-section')?.active ?? true);
  const u = imageSec as unknown as Record<string, unknown>;
  return {
    section_type: 'IMAGE_SECTION',
    is_enabled: isEnabled,
    sort_order: 8,
    content: {
      desktop_media_id: Number(u['desktop_media_id'] || u['mediaId'] || 1),
      desktop_alt: String(u['title'] || 'Campus Gallery Showcase'),
      mobile_images: [{
        media_id: Number(u['mobile_media_id'] || u['mediaId'] || 1),
        alt: String(u['title'] || 'Campus Mobile View'),
        sort_order: 1,
      }],
      link_url: null,
    },
  };
}

export function buildParentsSaySection(
  parentsSay: Partial<ParentsSayConfig>,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'parents-say')?.active ?? true);
  const reviewsList =
    Array.isArray(parentsSay.reviews) && parentsSay.reviews.length > 0
      ? parentsSay.reviews
      : [{ id: 1, name: 'Priya Sharma', location: 'Verified Parent', review: 'The personalized guidance and modern teaching methods have significantly boosted my child confidence and academic results.', rating: 5, image: '' }];

  return {
    section_type: 'PARENTS_SAY',
    is_enabled: isEnabled,
    sort_order: 9,
    content: {
      heading: 'What Parents Say About Us',
      subheading: 'Real experiences and heartfelt stories from our parent community',
      testimonials: reviewsList.map((t, idx) => ({
        name: t.name || `Parent ${idx + 1}`,
        location: t.location || 'Verified Parent',
        quote: t.review || 'Outstanding academic environment and nurturing faculty.',
        rating: Number(t.rating || 5),
        avatar_media_id: (t as unknown as Record<string, unknown>)['mediaId']
          ? Number((t as unknown as Record<string, unknown>)['mediaId'])
          : null,
        avatar_alt: t.name || 'Parent Avatar',
        sort_order: idx + 1,
      })),
    },
  };
}

export function buildFacilitiesSection(
  facilities: Partial<FacilitiesConfig>,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'facilities')?.active ?? true);
  const facilityItems =
    Array.isArray(facilities.facilities) && facilities.facilities.length > 0
      ? facilities.facilities
      : [
          { id: 1, heading: 'Modern Science Labs', paragraph: 'State-of-the-art physics, chemistry, and biology laboratories.' },
          { id: 2, heading: 'Digital Smart Classrooms', paragraph: 'Equipped with interactive smart boards and high-speed digital connectivity.' },
        ];

  return {
    section_type: 'FACILITIES',
    is_enabled: isEnabled,
    sort_order: 10,
    content: {
      heading: facilities.sectionHeading || 'World-Class Campus Facilities',
      subheading: facilities.sectionSubHeading || 'Equipped with contemporary infrastructure to support comprehensive education',
      items: facilityItems.map((f, idx) => ({
        title: f.heading || `Facility ${idx + 1}`,
        description: f.paragraph || 'State of the art learning facility.',
        media_id: Number((f as unknown as Record<string, unknown>)['mediaId'] || 1),
        image_alt: f.heading || 'Facility Image',
        sort_order: idx + 1,
      })),
    },
  };
}
