import { SectionConfig } from '../dynamic-page.model';
import { FaqConfig } from '../../sections/faq/faq-section.component';
import { LimitedSeatsConfig } from '../../sections/limited-seats/limited-seats.component';
import { PageBuilderSection } from '../../../../services/dynamic-page.service';

export function buildFaqSection(
  faq: Partial<FaqConfig>,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'faq')?.active ?? true);
  const faqItems =
    Array.isArray(faq.faqs) && faq.faqs.length > 0
      ? faq.faqs
      : [
          { id: 1, question: 'What is the admission procedure?', answer: 'Admissions can be initiated online by submitting the enquiry form or visiting the campus directly.' },
          { id: 2, question: 'What curriculum is followed?', answer: 'We follow recognized standard curriculum boards integrated with competitive exam foundation training.' },
        ];

  return {
    section_type: 'FAQ',
    is_enabled: isEnabled,
    sort_order: 9,
    content: {
      heading: faq.sectionHeading || 'Frequently Asked Questions',
      items: faqItems.map((f, idx) => ({
        question: f.question || 'How do I apply?',
        answer: f.answer || 'Submit an enquiry or contact school admissions.',
        sort_order: idx + 1,
      })),
    },
  };
}

export function buildLimitedSeatsSection(
  limitedSeats: Partial<LimitedSeatsConfig>,
  sections: SectionConfig[],
): PageBuilderSection {
  const isEnabled = Boolean(sections.find((s) => s.key === 'limited-seats')?.active ?? true);
  const u = limitedSeats as unknown as Record<string, unknown>;

  const bgMediaId =
    limitedSeats.backgroundMediaId ??
    limitedSeats.background_media_id ??
    (u['background_media_id'] ? Number(u['background_media_id']) : null) ??
    (u['mediaId'] ? Number(u['mediaId']) : 1);

  const featMediaId =
    limitedSeats.mediaId ??
    limitedSeats.feature_media_id ??
    (u['feature_media_id'] ? Number(u['feature_media_id']) : null) ??
    (u['mediaId'] ? Number(u['mediaId']) : 1);

  const cards = Array.isArray(limitedSeats.cards) && limitedSeats.cards.length > 0
    ? limitedSeats.cards
    : [
        {
          id: 1,
          title: limitedSeats.schoolName || 'Narayana Schools',
          label: 'Pan India Campuses',
          value: limitedSeats.numberOfSchools || '300+',
          image: '',
          mediaId: 1,
        },
        {
          id: 2,
          title: 'Student Body',
          label: 'Enrolled Students',
          value: '100,000+',
          image: '',
          mediaId: 1,
        },
      ];

  return {
    section_type: 'LIMITED_SEATS',
    is_enabled: isEnabled,
    sort_order: 10,
    content: {
      background_media_id: Number(bgMediaId || 1),
      background_alt: 'Limited Seats Background',
      feature_media_id: Number(featMediaId || 1),
      feature_image_alt: 'Admissions Open Banner',
      availability_text: limitedSeats.subHeading || 'Secure your spot today!',
      urgency_text: limitedSeats.heading || 'Limited seats available for 2027-28 academic year.',
      brochure_cta: {
        label: limitedSeats.buttonText || 'Download Brochure',
        action: 'DOWNLOAD_BROCHURE',
        url: null,
      },
      form_title: 'Apply for Admission',
      form_enabled: true,
      default_form_intent: 'ENQUIRY',
      statistics: cards.map((card, idx) => ({
        logo_media_id: card.mediaId ? Number(card.mediaId) : 1,
        logo_alt: card.title || 'School Logo',
        title: card.title || (idx === 0 ? 'Narayana Schools' : 'Student Body'),
        label: card.label || (idx === 0 ? 'Pan India Campuses' : 'Enrolled Students'),
        value: card.value || (idx === 0 ? '300+' : '100,000+'),
        sort_order: idx + 1,
      })),
    },
  };
}
