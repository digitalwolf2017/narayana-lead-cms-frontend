import {
  BannerConfig,
  DynamicPageConfiguration,
  LogoConfig,
  SectionConfig,
} from './dynamic-page.model';
import { ClassesConfig } from '../sections/classes/classes.component';
import { WhyUsConfig } from '../sections/why-us/why-us';
import { CourseConfig } from '../sections/course/course.component';
import { RightSchoolConfig } from '../sections/right-school/right-school.component';
import { AcademicResultsConfig } from '../sections/academic-results/academic-results.component';
import { ParentsSayConfig } from '../sections/parents-say/parents-say.component';
import { ImageSectionConfig } from '../sections/image-section/image-section.component';
import { FacilitiesConfig } from '../sections/facilities/facilities.component';
import { FaqConfig } from '../sections/faq/faq-section.component';
import { LimitedSeatsConfig } from '../sections/limited-seats/limited-seats.component';

export function getDefaultLogos(): LogoConfig[] {
  return [
    {
      id: 1,
      name: 'Main Logo',
      imageUrl: '',
      desktopActive: true,
      mobileActive: true,
    },
  ];
}

export function getDefaultBanner(): BannerConfig {
  return {
    heading: 'Welcome to Narayana Schools',
    h1: 'Welcome to Narayana Schools',
    subHeading: 'Empowering Education Since 1977',
    backgroundImage: '',
    bullets: [
      {
        id: 1,
        text: 'Technologically driven stress-free curriculum',
        show_desktop: true,
        show_mobile: true,
        sort_order: 1,
      },
      {
        id: 2,
        text: "Asia's one of the largest educational conglomerates",
        show_desktop: true,
        show_mobile: true,
        sort_order: 2,
      },
      {
        id: 3,
        text: 'Learning that leads to careers, not just certificates',
        show_desktop: true,
        show_mobile: true,
        sort_order: 3,
      },
    ],
    stats: [
      { id: 1, value: '900+', label: 'Campus' },
      { id: 2, value: '250+', label: 'Cities' },
      { id: 3, value: '47+', label: 'Legacy' },
      { id: 4, value: '600000+', label: 'Learners All Over India' },
    ],
    buttonText: 'Get Admission Fees Details',
    buttonUrl: '',
    desktopActive: true,
    mobileActive: true,
  };
}

export function getDefaultSections(): SectionConfig[] {
  return [
    {
      key: 'banner',
      title: 'Hero',
      description: 'Hero banner and primary page content',
      active: true,
    },
    {
      key: 'classes',
      title: 'What Your Child Will Learn',
      description: 'Class programs and learning outcomes',
      active: true,
    },
    {
      key: 'why-us',
      title: 'Why Parents Choose Narayana',
      description: 'Core benefits and reasons parents choose us',
      active: true,
    },
    {
      key: 'course',
      title: 'Classes',
      description: 'Curriculum breakdown and learning stages',
      active: true,
    },
    {
      key: 'facilities',
      title: 'Campus & Facilities',
      description: 'World-class campus infrastructure and facilities',
      active: true,
    },
    {
      key: 'right-school',
      title: 'Is Narayana the Right School for Your Child?',
      description: 'Key institutional advantages and checklist',
      active: true,
    },
    {
      key: 'academic-results',
      title: 'Academic Results',
      description: 'Student academic performance and top ranks',
      active: true,
    },
    {
      key: 'parents-say',
      title: 'What Parents Say',
      description: 'Parent reviews and testimonials',
      active: true,
    },
    {
      key: 'faq',
      title: 'FAQ',
      description: 'Frequently asked questions',
      active: true,
    },
    {
      key: 'limited-seats',
      title: 'CTA (Admissions Open)',
      description: 'Limited seats call to action and application form',
      active: true,
    },
  ];
}

export function getDefaultWhyUs(): WhyUsConfig {
  return {
    sectionHeading: '',
    highlightWord: '',
    headingSuffix: '',
    sectionSubHeading: '',
    boxes: [],
    isActive: true,
    desktopActive: true,
    mobileActive: true,
  };
}

export function getDefaultCourse(): CourseConfig {
  return {
    sectionHeading: 'Courses',
    sectionSubHeading: 'Explore our courses and choose the right learning path.',
    courses: [
      {
        id: 1,
        image1: '',
        image2: '',
        heading: '',
        subHeading1: '',
        listItems1: [{ id: 1, text: '' }],
        subHeading2: '',
        listItems2: [{ id: 2, text: '' }],
        subHeading3: '',
        listItems3: [{ id: 3, text: '' }],
        subHeading4: '',
        listItems4: [{ id: 4, text: '' }],
        buttonText1: '',
        buttonUrl1: '',
        buttonText2: '',
        buttonUrl2: '',
        buttonText3: '',
        buttonUrl3: '',
      },
    ],
    isActive: true,
    desktopActive: true,
    mobileActive: true,
  };
}

export function getDefaultRightSchool(): RightSchoolConfig {
  return {
    sectionHeading: 'Right School',
    sectionSubHeading: 'Choose the right school for your child.',
    cards: [
      {
        id: 1,
        image: '',
        heading: '',
        paragraph: '',
      },
    ],
    isActive: true,
    desktopActive: true,
    mobileActive: true,
  };
}

export function getDefaultAcademicResults(): AcademicResultsConfig {
  return {
    sectionHeading: '',
    sectionSubHeading: '',
    results: [
      {
        id: 1,
        image: '',
        studentName: '',
        marks: '',
        boardName: '',
        buttonText: '',
        buttonUrl: '',
      },
    ],
    isActive: true,
    desktopActive: true,
    mobileActive: true,
  };
}

export function getDefaultParentsSay(): ParentsSayConfig {
  return {
    reviews: [
      {
        id: 1,
        image: '',
        name: '',
        location: '',
        review: '',
        rating: 5,
      },
    ],
    isActive: true,
    desktopActive: true,
    mobileActive: true,
  };
}

export function getDefaultImageSection(): ImageSectionConfig {
  return {
    desktopImage: '',
    mobileImage: '',
    isActive: true,
    desktopActive: true,
    mobileActive: true,
  };
}

export function getDefaultFacilities(): FacilitiesConfig {
  return {
    sectionHeading: 'Our Facilities',
    sectionSubHeading:
      'Explore the facilities designed to provide students with a comfortable and enriching environment.',
    facilities: [
      {
        id: 1,
        image: '',
        heading: 'Smart Classrooms',
        paragraph:
          'Modern classrooms equipped with technology to create an engaging and interactive learning environment.',
      },
    ],
    isActive: true,
    desktopActive: true,
    mobileActive: true,
  };
}

export function getDefaultFaq(): FaqConfig {
  return {
    sectionHeading: 'Frequently Asked Questions',
    sectionSubHeading: 'Find answers to commonly asked questions',
    faqs: [
      {
        id: 1,
        question: 'What is the admission process?',
        answer:
          'Please contact our admission team to know more about the admission process.',
      },
    ],
    isActive: true,
    desktopActive: true,
    mobileActive: true,
  };
}

export function getDefaultLimitedSeats(): LimitedSeatsConfig {
  return {
    backgroundImage: '',
    backgroundMediaId: null,
    background_media_id: null,
    image: '',
    mediaId: null,
    feature_media_id: null,
    heading: 'Limited seats available for 2027-28 academic year.',
    subHeading: 'Secure your spot today!',
    buttonText: 'Download Brochure',
    cards: [
      {
        id: 1,
        title: 'Narayana Schools',
        label: 'Pan India Campuses',
        value: '300+',
        image: '',
        mediaId: null,
      },
      {
        id: 2,
        title: 'Student Body',
        label: 'Enrolled Students',
        value: '100,000+',
        image: '',
        mediaId: null,
      },
    ],
    logos: [],
    schoolName: 'Narayana Schools',
    numberOfSchools: '300+',
    isActive: true,
    desktopActive: true,
    mobileActive: true,
  };
}

export function getDefaultClasses(): ClassesConfig {
  return {
    sectionHeading: 'What Your Child Will Learn',
    sectionSubHeading: 'Comprehensive Curriculum from Pre-Primary to Higher Secondary',
    cards: [
      {
        id: 1,
        image: '',
        mediaId: 1,
        heading: 'Pre-Primary',
        subHeading: 'Nursery to UKG',
        h3Heading: 'Foundational learning with interactive pedagogical methods.',
        listItems: [
          { id: 1, text: 'Activity-based learning' },
          { id: 2, text: 'Personalized attention' },
        ],
        button1Text: 'Fee Structure',
        button1Url: '',
        button2Text: 'Download Brochure',
        button2Url: '',
      },
      {
        id: 2,
        image: '',
        mediaId: 1,
        heading: 'Primary School',
        subHeading: 'Grade 1 to 5',
        h3Heading: 'Concept-oriented foundation with joyful learning atmosphere.',
        listItems: [
          { id: 1, text: 'Interactive digital classrooms' },
          { id: 2, text: 'Science and math foundation' },
        ],
        button1Text: 'Fee Structure',
        button1Url: '',
        button2Text: 'Download Brochure',
        button2Url: '',
      },
      {
        id: 3,
        image: '',
        mediaId: 1,
        heading: 'High School',
        subHeading: 'Grade 6 to 10',
        h3Heading: 'Competitive exam orientation alongside board exam excellence.',
        listItems: [
          { id: 1, text: 'Olympiad & competitive preparation' },
          { id: 2, text: 'Rigorous assessment modules' },
        ],
        button1Text: 'Fee Structure',
        button1Url: '',
        button2Text: 'Download Brochure',
        button2Url: '',
      },
    ],
    isActive: true,
    desktopActive: true,
    mobileActive: true,
  };
}

/**
 * Returns a complete, fresh default DynamicPageConfiguration object
 */
export function getDefaultPageConfiguration(): DynamicPageConfiguration {
  return {
    logos: getDefaultLogos(),
    banner: getDefaultBanner(),
    sections: getDefaultSections(),
    classesConfig: getDefaultClasses(),
    whyUs: getDefaultWhyUs(),
    course: getDefaultCourse(),
    rightSchool: getDefaultRightSchool(),
    academicResults: getDefaultAcademicResults(),
    parentsSay: getDefaultParentsSay(),
    imageSection: getDefaultImageSection(),
    facilities: getDefaultFacilities(),
    faq: getDefaultFaq(),
    limitedSeatsConfig: getDefaultLimitedSeats(),
  };
}
