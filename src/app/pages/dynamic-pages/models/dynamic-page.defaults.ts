import {
  BannerConfig,
  DynamicPageConfiguration,
  LogoConfig,
  SectionConfig,
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
    heading: '',
    h1: '',
    subHeading: '',
    backgroundImage: '',
  };
}

export function getDefaultSections(): SectionConfig[] {
  return [
    {
      key: 'header',
      title: 'Header',
      description: 'Logo, navigation and header configuration',
      active: true,
    },
    {
      key: 'banner',
      title: 'Banner',
      description: 'Hero banner and primary page content',
      active: true,
    },
    {
      key: 'classes',
      title: 'Classes',
      description: 'Class and academic information',
      active: true,
    },
    {
      key: 'why-us',
      title: 'Why Us',
      description: 'Why students and parents choose us',
      active: true,
    },
    {
      key: 'course',
      title: 'Courses',
      description: 'Courses and learning programs',
      active: true,
    },
    {
      key: 'right-school',
      title: 'Right School',
      description: 'Information about choosing the right school',
      active: true,
    },
    {
      key: 'academic-results',
      title: 'Academic Results',
      description: 'Student academic performance and results',
      active: true,
    },
    {
      key: 'parents-say',
      title: 'Parents Say',
      description: 'Parent reviews and testimonials',
      active: true,
    },
    {
      key: 'image-section',
      title: 'Image Section',
      description: 'Desktop and mobile image configuration',
      active: true,
    },
    {
      key: 'facilities',
      title: 'Facilities',
      description: 'School facilities and infrastructure',
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
      title: 'Limited Seats',
      description: 'Limited seats promotion section',
      active: true,
    },
  ];
}

export function getDefaultWhyUs(): WhyUsConfig {
  return {
    sectionHeading: 'Why Choose Us',
    sectionSubHeading: 'Discover what makes us different',
    boxes: [
      {
        id: 1,
        image: '',
        heading: 'Experienced Faculty',
        paragraph:
          'Learn from experienced and dedicated educators who focus on every student.',
      },
    ],
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
}

/**
 * Returns a complete, fresh default DynamicPageConfiguration object
 */
export function getDefaultPageConfiguration(): DynamicPageConfiguration {
  return {
    logos: getDefaultLogos(),
    banner: getDefaultBanner(),
    sections: getDefaultSections(),
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
