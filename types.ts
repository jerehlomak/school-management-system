
export enum UserRole {
  Student = 'student',
  Teacher = 'teacher',
  Parent = 'parent',
  Admin = 'admin',
}

export enum ClassLevelEnum {
  JSS1 = 'JSS1',
  JSS2 = 'JSS2',
  JSS3 = 'JSS3',
  SSS1 = 'SSS1',
  SSS2 = 'SSS2',
  SSS3 = 'SSS3',
}

export interface User {
  id: string;
  username: string;
  password?: string; // Should not be sent from backend, but for mock login/admin display.
  name: string;
  role: UserRole;

  email: string;
  phoneNumber?: string; // New: For parents and teachers, also used for student passwords
  profileImage?: string; // URL to profile image
  parentId?: string; // For students, links to parent
  studentIds?: string[]; // For parents, links to students
  classId?: string; // For students, link to their segmented class (e.g., 'JSS1A')
  subjectsEnrolled?: string[]; // For students, list of course IDs they are taking
  subjectsTaught?: string[]; // For teachers, list of course IDs they teach
  classLevelsTaught?: string[]; // For teachers, list of ClassLevel IDs they are associated with (e.g., 'JSS1', 'SSS2')
  admissionYear?: number; // New: For students
}

export interface Course {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  students: string[]; // Student IDs enrolled
}

export interface AddCoursePayload {
  id: string;
  name: string;
  code: string;
  description?: string;
  classLevelId?: string;
}


// New interface for general school year levels (e.g., JSS1, JSS2, SSS1)
export interface ClassLevel {
  id: string;
  name: string; // e.g., "JSS1", "SSS2"
  type: 'JSS' | 'SSS';
  promotedToClassLevelId?: string; // E.g., 'JSS1' -> 'JSS2'
}

export interface SchoolClass {
  id: string;
  name: string; // e.g., JSS1A, JSS2B
  classLevelId: string; // Reference to ClassLevel
  classTeacherId?: string;
  studentsIds: string[];
  capacity: number;
  coreSubjects?: string[]; // Array of Course IDs for core subjects
  optionalSubjects?: { groupName: string; options: string[]; minSelection?: number; maxSelection?: number }[]; // Array of optional subject groups
}

export interface AddClassPayload {
  id: string;
  name: string;
  classLevelId: string;
  capacity: number;
}

export interface AddClassLevelPayload {
  id: string;
  name: ClassLevelEnum;
  type: "JSS" | "SSS";
}

// New interface for detailed term-based student grades
export interface StudentTermGrade {
  id: string; // Unique ID for this specific term's grade record
  studentId: string;
  courseId: string;
  term: 1 | 2 | 3;
  year: number; // For simplicity, let's assume current year
  assignment1?: number; // Score out of 10 (max)
  assignment2?: number; // Score out of 10 (max)
  test1?: number; // Score out of 20 (max)
  test2?: number; // Score out of 20 (max)
  exam?: number; // Score out of 40 (max)
  totalScore?: number; // Calculated field: sum of weighted scores (out of 100)
  termAverage?: number; // Calculated field: same as totalScore if total max is 100
  termPosition?: string; // Calculated field: e.g., "1st of 30"
  cumulativeAverage?: number; // Calculated for Term 3 only: (Term1_Avg + Term2_Avg + Term3_Avg) / 3
  promotionStatus?: 'Promoted' | 'Not Promoted' | 'N/A'; // For Term 3
  promotedToClass?: string; // For Term 3, e.g., "JSS2C"
  updatedAt: string; // Timestamp of last update
}

export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
}

export interface FeePayment {
  id: string;
  studentId: string;
  amount: number;
  description: string;
  term: number; // Added term
  year: number; // Added year
  date: string;
  status: PaymentStatus;
  rrr?: string;
  paymentLink?: string;
  studentName?: string; // Optional: Enriched in frontend or joined in backend
  classId?: string; // Optional: Enriched
  paymentReference?: string;
}

export interface RRRInfo {
  rrr: string;
  paymentLink: string;
  amount: number;
}

// Pagination types for API responses
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface Application {
  id: string; // Mongoose _id
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  grade: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  prevSchool?: string;
  medicalInfo?: string;
  passportUrl?: string; // URL to uploaded image
  documentUrls?: string[]; // URLs to uploaded documents
  status: 'Pending' | 'Approved' | 'Rejected';
  submissionDate: string;
}

export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  author: string;
  image?: string;
  category: string;
  date: string;
  tags?: string[];
}

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  createdAt: string;
}

export interface GalleryItem {
  _id: string;
  title?: string;
  category: string;
  imageUrl: string;
  date: string;
}

export interface TestimonialItem {
  _id: string;
  name: string;
  role: string;
  text: string;
  image?: string;
  createdAt: string;
}

export interface TimetableEntry {
  day: string; // "Monday", "Tuesday", etc.
  period: number; // 1, 2, 3...
  startTime: string; // "08:00"
  endTime: string; // "08:40"
  subjectId: string;
  teacherId: string;
  roomId?: string;
  type: 'Lesson' | 'Break';
}

export interface Timetable {
  _id: string;
  classId: string;
  term: number;
  year: number;
  entries: TimetableEntry[];
  createdAt: string;
}

