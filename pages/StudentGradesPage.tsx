import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, StudentTermGrade, Course } from '../types';
import { fetchStudentTermGrades, fetchCourses, fetchAllUsers, fetchClasses } from '../services/apiService';
import GradesDisplay from '../components/GradesDisplay';

interface StudentGradesPageProps {
  user: User;
}

const CURRENT_YEAR = new Date().getFullYear();

const StudentGradesPage: React.FC<StudentGradesPageProps> = ({ user }) => {
  const [selectedTerm, setSelectedTerm] = useState<1 | 2 | 3>(1);
  const [allStudentGrades, setAllStudentGrades] = useState<StudentTermGrade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feesOwingError, setFeesOwingError] = useState<{ term: number, year: number } | null>(null);

  const loadStudentData = useCallback(async () => {
    if (user.role !== UserRole.Student) {
      setError("Access Denied: Only students can view this page.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedGrades = await fetchStudentTermGrades(user.id, undefined, undefined, CURRENT_YEAR);
      setAllStudentGrades(fetchedGrades);

      const fetchedCourses = await fetchCourses();
      setCourses(fetchedCourses);

      const fetchedUsersResponse = await fetchAllUsers();
      setAllUsers(fetchedUsersResponse.data || []);

      const fetchedClasses = await fetchClasses();
      setAllClasses(fetchedClasses);

    } catch (err: any) {
      console.error('Failed to load student data:', err);
      if (err.message && err.message.includes('Access Restricted')) {
        setFeesOwingError({ term: selectedTerm, year: CURRENT_YEAR });
      } else {
        setError(err.message || 'Failed to load your grades and course information.');
      }
    } finally {
      setLoading(false);
    }
  }, [user, selectedTerm]);

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  // Calculations that were previously inline
  const gradesForSelectedTerm = allStudentGrades.filter(g => g.term === selectedTerm);
  const studentsInClass = allUsers.filter(s => s.role === UserRole.Student && s.classId === user.classId);
  const classAveragesForTerm = studentsInClass.map(s => {
    const studentTermAverage = allStudentGrades.find(g => g.studentId === s.id && g.term === selectedTerm)?.termAverage;
    return studentTermAverage !== undefined ? studentTermAverage : 0;
  }).filter(avg => avg > 0);

  const classAverage = classAveragesForTerm.length > 0
    ? (classAveragesForTerm.reduce((sum, avg) => sum + avg, 0) / classAveragesForTerm.length).toFixed(2)
    : 'N/A';

  const firstGradeInTerm = gradesForSelectedTerm[0];
  const classPositionText = firstGradeInTerm?.termPosition || 'N/A';
  const classPositionMatch = classPositionText.match(/(\d+)(?:st|nd|rd|th) of (\d+)/);
  const positionInClass = classPositionMatch ? `${classPositionMatch[1]} out of ${classPositionMatch[2]}` : 'N/A';

  const cumulativeAverage = (selectedTerm === 3 && firstGradeInTerm?.cumulativeAverage !== undefined)
    ? firstGradeInTerm.cumulativeAverage.toFixed(2)
    : 'N/A';

  if (user.role !== UserRole.Student) {
    return <div className="p-6 text-red-600">Access Denied: Only students can access this page.</div>;
  }

  if (loading && allStudentGrades.length === 0) {
    return <div className="text-center py-8 text-gray-600">Loading your report card...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <GradesDisplay
      user={user}
      selectedTerm={selectedTerm}
      onTermChange={setSelectedTerm}
      allStudentGrades={allStudentGrades}
      courses={courses}
      allClasses={allClasses}
      classAverage={classAverage}
      positionInClass={positionInClass}
      cumulativeAverage={cumulativeAverage}
      loading={loading}
      feesOwingError={feesOwingError}
    />
  );
};

export default StudentGradesPage;