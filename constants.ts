
import { User, UserRole, Course, StudentTermGrade, PaymentStatus, SchoolClass, ClassLevel } from './types';

// Helper for generating unique alphanumeric IDs
// export const generateUniqueAlphaNumericId = (prefix: string, existingIds: string[]): string => {
//   let id: string;
//   do {
//     id = `${prefix}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
//   } while (existingIds.includes(id));
//   return id;
// };

export const generateUniqueAlphaNumericId = (length: number = 10): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// Helper for generating random passwords
export const generateRandomPassword = (length = 8): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// --- Student ID Generation Logic ---
const CURRENT_ACADEMIC_YEAR = new Date().getFullYear(); // Use current year for ID generation

// Centralized initialization for student ID counters in localStorage
// This client-side counter is for initial student ID generation logic,
// but the backend will handle persistence and ensure global uniqueness.
const initializeStudentIdCounters = () => {
  if (!localStorage.getItem('NEXT_JSS_STUDENT_NUMBER')) {
    localStorage.setItem('NEXT_JSS_STUDENT_NUMBER', '1');
  }
  if (!localStorage.getItem('NEXT_SSS_STUDENT_NUMBER')) {
    localStorage.setItem('NEXT_SSS_STUDENT_NUMBER', '1');
  }
};
initializeStudentIdCounters(); // Call once at module load

const getNextStudentNumber = (prefix: 'JSS' | 'SSS'): number => {
  const key = `NEXT_${prefix}_STUDENT_NUMBER`;
  const storedNum = localStorage.getItem(key);
  let nextNum = storedNum ? parseInt(storedNum, 10) : 1;
  // Increment and store for the next call
  localStorage.setItem(key, String(nextNum + 1));
  return nextNum;
};

export const generateStudentId = (classLevelType: 'JSS' | 'SSS'): string => {
  const studentNum = getNextStudentNumber(classLevelType);
  const formattedNum = String(studentNum).padStart(3, '0'); // e.g., 001
  return `${classLevelType}/${formattedNum}/${CURRENT_ACADEMIC_YEAR}`;
};
// --- End Student ID Generation Logic ---

// Removed MOCK_USERS, MOCK_COURSES, MOCK_STUDENT_TERM_GRADES, MOCK_PAYMENTS from here.
// These are now handled and persisted by the backend database.

// These are still used for rendering select options and static displays
// and are considered configuration rather than dynamic data.
export const MOCK_CLASS_LEVELS: ClassLevel[] = [
  { id: 'jl001', name: 'JSS1', type: 'JSS', promotedToClassLevelId: 'jl002' },
  { id: 'jl002', name: 'JSS2', type: 'JSS', promotedToClassLevelId: 'jl003' },
  { id: 'jl003', name: 'JSS3', type: 'JSS', promotedToClassLevelId: 'sl001' },
  { id: 'sl001', name: 'SSS1', type: 'SSS', promotedToClassLevelId: 'sl002' },
  { id: 'sl002', name: 'SSS2', type: 'SSS', promotedToClassLevelId: 'sl003' },
  { id: 'sl003', name: 'SSS3', type: 'SSS' }, // No promotion beyond SSS3
];

export const MOCK_CLASSES: SchoolClass[] = [
  {
    id: 'cl001A', name: 'JSS1A', classLevelId: 'jl001',
    coreSubjects: ['c001', 'c002', 'c003', 'c005', 'c006', 'c007', 'c009', 'c010'],
    optionalSubjects: [
      { groupName: 'Languages', options: ['c004', 'c011', 'c012'], minSelection: 1, maxSelection: 1 },
      { groupName: 'Vocational', options: ['c008'], minSelection: 0, maxSelection: 1 },
    ],
  },
  {
    id: 'cl001B', name: 'JSS1B', classLevelId: 'jl001',
    coreSubjects: ['c001', 'c002', 'c003', 'c005', 'c006', 'c007', 'c009', 'c010'],
    optionalSubjects: [
      { groupName: 'Languages', options: ['c004', 'c011', 'c012'], minSelection: 1, maxSelection: 1 },
      { groupName: 'Vocational', options: ['c008'], minSelection: 0, maxSelection: 1 },
    ],
  },
  {
    id: 'cl001C', name: 'JSS1C', classLevelId: 'jl001',
    coreSubjects: ['c001', 'c002', 'c003', 'c005', 'c006', 'c007', 'c009', 'c010'],
    optionalSubjects: [
      { groupName: 'Languages', options: ['c004', 'c011', 'c012'], minSelection: 1, maxSelection: 1 },
      { groupName: 'Vocational', options: ['c008'], minSelection: 0, maxSelection: 1 },
    ],
  },
  {
    id: 'cl002A', name: 'JSS2A', classLevelId: 'jl002',
    coreSubjects: ['c001', 'c002', 'c003', 'c005', 'c006', 'c007', 'c009', 'c010'],
    optionalSubjects: [
      { groupName: 'Languages', options: ['c004', 'c011', 'c012'], minSelection: 1, maxSelection: 1 },
      { groupName: 'Vocational', options: ['c008'], minSelection: 0, maxSelection: 1 },
    ],
  },
  {
    id: 'cl003A', name: 'JSS3A', classLevelId: 'jl003',
    coreSubjects: ['c001', 'c002', 'c003', 'c005', 'c006', 'c007', 'c009', 'c010'],
    optionalSubjects: [
      { groupName: 'Languages', options: ['c004', 'c011', 'c012'], minSelection: 1, maxSelection: 1 },
      { groupName: 'Vocational', options: ['c008'], minSelection: 0, maxSelection: 1 },
    ],
  },
  {
    id: 'cl004A', name: 'SSS1A', classLevelId: 'sl001',
    coreSubjects: ['c001', 'c002', 'c003', 'c005', 'c006', 'c007', 'c009'], // Example core for SSS
    optionalSubjects: [
      { groupName: 'Science', options: ['c010'], minSelection: 0, maxSelection: 1 }, // Home Management as optional science
      { groupName: 'Languages', options: ['c004', 'c011', 'c012'], minSelection: 0, maxSelection: 1 },
    ],
  },
  // Add more classes (JSS2B, JSS2C, SSS1B, etc.) following the pattern
];


// Helper to get ordinal suffix for numbers.
export const getOrdinalSuffix = (num: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

/**
 * Helper to get letter grade and remark based on score (out of 100).
 * Matches the rubric from the OCR image.
 */
export const getGradeAndRemark = (score: number | undefined): { grade: string; remark: string } => {
  if (score === undefined || score === null) {
    return { grade: 'N/A', remark: 'No Score' };
  }
  if (score >= 70) return { grade: 'A', remark: 'Excellent Performance' };
  if (score >= 60) return { grade: 'B', remark: 'Very Good' };
  if (score >= 50) return { grade: 'C', remark: 'Good' };
  if (score >= 40) return { grade: 'D', remark: 'Pass' };
  return { grade: 'F', remark: 'Fail - Needs Improvement' };
};


export const APP_NAME = "COCIN Danbong";

// Mock school details for report card
export const MOCK_SCHOOL_DETAILS = {
  name: "COCIN DANBONG ACADEMIC HIGH SCHOOL",
  motto: "MOTTO: FAITH, EXCELLENCE AND SERVICE",
  address: "PAHWOL DANGWONG",
  logo: "/logo.png", // Assuming a logo.png in the public folder or root
  teacherName: "Mr/Mrs Joel Danladi", // As per OCR
  class: "JSS1C", // Default class for initial students (will be overridden by dynamic data)
  regNoPrefix: "", // No longer used as a prefix, ID is fully generated.
  session: "2020/2021"
}
