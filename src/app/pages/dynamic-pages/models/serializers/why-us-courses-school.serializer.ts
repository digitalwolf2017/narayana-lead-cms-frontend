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

  return {
    section_type: 'WHY_US',
    is_enabled: isEnabled,
    sort_order: 3,
    content: {
      heading: (whyUs.sectionHeading ?? '').trim(),
      highlight_word: (whyUs.highlightWord ?? '').trim(),
      heading_suffix: (whyUs.headingSuffix ?? '').trim(),
      subheading: (whyUs.sectionSubHeading ?? '').trim(),
      items: whyUsBoxes.map((b, idx) => ({
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

  return {
    section_type: 'COURSES',
    is_enabled: isEnabled,
    sort_order: 4,
    content: {
      heading: course.sectionHeading || 'Courses & Programs',
      programs: courseList.length > 0
        ? courseList.map((c, idx: number) => {
            const rawMedia1 = (c as unknown as Record<string, unknown>)['mediaId1'] ?? (c as unknown as Record<string, unknown>)['mediaId'];
            const primaryId = Number(rawMedia1);
            const desktopPrimaryMediaId = Number.isInteger(primaryId) && primaryId > 0 ? primaryId : 1;
            const rawMedia2 = (c as unknown as Record<string, unknown>)['mediaId2'];
            const secondaryId = Number(rawMedia2);
            const desktopSecondaryMediaId = Number.isInteger(secondaryId) && secondaryId > 0 ? secondaryId : null;

            return {
              code: `COURSE_${idx + 1}`,
              name: c.heading || `Course Program ${idx + 1}`,
              class_range: 'Grade 6 - 12',
              desktop_primary_media_id: desktopPrimaryMediaId,
              desktop_secondary_media_id: desktopSecondaryMediaId,
              mobile_media_id: null,
              image_alt: c.heading || 'Course Image',
              badge_icon_media_id: null,
              badge_icon_alt: 'Course Badge',
              feature_groups: [{
                icon_key: 'STAR',
                title: c.subHeading1 || 'Key Features',
                points: (Array.isArray(c.listItems1) && c.listItems1.length > 0
                  ? c.listItems1
                  : [{ id: 1, text: 'Specialized coaching' }]
                ).map((p: { text?: string }, pIdx: number) => ({
                  text: p.text || 'Comprehensive syllabus coverage',
                  sort_order: pIdx + 1,
                })),
                sort_order: 1,
              }],
              mobile_highlights: [
                { text: 'Comprehensive syllabus coverage', sort_order: 1 },
                { text: 'Mock test series and micro-analysis', sort_order: 2 },
              ],
              fees_cta: { label: 'Check Fees', action: 'FEES_STRUCTURE', url: null },
              brochure_cta: { label: 'Download Brochure', action: 'DOWNLOAD_BROCHURE', url: null },
              callback_cta: { label: 'Request Callback', action: 'CALLBACK', url: null },
              sort_order: idx + 1,
            };
          })
        : [{
            code: 'COURSE_1', name: 'Integrated Competitive Curriculum', class_range: 'Grade 6 - 12',
            desktop_primary_media_id: 1, desktop_secondary_media_id: null, mobile_media_id: null,
            image_alt: 'Integrated Curriculum', badge_icon_media_id: null, badge_icon_alt: 'Course Badge',
            feature_groups: [{ icon_key: 'STAR', title: 'Key Features', points: [{ text: 'Comprehensive syllabus coverage', sort_order: 1 }], sort_order: 1 }],
            mobile_highlights: [{ text: 'Comprehensive syllabus coverage', sort_order: 1 }],
            fees_cta: { label: 'Check Fees', action: 'FEES_STRUCTURE', url: null },
            brochure_cta: { label: 'Download Brochure', action: 'DOWNLOAD_BROCHURE', url: null },
            callback_cta: { label: 'Request Callback', action: 'CALLBACK', url: null },
            sort_order: 1,
          }],
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
      ? rightSchool.cards
      : [
          { id: 1, image: '', heading: 'Holistic Education', paragraph: 'Academic rigor balanced with sports, arts, and character building.' },
          { id: 2, image: '', heading: 'Proven Track Record', paragraph: 'Decades of consistent top ranks in competitive examinations nationwide.' },
        ];

  return {
    section_type: 'RIGHT_SCHOOL',
    is_enabled: isEnabled,
    sort_order: 6,
    content: {
      heading: rightSchool.sectionHeading || 'Choose The Right School',
      subheading: rightSchool.sectionSubHeading || 'Empowering every student with confidence, curiosity and knowledge',
      items: rightSchoolCards.map((p, idx: number) => ({
        icon_key: `ITEM_${idx + 1}`,
        title: p.heading || `Advantage ${idx + 1}`,
        description: p.paragraph || 'State of the art learning environment.',
        sort_order: idx + 1,
      })),
    },
  };
}
