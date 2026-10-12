import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageUploadComponent } from '../../shared/image-upload/image-upload.component';

export interface CourseListItem {
  id: number;
  text: string;
}

export interface CourseItem {
  id: number;

  image1: string;
  image2: string;

  heading: string;

  subHeading1: string;
  listItems1: CourseListItem[];

  subHeading2: string;
  listItems2: CourseListItem[];

  subHeading3: string;
  listItems3: CourseListItem[];

  subHeading4: string;
  listItems4: CourseListItem[];

  buttonText1: string;
  buttonUrl1: string;

  buttonText2: string;
  buttonUrl2: string;

  buttonText3: string;
  buttonUrl3: string;
}

export interface CourseConfig {
  sectionHeading: string;
  sectionSubHeading: string;
  courses: CourseItem[];
  isActive: boolean;
  desktopActive: boolean;
  mobileActive: boolean;
}

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [
    FormsModule,
    ImageUploadComponent,
  ],
  templateUrl: './course.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class CourseComponent {

  @Input() course: CourseConfig = {
    sectionHeading: 'Our Courses',

    sectionSubHeading:
      'Explore our courses and choose the right learning path.',

    courses: [
      {
        id: 1,

        image1: '',
        image2: '',

        heading: 'Course Heading',

        subHeading1: 'Course Highlights',
        listItems1: [
          {
            id: 1,
            text: '',
          },
        ],

        subHeading2: 'Eligibility',
        listItems2: [
          {
            id: 2,
            text: '',
          },
        ],

        subHeading3: 'Benefits',
        listItems3: [
          {
            id: 3,
            text: '',
          },
        ],

        subHeading4: 'Course Details',
        listItems4: [
          {
            id: 4,
            text: '',
          },
        ],

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

  @Output() courseChange =
    new EventEmitter<CourseConfig>();

  isSectionOpen = false;

  openCourseId: number | null = null;

  private nextCourseId = 2;

  private nextListItemId = 5;

  toggleSection(): void {
    this.isSectionOpen =
      !this.isSectionOpen;
  }

  toggleActive(): void {
    this.course.isActive =
      !this.course.isActive;

    this.emitChange();
  }

  toggleDesktop(): void {
    this.course.desktopActive =
      !this.course.desktopActive;

    this.emitChange();
  }

  toggleMobile(): void {
    this.course.mobileActive =
      !this.course.mobileActive;

    this.emitChange();
  }

  toggleCourse(courseId: number): void {
    this.openCourseId =
      this.openCourseId === courseId
        ? null
        : courseId;
  }

  isCourseOpen(courseId: number): boolean {
    return this.openCourseId === courseId;
  }

  addCourse(): void {
    const newCourse: CourseItem = {
      id: this.nextCourseId++,

      image1: '',
      image2: '',

      heading: '',

      subHeading1: '',
      listItems1: [],

      subHeading2: '',
      listItems2: [],

      subHeading3: '',
      listItems3: [],

      subHeading4: '',
      listItems4: [],

      buttonText1: '',
      buttonUrl1: '',

      buttonText2: '',
      buttonUrl2: '',

      buttonText3: '',
      buttonUrl3: '',
    };

    this.course.courses.push(newCourse);

    this.openCourseId = newCourse.id;

    this.emitChange();
  }

  removeCourse(courseId: number): void {
    this.course.courses =
      this.course.courses.filter(
        (courseItem) =>
          courseItem.id !== courseId
      );

    if (this.openCourseId === courseId) {
      this.openCourseId =
        this.course.courses[0]?.id ?? null;
    }

    this.emitChange();
  }

  onCourseImageChange(
    courseId: number,
    imageNumber: 1 | 2,
    image: string
  ): void {

    const courseItem =
      this.course.courses.find(
        (item) => item.id === courseId
      );

    if (!courseItem) {
      return;
    }

    if (imageNumber === 1) {
      courseItem.image1 = image;
    }

    if (imageNumber === 2) {
      courseItem.image2 = image;
    }

    this.emitChange();
  }

  addListItem(
    courseId: number,
    listNumber: 1 | 2 | 3 | 4
  ): void {

    const courseItem =
      this.course.courses.find(
        (item) => item.id === courseId
      );

    if (!courseItem) {
      return;
    }

    const newItem: CourseListItem = {
      id: this.nextListItemId++,
      text: '',
    };

    if (listNumber === 1) {
      courseItem.listItems1.push(newItem);
    }

    if (listNumber === 2) {
      courseItem.listItems2.push(newItem);
    }

    if (listNumber === 3) {
      courseItem.listItems3.push(newItem);
    }

    if (listNumber === 4) {
      courseItem.listItems4.push(newItem);
    }

    this.emitChange();
  }

  removeListItem(
    courseId: number,
    listNumber: 1 | 2 | 3 | 4,
    itemId: number
  ): void {

    const courseItem =
      this.course.courses.find(
        (item) => item.id === courseId
      );

    if (!courseItem) {
      return;
    }

    if (listNumber === 1) {
      courseItem.listItems1 =
        courseItem.listItems1.filter(
          (item) => item.id !== itemId
        );
    }

    if (listNumber === 2) {
      courseItem.listItems2 =
        courseItem.listItems2.filter(
          (item) => item.id !== itemId
        );
    }

    if (listNumber === 3) {
      courseItem.listItems3 =
        courseItem.listItems3.filter(
          (item) => item.id !== itemId
        );
    }

    if (listNumber === 4) {
      courseItem.listItems4 =
        courseItem.listItems4.filter(
          (item) => item.id !== itemId
        );
    }

    this.emitChange();
  }

  emitChange(): void {
    this.courseChange.emit({
      sectionHeading:
        this.course.sectionHeading,

      sectionSubHeading:
        this.course.sectionSubHeading,

      courses:
        this.course.courses.map(
          (courseItem) => ({
            ...courseItem,

            listItems1: [
              ...courseItem.listItems1,
            ],

            listItems2: [
              ...courseItem.listItems2,
            ],

            listItems3: [
              ...courseItem.listItems3,
            ],

            listItems4: [
              ...courseItem.listItems4,
            ],
          })
        ),

      isActive:
        this.course.isActive,

      desktopActive:
        this.course.desktopActive,

      mobileActive:
        this.course.mobileActive,
    });
  }
}