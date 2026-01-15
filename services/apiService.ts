
import { User, Course, StudentTermGrade, FeePayment, RRRInfo, PaymentStatus, UserRole, SchoolClass, ClassLevel, AddClassPayload, AddCoursePayload, AddClassLevelPayload } from '../types';
import { generateUniqueAlphaNumericId, generateRandomPassword, generateStudentId } from '../constants'; // Keep utilities

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // Your backend API base URL

// Helper for API calls
const apiCall = async (endpoint: string, method: string, data?: any) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    method,
    headers,
  };

  const token = localStorage.getItem('token');
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  if (response.status === 204) { // No Content
    return null;
  }

  return response.json();
};



/**
 * Uploads an image file to the backend and returns the URL.
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    // Note: Do not set Content-Type header manually; fetch does it for FormData
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return data.url;
};

/**
 * Simulates fetching user data from a backend.
 * Allows login using username, student ID, or phone number (for teachers/parents).
 */
export const fetchUser = async (identifier: string, password: string): Promise<User | null> => {
  try {
    const response = await apiCall('/auth/login', 'POST', { identifier, password });
    if (response && response.token) {
      localStorage.setItem('token', response.token);
      return response.user;
    }
    return response; // Fallback if backend structure differs, though logic suggests we need {token, user}
  } catch (error) {
    console.error('Login API error:', error);
    throw error; // Re-throw to be handled by the UI
  }
};

/**
 * Simulates fetching courses.
 */
export const fetchCourses = async (): Promise<Course[]> => {
  return apiCall('/courses', 'GET');
};

/**
 * Simulates adding a new course.
 */
export const addCourse = async (newCourse: AddCoursePayload): Promise<Course> => {
  return apiCall('/courses', 'POST', newCourse);
};


/**
 * Simulates fetching available segmented classes (e.g., JSS1A).
 */
export const fetchClasses = async (): Promise<SchoolClass[]> => {
  return apiCall('/classes', 'GET');
};

/**
 * Simulates updating an existing school class.
 */
export const updateClass = async (updatedClass: SchoolClass): Promise<SchoolClass> => {
  return apiCall(`/classes/${encodeURIComponent(updatedClass.id)}`, 'PUT', updatedClass);
};

/**
 * Simulates adding a new school class.
 */
export const addClass = async (newClass: AddClassPayload): Promise<SchoolClass> => {
  return apiCall('/classes', 'POST', newClass);
};


/**
 * Simulates fetching available class levels (e.g., JSS1).
 */
export const fetchClassLevels = async (): Promise<ClassLevel[]> => {
  return apiCall('/class-levels', 'GET');
};

export const addClassLevel = async (newClassLevel: AddClassLevelPayload): Promise<ClassLevel> => {
  return apiCall('/class-levels', 'POST', newClassLevel);
};


/**
 * Simulates fetching detailed term grades for a specific student.
 */
export const fetchStudentTermGrades = async (studentId: string, courseId?: string, term?: number, year?: number): Promise<StudentTermGrade[]> => {
  const queryParams = new URLSearchParams();
  console.log('studentId', studentId);
  console.log('courseId', courseId);
  console.log('term', term);
  console.log('year', year);
  if (courseId) queryParams.append('courseId', courseId);
  if (term) queryParams.append('term', term.toString());
  if (year) queryParams.append('year', year.toString());

  return apiCall(`/grades/student/${encodeURIComponent(studentId)}?${queryParams.toString()}`, 'GET');
};

/**
 * Simulates fetching all term grades for courses taught by a teacher.
 */
export const fetchTeacherTermGrades = async (teacherId: string, courseId?: string, term?: number, year?: number): Promise<StudentTermGrade[]> => {
  const queryParams = new URLSearchParams();
  if (courseId) queryParams.append('courseId', courseId);
  if (term) queryParams.append('term', term.toString());
  if (year) queryParams.append('year', year.toString());

  return apiCall(`/grades/teacher/${encodeURIComponent(teacherId)}?${queryParams.toString()}`, 'GET');
};

/**
 * Simulates saving or updating a student's term grades.
 */
export const saveStudentTermGrade = async (grade: StudentTermGrade): Promise<StudentTermGrade> => {
  // The backend will handle creating a new ID or updating an existing one.
  return apiCall('/grades/save', 'POST', grade);
};


/**
 * Simulates calculating positions for students in a course for a specific term.
 * This now triggers a backend calculation.
 */
export const calculateCoursePositions = async (courseId: string, term: 1 | 2 | 3, year: number): Promise<StudentTermGrade[]> => {
  console.log('courseId', courseId);
  console.log('term', term);
  console.log('year', year);
  return apiCall('/grades/calculate-positions', 'POST', { courseId, term, year });
};

/**
 * Simulates fetching payments for a specific student.
 */
export const fetchStudentPayments = async (studentId: string): Promise<FeePayment[]> => {
  return apiCall(`/fees/history/${encodeURIComponent(studentId)}`, 'GET');
};

export const payFees = async (data: { studentId: string, term: number, year: number, amount: number, description: string }) => {
  return apiCall('/fees/pay', 'POST', data);
};

export const fetchRecentPayments = async (): Promise<FeePayment[]> => {
  return apiCall('/fees/recent', 'GET');
};

/**
 * Simulates generating a Remita RRR. This now calls the backend.
 */
export const generateRemitaRRR = async (studentId: string, amount: number, description: string, term?: number, year?: number, items?: any[], isPartPayment?: boolean): Promise<RRRInfo> => {
  return apiCall('/fees/generate-rrr', 'POST', { studentId, amount, description, term, year, items, isPartPayment });
};



/**
 * Save fee structure for a class level and term.
 */
export const saveFeeStructure = async (data: { classLevelId: string, term: number, itemGroups: any[] }): Promise<any> => {
  return apiCall('/fees/structure', 'POST', data);
};

export const fetchFeeStructure = async (classId: string, term: number): Promise<any> => {
  return apiCall(`/fees/structure/${classId}/${term}`, 'GET');
};

export const fetchPaymentStatus = async (studentId: string, term: number, year: number): Promise<{ paid: boolean, message?: string }> => {
  // This endpoint should verify if compulsory fees are fully paid
  // Ideally backend should have a specific endpoint or we infer from fees history
  // For now, let's assume we use the existing check logic or a new endpoint.
  // Let's implement a specific endpoint in backend for this check to be secure/robust.
  // Or we can simple check if they have a "Completed" payment for the term that covers the total.

  // Quick fix: reuse fetchFeesHistory and check locally? No, better to have backend logic.
  // Let's call a new endpoint check-status
  return apiCall(`/fees/status?studentId=${studentId}&term=${term}&year=${year}`, 'GET');
};

/**
 * Update a payment status (e.g., Confirm a Pending payment).
 */
export const updatePaymentStatus = async (paymentId: string, status: PaymentStatus, rrr?: string): Promise<FeePayment | null> => {
  return apiCall(`/fees/${encodeURIComponent(paymentId)}/status`, 'PUT', { status, rrr });
};

/**
 * Fetch all payments with optional filters.
 */
export const fetchAllPayments = async (filters?: { studentName?: string, classId?: string, startDate?: string, endDate?: string, status?: string }): Promise<FeePayment[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.studentName) queryParams.append('studentName', filters.studentName);
  if (filters?.classId) queryParams.append('classId', filters.classId);
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);
  if (filters?.status) queryParams.append('status', filters.status);

  return apiCall(`/fees/all?${queryParams.toString()}`, 'GET');
};

/**
 * Simulates adding a new payment record.
 */
export const addPayment = async (newPayment: Omit<FeePayment, 'id'>): Promise<FeePayment> => {
  return apiCall('/payments/add', 'POST', newPayment);
};

/**
 * Simulates fetching all users (for admin). Passwords are only exposed if `includePasswords` is true.
 */
export const fetchAllUsers = async (includePasswords: boolean = false, page: number = 1, limit: number = 20, filters?: { classId?: string, subjectId?: string, role?: string }): Promise<{ data: User[], pagination: any }> => {
  const queryParams = new URLSearchParams({
    includePasswords: String(includePasswords),
    page: String(page),
    limit: String(limit)
  });
  if (filters?.classId) queryParams.append('classId', filters.classId);
  if (filters?.subjectId) queryParams.append('subjectId', filters.subjectId);
  if (filters?.role) queryParams.append('role', filters.role);

  return apiCall(`/users?${queryParams.toString()}`, 'GET');
};

/**
 * Helper function to update a single user in the mock array and persist.
 * Now makes a backend API call.
 */
export const updateUser = async (updatedUser: User): Promise<User> => {
  return apiCall(`/users/${encodeURIComponent(updatedUser.id)}`, 'PUT', updatedUser);
};

/**
 * Simulates fetching all students who do not have a parentId.
 */
export const fetchStudentsWithoutParents = async (): Promise<User[]> => {
  return apiCall('/users/students-without-parents', 'GET');
};

/**
 * Simulates registering a new student.
 */
export const registerStudent = async (
  studentName: string,
  email: string,
  classId: string,
  subjectsEnrolled: string[],
  admissionYear: number,

  parentId: string,
  profileImage?: string,
): Promise<{ user: User; password: string }> => {
  // The backend will handle student ID generation, password setting (from parent's phone),
  // and linking the student's phone number.
  return apiCall('/users/register-student', 'POST', {
    studentName,
    email,
    classId,
    subjectsEnrolled,
    admissionYear,
    parentId,
    profileImage,
  });
};

/**
 * Simulates registering a new teacher.
 */
export const registerTeacher = async (
  teacherName: string,
  email: string,
  subjectsTaught: string[],
  classLevelsTaught: string[],
  phoneNumber: string,
  profileImage?: string,
): Promise<{ user: User; password: string }> => {
  return apiCall('/users/register-teacher', 'POST', {
    teacherName,
    email,
    subjectsTaught,
    classLevelsTaught,
    phoneNumber,
    profileImage,
  });
};

/**
 * Simulates registering a new parent.
 */
export const registerParent = async (
  parentName: string,
  email: string,
  phoneNumber: string,
  studentIdsToLink?: string[],
  profileImage?: string,
): Promise<{ user: User; password: string }> => {
  return apiCall('/users/register-parent', 'POST', {
    parentName,
    email,
    phoneNumber,
    studentIdsToLink,
    profileImage,
  });
};

/**
 * Simulates verifying the admin's password to reveal another user's password.
 * This is still handled client-side in terms of password comparison for security reasons
 * in this mock context, but would ideally be a secure backend endpoint returning only
 * access to view the password, not the password itself.
 * For this full-stack migration, we'll keep the client-side `verifyAdminPassword` as is,
 * but real backend systems would have a more complex token-based access.
 * Note: The backend `users` route's GET `/` endpoint can return passwords if `includePasswords=true`.
 * This mock function verifies an admin password, then fetches all users (with passwords)
 * to find the target user's password.
 */
/**
 * Securely verifies the admin's password and retrieves a target user's password info.
 */
export const verifyAdminPassword = async (adminId: string, adminPasswordInput: string, targetUserId: string): Promise<{ password: string; isHashed: boolean }> => {
  try {
    return await apiCall('/users/verify-admin', 'POST', {
      adminId,
      adminPassword: adminPasswordInput,
      targetUserId
    });
  } catch (error) {
    console.error('Admin password verification failed via API:', error);
    throw error;
  }
};
// ... existing code ...

/**
 * Initiates the password reset process.
 */
export const forgotPassword = async (email: string): Promise<any> => {
  return apiCall('/auth/forgot-password', 'POST', { email });
};

/**
 * Resets the password using the token.
 */
export const resetPassword = async (token: string, newPassword: string): Promise<any> => {
  return apiCall('/auth/reset-password', 'POST', { token, newPassword });
};
