import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { User, UserRole, StudentTermGrade, Course, Payment } from '../types';
import { fetchStudentTermGrades, fetchCourses, fetchStudentPayments, fetchAllUsers, fetchClasses } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy loaded components for code splitting
const StudentDashboardView = lazy(() => import('../components/dashboards/StudentDashboardView'));
const TeacherDashboardView = lazy(() => import('../components/dashboards/TeacherDashboardView'));
const ParentDashboardView = lazy(() => import('../components/dashboards/ParentDashboardView'));
const AdminDashboardView = lazy(() => import('../components/dashboards/AdminDashboardView'));

interface DashboardsProps {
  user: User;
}

const CURRENT_YEAR = new Date().getFullYear();

const Dashboards: React.FC<DashboardsProps> = ({ user }) => {
  const [studentGrades, setStudentGrades] = useState<StudentTermGrade[]>([]);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [teacherAllGrades, setTeacherAllGrades] = useState<StudentTermGrade[]>([]);
  const [parentStudents, setParentStudents] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [allFetchedUsers, setAllFetchedUsers] = useState<User[]>([]);
  const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  const [allFetchedClasses, setAllFetchedClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    try {
      const [usersResponse, coursesData, classesData] = await Promise.all([
        fetchAllUsers(),
        fetchCourses(),
        fetchClasses()
      ]);
      const usersData = usersResponse.data;
      setAllFetchedUsers(usersData);
      setAllFetchedCourses(coursesData);
      setAllFetchedClasses(classesData);
      return { usersData, coursesData, classesData };
    } catch (err) {
      console.error('Failed to fetch data:', err);
      return { usersData: [], coursesData: [], classesData: [] };
    }
  }, []);

  const fetchStudentData = useCallback(async (studentId: string, currentUser: User, coursesData: Course[]) => {
    try {
      const [grades, payments] = await Promise.all([
        fetchStudentTermGrades(studentId, undefined, undefined, currentUser.admissionYear || CURRENT_YEAR),
        fetchStudentPayments(studentId)
      ]);
      setStudentGrades(grades);
      setStudentPayments(payments);

      const enrolledCourseIds = currentUser.subjectsEnrolled || [];
      const enrolledCourses = coursesData.filter(course => enrolledCourseIds.includes(course.id));
      setStudentCourses(enrolledCourses);
    } catch (err) {
      console.error('Failed to fetch student data:', err);
    }
  }, []);

  const fetchTeacherData = useCallback(async (teacherId: string, usersData: User[], coursesData: Course[]) => {
    const teacherUser = usersData.find(u => u.id === teacherId && u.role === UserRole.Teacher);
    if (!teacherUser) return;

    try {
      const coursesTaught = coursesData.filter(course => teacherUser.subjectsTaught?.includes(course.id));
      setTeacherCourses(coursesTaught);

      const allGradesPromises = coursesTaught.flatMap(course =>
        course.students.map(studentId => fetchStudentTermGrades(studentId, course.id, undefined, CURRENT_YEAR))
      );
      const resolvedGrades = await Promise.all(allGradesPromises);
      setTeacherAllGrades(resolvedGrades.flat());
    } catch (err) {
      console.error('Failed to fetch teacher data:', err);
    }
  }, []);

  const fetchParentData = useCallback(async (studentIds: string[], usersData: User[]) => {
    const studentsLinked = usersData.filter(u => studentIds.includes(u.id) && u.role === UserRole.Student);
    setParentStudents(studentsLinked);
  }, []);

  const fetchAdminData = useCallback(async (usersData: User[]) => {
    setAdminUsers(usersData);
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      const { usersData, coursesData, classesData } = await fetchAllData();

      if (user.role === UserRole.Student && user.id) {
        await fetchStudentData(user.id, user, coursesData);
      } else if (user.role === UserRole.Teacher && user.id) {
        await fetchTeacherData(user.id, usersData, coursesData);
      } else if (user.role === UserRole.Parent && user.studentIds) {
        await fetchParentData(user.studentIds, usersData);
      } else if (user.role === UserRole.Admin) {
        await fetchAdminData(usersData);
      }
      setLoading(false);
    };
    initializeDashboard();
  }, [user, fetchAllData, fetchStudentData, fetchTeacherData, fetchParentData, fetchAdminData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          {user.role === UserRole.Student && (
            <StudentDashboardView
              user={user}
              studentGrades={studentGrades}
              studentCourses={studentCourses}
              studentPayments={studentPayments}
              allFetchedCourses={allFetchedCourses}
              allFetchedClasses={allFetchedClasses}
              allFetchedUsers={allFetchedUsers}
              currentYear={CURRENT_YEAR}
            />
          )}
          {user.role === UserRole.Teacher && (
            <TeacherDashboardView
              user={user}
              teacherCourses={teacherCourses}
              teacherAllGrades={teacherAllGrades}
              allFetchedUsers={allFetchedUsers}
            />
          )}
          {user.role === UserRole.Parent && (
            <ParentDashboardView
              user={user}
              parentStudents={parentStudents}
              allFetchedClasses={allFetchedClasses}
            />
          )}
          {user.role === UserRole.Admin && (
            <AdminDashboardView adminUsers={adminUsers} />
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboards;