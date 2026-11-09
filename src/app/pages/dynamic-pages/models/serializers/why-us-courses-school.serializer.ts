import { SectionConfig } from '../dynamic-page.model';
import { WhyUsConfig } from '../../sections/why-us/why-us';
import { CourseConfig } from '../../sections/course/course.component';
import { RightSchoolConfig } from '../../sections/right-school/right-school.component';
import { PageBuilderSection } from '../../../../services/dynamic-page.service';

export function buildWhyUsSection(
  whyUs: Partial<WhyUsConfig>,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'why-us')?.active ?? true);
  const whyUsBoxes = Array.isArray(whyUs.boxes) ? whyUs.boxes : [];
  const fullHeading = [whyUs.sectionHeading, whyUs.highlightWord, whyUs.headingSuffix]
    .filter((part): part is string => Boolean(part && String(part).trim().length > 0))
    .join(' ')
    .trim();

  return {
    section_type: 'WHY_US',
    is_enabled: isEnabled,
    sort_order: 3,
    content: {
      heading: fullHeading || (whyUs.sectionHeading ?? '').trim() || 'Why Choose Narayana',
      subheading: (whyUs.sectionSubHeading ?? '').trim() || 'A system built for consistency, discipline, and results.',
      items: whyUsBoxes
        .filter((b) => (b.heading || b.paragraph || '').trim().length > 0)
        .map((b, idx) => ({
          title: (b.heading ?? '').trim(),
          description: (b.paragraph ?? '').trim(),
          icon_media_id: b.mediaId !== undefined && b.mediaId !== null ? Number(b.mediaId) : null,
          icon_alt: (b.heading ?? '').trim(),
          sort_order: idx + 1,
        })),
    },
  };
}

export function buildCoursesSection(
  course: Partial<CourseConfig>,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'course')?.active ?? true);
  const courseList = Array.isArray(course.courses) && course.courses.length > 0 ? course.courses : [];

  const programs = courseList
    .filter((c) => (c.heading || '').trim().length > 0)
    .map((c, idx: number) => {
      const rawMedia1 = (c as unknown as Record<string, unknown>)['mediaId1'] ?? (c as unknown as Record<string, unknown>)['mediaId'];
      const primaryId = Number(rawMedia1);
      const desktopPrimaryMediaId = Number.isInteger(primaryId) && primaryId > 0 ? primaryId : null;
      const rawMedia2 = (c as unknown as Record<string, unknown>)['mediaId2'];
      const secondaryId = Number(rawMedia2);
      const desktopSecondaryMediaId = Number.isInteger(secondaryId) && secondaryId > 0 ? secondaryId : null;

      const points = (Array.isArray(c.listItems1) && c.listItems1.length > 0
        ? c.listItems1
        : []
      )
        .filter((p: { text?: string }) => (p.text || '').trim().length > 0)
        .map((p: { text?: string }, pIdx: number) => ({
          text: p.text!.trim(),
          sort_order: pIdx + 1,
        }));

      return {
        code: `COURSE_${idx + 1}`,
        name: (c.heading || `Course Program ${idx + 1}`).trim(),
        class_range: (c.subHeading1 || '').trim(),
        desktop_primary_media_id: desktopPrimaryMediaId,
        desktop_secondary_media_id: desktopSecondaryMediaId,
        mobile_media_id: null,
        image_alt: c.heading || 'Course Image',
        badge_icon_media_id: null,
        badge_icon_alt: 'Course Badge',
        feature_groups: points.length > 0 ? [{
          icon_key: 'STAR',
          title: (c.subHeading1 || 'Key Features').trim(),
          points,
          sort_order: 1,
        }] : [],
        mobile_highlights: points.slice(0, 2),
        fees_cta: { label: c.buttonText1 || 'Check Fees', action: 'FEES_STRUCTURE', url: c.buttonUrl1 || null },
        brochure_cta: { label: c.buttonText2 || 'Download Brochure', action: 'DOWNLOAD_BROCHURE', url: c.buttonUrl2 || null },
        callback_cta: { label: 'Request Callback', action: 'CALLBACK', url: null },
        sort_order: idx + 1,
      };
    });

  return {
    section_type: 'COURSES',
    is_enabled: isEnabled,
    sort_order: 4,
    content: {
      heading: (course.sectionHeading || '').trim() || 'Courses & Programs',
      programs,
    },
  };
}

export function buildRightSchoolSection(
  rightSchool: Partial<RightSchoolConfig>,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'right-school')?.active ?? true);
  const rightSchoolCards =
    Array.isArray(rightSchool.cards) && rightSchool.cards.length > 0
      ? rightSchool.cards.filter((c) => (c.heading || c.paragraph || '').trim().length > 0)
      : [];

  return {
    section_type: 'RIGHT_SCHOOL',
    is_enabled: isEnabled,
    sort_order: 6,
    content: {
      heading: (rightSchool.sectionHeading || '').trim() || 'Choose The Right School',
      subheading: (rightSchool.sectionSubHeading || '').trim() || 'Empowering every student with confidence, curiosity and knowledge',
      items: rightSchoolCards.map((p, idx: number) => ({
        icon_key: `ITEM_${idx + 1}`,
        title: (p.heading || '').trim(),
        description: (p.paragraph || '').trim(),
        sort_order: idx + 1,
      })),
    },
  };
}
