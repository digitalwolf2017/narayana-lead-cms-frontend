import { PageBuilderSection } from '../../../services/dynamic-page.service';
import {
  BannerConfig,
  LogoConfig,
  SectionConfig,
  normalizeImageUrl,
} from './dynamic-page.model';
import { WhyUsConfig } from '../sections/why-us/why-us';
import { CourseConfig } from '../sections/course/course.component';
import { RightSchoolConfig } from '../sections/right-school/right-school.component';
import { AcademicResultsConfig } from '../sections/academic-results/academic-results.component';
import { ParentsSayConfig } from '../sections/parents-say/parents-say.component';
import { ImageSectionConfig } from '../sections/image-section/image-section.component';
import { FacilitiesConfig } from '../sections/facilities/facilities.component';
import { FaqConfig } from '../sections/faq/faq-section.component';
import { LimitedSeatsConfig } from '../sections/limited-seats/limited-seats.component';

export interface DeserializerTargetState {
  sections: SectionConfig[];
  logos: LogoConfig[];
  banner: BannerConfig;
  whyUs: WhyUsConfig;
  course: CourseConfig;
  rightSchool: RightSchoolConfig;
  academicResults: AcademicResultsConfig;
  parentsSay: ParentsSayConfig;
  imageSection: ImageSectionConfig;
  facilities: FacilitiesConfig;
  faq: FaqConfig;
  limitedSeatsConfig: LimitedSeatsConfig;
}

export type MediaDictionary = Record<string, { id?: number | string; public_url?: string; url?: string }>;

export function createMediaMap(rawMedia: unknown): MediaDictionary {
  const map: MediaDictionary = {};
  if (!rawMedia) return map;

  if (Array.isArray(rawMedia)) {
    for (const item of rawMedia) {
      if (item && item.id !== undefined && item.id !== null) {
        map[String(item.id)] = item;
      }
    }
  } else if (typeof rawMedia === 'object') {
    for (const [key, value] of Object.entries(rawMedia as Record<string, unknown>)) {
      if (value && typeof value === 'object') {
        const valObj = value as { id?: number | string; public_url?: string; url?: string };
        map[String(key)] = valObj;
        if (valObj.id !== undefined && valObj.id !== null) {
          map[String(valObj.id)] = valObj;
        }
      }
    }
  }
  return map;
}

function resolveMediaUrl(
  mediaId: unknown,
  mediaMap: MediaDictionary | undefined,
  fallbackUrl?: string,
): string {
  if (mediaId !== null && mediaId !== undefined && mediaMap) {
    const item = mediaMap[String(mediaId)];
    const resolved = item?.public_url || item?.url;
    if (resolved) {
      return normalizeImageUrl(resolved);
    }
  }
  return fallbackUrl ? normalizeImageUrl(fallbackUrl) : '';
}

/**
 * Deserializes backend PageBuilderSection[] into component UI configuration models
 */
export function populateSectionsFromBackend(
  backendSections: PageBuilderSection[],
  state: DeserializerTargetState,
  mediaInput?: unknown,
): void {
  const mediaMap = createMediaMap(mediaInput);

  for (const s of backendSections) {
    const type = (s.section_type || '').toUpperCase();
    const isEnabled = s.is_enabled ?? true;

    switch (type) {
      case 'HEADER': {
        const sec = state.sections.find((x) => x.key === 'header');
        if (sec) {
          sec.active = isEnabled;
        }

        const content = s.content as Record<string, unknown>;
        const logosData = content?.['logos'];

        if (Array.isArray(logosData)) {
          state.logos = logosData.map((item, idx) => {
            const logo = item as Record<string, unknown>;
            const rawMediaId = logo['media_id'] ?? logo['mediaId'];
            const parsedMediaId = Number(rawMediaId);
            const mediaObj = logo['media'] as Record<string, unknown> | undefined;

            const existing = state.logos.find(
              (l) =>
                (Number.isInteger(parsedMediaId) && parsedMediaId > 0 && l.mediaId === parsedMediaId) ||
                (logo['id'] !== undefined && l.id === Number(logo['id'])) ||
                (idx < state.logos.length && state.logos[idx].name === logo['name']),
            );

            const mediaUrl = resolveMediaUrl(rawMediaId, mediaMap);
            const rawUrl = String(
              mediaUrl ||
              logo['image_url'] ||
              logo['imageUrl'] ||
              logo['url'] ||
              logo['public_url'] ||
              logo['path'] ||
              mediaObj?.['url'] ||
              mediaObj?.['public_url'] ||
              mediaObj?.['path'] ||
              existing?.imageUrl ||
              '',
            ).trim();

            const resolvedUrl = normalizeImageUrl(rawUrl);

            return {
              id: Number(logo['id']) || idx + 1,
              name: String(logo['name'] || `Logo ${idx + 1}`),
              imageUrl: resolvedUrl,
              mediaId:
                rawMediaId !== null &&
                rawMediaId !== undefined &&
                Number.isInteger(parsedMediaId) &&
                parsedMediaId > 0
                  ? parsedMediaId
                  : (existing?.mediaId ?? null),
              desktopActive: Boolean(
                logo['show_desktop'] ?? logo['desktopActive'] ?? true,
              ),
              mobileActive: Boolean(
                logo['show_mobile'] ?? logo['mobileActive'] ?? true,
              ),
            };
          });
        }
        break;
      }

      case 'BANNER': {
        const sec = state.sections.find((x) => x.key === 'banner');
        if (sec) sec.active = isEnabled;
        const c = s.content as Record<string, unknown>;
        if (c) {
          if (c['heading']) state.banner.heading = String(c['heading']);
          if (c['heading']) state.banner.h1 = String(c['heading']);
          const bullets = c['bullets'];
          if (Array.isArray(bullets) && bullets[0]?.text) {
            state.banner.subHeading = String(bullets[0].text);
          }
          const desktopMediaId =
            c['desktop_background_media_id'] ??
            c['desktop_media_id'] ??
            c['media_id'] ??
            c['mediaId'];
          const bannerMediaUrl = resolveMediaUrl(desktopMediaId, mediaMap);
          const rawBg = String(
            bannerMediaUrl ||
            c['background_image_url'] ||
            c['backgroundImage'] ||
            c['desktop_background_url'] ||
            (c['desktop_media'] as Record<string, unknown>)?.['url'] ||
            state.banner.backgroundImage ||
            '',
          ).trim();
          if (rawBg) {
            state.banner.backgroundImage = normalizeImageUrl(rawBg);
          }
        }
        break;
      }

      case 'CLASSES': {
        const sec = state.sections.find((x) => x.key === 'classes');
        if (sec) sec.active = isEnabled;
        break;
      }

      case 'WHY_US': {
        const sec = state.sections.find((x) => x.key === 'why-us');
        if (sec) sec.active = isEnabled;
        const c = s.content as Record<string, unknown>;
        if (c) {
          if (c['heading']) state.whyUs.sectionHeading = String(c['heading']);
          if (c['subheading']) state.whyUs.sectionSubHeading = String(c['subheading']);
          const items = c['items'];
          if (Array.isArray(items) && items.length > 0) {
            state.whyUs.boxes = items.map((item: Record<string, unknown>, idx: number) => {
              const iconMediaId = item['icon_media_id'] ?? item['media_id'];
              const iconUrl = resolveMediaUrl(iconMediaId, mediaMap, String(item['image'] ?? ''));
              return {
                id: idx + 1,
                heading: String(item['title'] || ''),
                paragraph: String(item['description'] || ''),
                image: iconUrl,
                mediaId: Number(iconMediaId || 1),
              };
            });
          }
        }
        break;
      }

      case 'COURSES': {
        const sec = state.sections.find((x) => x.key === 'course');
        if (sec) sec.active = isEnabled;
        const c = s.content as Record<string, unknown>;
        if (c) {
          if (c['heading']) state.course.sectionHeading = String(c['heading']);
          const programs = c['programs'];
          if (Array.isArray(programs) && programs.length > 0) {
            state.course.courses = programs.map((p: Record<string, unknown>, idx: number) => {
              const fg = (p['feature_groups'] as Array<Record<string, unknown>>)?.[0];
              const points = (fg?.['points'] as Array<Record<string, unknown>>) || [];
              const courseMediaId = p['media_id'] ?? p['image_media_id'];
              const courseImg = resolveMediaUrl(courseMediaId, mediaMap, String(p['image'] ?? ''));
              return {
                id: idx + 1,
                heading: String(p['name'] || ''),
                subHeading1: String(fg?.['title'] || ''),
                subHeading2: '',
                subHeading3: '',
                subHeading4: '',
                image1: courseImg,
                image2: '',
                listItems1: points.map((pt, ptIdx) => ({
                  id: ptIdx + 1,
                  text: String(pt['text'] || ''),
                })),
                listItems2: [],
                listItems3: [],
                listItems4: [],
                buttonText1: '',
                buttonUrl1: '',
                buttonText2: '',
                buttonUrl2: '',
                buttonText3: '',
                buttonUrl3: '',
              };
            });
          }
        }
        break;
      }

      case 'RIGHT_SCHOOL': {
        const sec = state.sections.find((x) => x.key === 'right-school');
        if (sec) sec.active = isEnabled;
        const c = s.content as Record<string, unknown>;
        if (c) {
          if (c['heading']) state.rightSchool.sectionHeading = String(c['heading']);
          if (c['subheading']) state.rightSchool.sectionSubHeading = String(c['subheading']);
          const items = c['items'];
          if (Array.isArray(items) && items.length > 0) {
            state.rightSchool.cards = items.map((item: Record<string, unknown>, idx: number) => {
              const cardMediaId = item['media_id'] ?? item['image_media_id'];
              const cardImg = resolveMediaUrl(cardMediaId, mediaMap, String(item['image'] ?? ''));
              return {
                id: idx + 1,
                image: cardImg,
                heading: String(item['title'] || ''),
                paragraph: String(item['description'] || ''),
              };
            });
          }
        }
        break;
      }

      case 'ACADEMIC_RESULTS': {
        const sec = state.sections.find((x) => x.key === 'academic-results');
        if (sec) sec.active = isEnabled;
        const c = s.content as Record<string, unknown>;
        if (c) {
          if (c['heading']) state.academicResults.sectionHeading = String(c['heading']);
          if (c['subheading']) state.academicResults.sectionSubHeading = String(c['subheading']);
          const results = c['results'];
          if (Array.isArray(results) && results.length > 0) {
            state.academicResults.results = results.map((r: Record<string, unknown>, idx: number) => {
              const studentMediaId = r['student_photo_media_id'] ?? r['media_id'] ?? r['photo_media_id'];
              const studentImg = resolveMediaUrl(studentMediaId, mediaMap, String(r['image'] ?? ''));
              return {
                id: idx + 1,
                image: studentImg,
                studentName: String(r['student_name'] || ''),
                marks: String(r['score'] || ''),
                boardName: String(r['exam'] || 'CBSE'),
                buttonText: '',
                buttonUrl: '',
              };
            });
          }
        }
        break;
      }

      case 'IMAGE_SECTION': {
        const sec = state.sections.find((x) => x.key === 'image-section');
        if (sec) sec.active = isEnabled;
        break;
      }

      case 'PARENTS_SAY': {
        const sec = state.sections.find((x) => x.key === 'parents-say');
        if (sec) sec.active = isEnabled;
        const c = s.content as Record<string, unknown>;
        if (c) {
          const testimonials = c['testimonials'];
          if (Array.isArray(testimonials) && testimonials.length > 0) {
            state.parentsSay.reviews = testimonials.map((t: Record<string, unknown>, idx: number) => {
              const parentMediaId = t['parent_photo_media_id'] ?? t['media_id'] ?? t['photo_media_id'];
              const parentImg = resolveMediaUrl(parentMediaId, mediaMap, String(t['image'] ?? ''));
              return {
                id: idx + 1,
                name: String(t['name'] || ''),
                location: String(t['location'] || ''),
                review: String(t['quote'] || ''),
                rating: Number(t['rating'] || 5),
                image: parentImg,
              };
            });
          }
        }
        break;
      }

      case 'FACILITIES': {
        const sec = state.sections.find((x) => x.key === 'facilities');
        if (sec) sec.active = isEnabled;
        const c = s.content as Record<string, unknown>;
        if (c) {
          if (c['heading']) state.facilities.sectionHeading = String(c['heading']);
          if (c['subheading']) state.facilities.sectionSubHeading = String(c['subheading']);
          const items = c['items'];
          if (Array.isArray(items) && items.length > 0) {
            state.facilities.facilities = items.map((f: Record<string, unknown>, idx: number) => {
              const facMediaId = f['facility_photo_media_id'] ?? f['media_id'] ?? f['photo_media_id'];
              const facImg = resolveMediaUrl(facMediaId, mediaMap, String(f['image'] ?? ''));
              return {
                id: idx + 1,
                image: facImg,
                heading: String(f['title'] || ''),
                paragraph: String(f['description'] || ''),
              };
            });
          }
        }
        break;
      }

      case 'FAQ': {
        const sec = state.sections.find((x) => x.key === 'faq');
        if (sec) sec.active = isEnabled;
        const c = s.content as Record<string, unknown>;
        if (c) {
          if (c['heading']) state.faq.sectionHeading = String(c['heading']);
          const items = c['items'];
          if (Array.isArray(items) && items.length > 0) {
            state.faq.faqs = items.map((item: Record<string, unknown>, idx: number) => ({
              id: idx + 1,
              question: String(item['question'] || ''),
              answer: String(item['answer'] || ''),
            }));
          }
        }
        break;
      }

      case 'LIMITED_SEATS': {
        const sec = state.sections.find((x) => x.key === 'limited-seats');
        if (sec) sec.active = isEnabled;
        const c = s.content as Record<string, unknown>;
        if (c) {
          if (c['availability_text']) state.limitedSeatsConfig.subHeading = String(c['availability_text']);
          if (c['urgency_text']) state.limitedSeatsConfig.heading = String(c['urgency_text']);
        }
        break;
      }
    }
  }
}
