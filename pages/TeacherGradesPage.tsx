
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole, Course, StudentTermGrade } from '../types';
import { fetchCourses, fetchTeacherTermGrades, saveStudentTermGrade, calculateCoursePositions, fetchAllUsers } from '../services/apiService';
import Table from '../components/Table';
import Button from '../components/Button';
import AIAssistant from '../components/AIAssistant';

interface TeacherGradesPageProps {
  user: User;
}

const CURRENT_YEAR = new Date().getFullYear();

const TeacherGradesPage: React.FC<TeacherGradesPageProps> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]); // All courses taught by this teacher
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<1 | 2 | 3>(1);
  const [studentsInCourse, setStudentsInCourse] = useState<User[]>([]); // Students enrolled in selected course
  const [studentGrades, setStudentGrades] = useState<StudentTermGrade[]>([]); // Grades for students in selected course/term
  const [editingGrades, setEditingGrades] = useState<{ [studentId: string]: StudentTermGrade }>({});
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]); // All users for lookup (e.g., student names)
  const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]); // All courses for general lookup

  console.log('======================')
  console.log('allUsers', allUsers)  // Helper to calculate weighted total and term average
  const calculateRealtimeWeightedScores = useCallback((grade: StudentTermGrade) => {
    const ass1 = grade.assignment1 ?? 0;
    const ass2 = grade.assignment2 ?? 0;
    const test1 = grade.test1 ?? 0;
    const test2 = grade.test2 ?? 0;
    const exam = grade.exam ?? 0;

    const totalScore = ass1 + ass2 + test1 + test2 + exam;
    const termAverage = totalScore;

    return { totalScore: parseFloat(totalScore.toFixed(2)), termAverage: parseFloat(termAverage.toFixed(2)) };
  }, []);

  // Fetch courses taught by the current teacher and all users/courses
  useEffect(() => {
    const loadCoursesAndUsers = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await fetchAllUsers();
        const fetchedUser = fetchedUsers.data
        console.log('--------------------------------');
        console.log(fetchedUser);
        console.log('--------------------------------');
        setAllUsers(fetchedUser);

        const fetchedAllCourses = await fetchCourses();
        setAllFetchedCourses(fetchedAllCourses); // Store all courses

        // Filter courses based on the teacher's subjectsTaught array on their user object
        const teacherCourses = fetchedAllCourses.filter(course => user.subjectsTaught?.includes(course.id));
        setCourses(teacherCourses);
        if (teacherCourses.length > 0 && !selectedCourseId) {
          setSelectedCourseId(teacherCourses[0].id);
        }
      } catch (err: any) {
        console.error('Failed to fetch courses or users:', err);
        setMessage({ type: 'error', text: err.message || 'Failed to load courses or user data.' });
      } finally {
        setLoading(false);
      }
    };
    loadCoursesAndUsers();
  }, [user.id, selectedCourseId, user.subjectsTaught]);


  // Fetch students and their grades for the selected course and term
  const loadStudentGrades = useCallback(async () => {
    if (!selectedCourseId || !selectedTerm) {
      setStudentGrades([]);
      setStudentsInCourse([]);
      setEditingGrades({});
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      // Re-fetch all courses to ensure we have the latest student enrollments
      const currentAllCourses = await fetchCourses();
      const course = currentAllCourses.find(c => c.id === selectedCourseId);
      if (!course) {
        setMessage({ type: 'error', text: 'Selected course not found.' });
        setLoading(false);
        return;
      }

      // Filter students for the selected course from the dynamically fetched allUsers
      const courseStudents = allUsers.filter(u => u.role === UserRole.Student && course.students.includes(u.id));
      setStudentsInCourse(courseStudents);

      const grades = await fetchTeacherTermGrades(user.id, selectedCourseId, selectedTerm, CURRENT_YEAR);
      setStudentGrades(grades);

      // Initialize editingGrades state
      const initialEditingGrades: { [studentId: string]: StudentTermGrade } = {};
      courseStudents.forEach(student => {
        const existingGrade = grades.find(g => g.studentId === student.id);
        initialEditingGrades[student.id] = existingGrade || {
          id: '',
          studentId: student.id,
          courseId: selectedCourseId,
          term: selectedTerm,
          year: CURRENT_YEAR,
          updatedAt: new Date().toISOString(),
        };
      });
      setEditingGrades(initialEditingGrades);

    } catch (err: any) {
      console.error('Failed to fetch student grades:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to load student grades.' });
    } finally {
      setLoading(false);
    }
  }, [user.id, selectedCourseId, selectedTerm, allUsers]);

  useEffect(() => {
    loadStudentGrades();
  }, [loadStudentGrades]);


  const handleGradeChange = (studentId: string, field: keyof StudentTermGrade, value: number | '') => {
    setEditingGrades(prev => {
      const currentGrade = { ...prev[studentId] };
      const parsedValue = value === '' ? undefined : Number(value);

      let max = 100;
      if (field === 'assignment1' || field === 'assignment2') max = 10;
      if (field === 'test1' || field === 'test2') max = 20;
      if (field === 'exam') max = 40;

      if (parsedValue !== undefined && (parsedValue < 0 || parsedValue > max)) {
        return prev;
      }

      const updatedGrade = {
        ...currentGrade,
        [field]: parsedValue,
        updatedAt: new Date().toISOString(),
      };

      const { totalScore, termAverage } = calculateRealtimeWeightedScores(updatedGrade);
      updatedGrade.totalScore = totalScore;
      updatedGrade.termAverage = termAverage;

      return {
        ...prev,
        [studentId]: updatedGrade,
      };
    });
  };

  const handleSaveGrades = async () => {
    setSaveLoading(true);
    setMessage(null);
    try {
      const gradesToSave: StudentTermGrade[] = Object.values(editingGrades).filter(grade =>
        grade.assignment1 !== undefined ||
        grade.assignment2 !== undefined ||
        grade.test1 !== undefined ||
        grade.test2 !== undefined ||
        grade.exam !== undefined
      ).map(grade => {
        const { totalScore, termAverage } = calculateRealtimeWeightedScores(grade);
        return { ...grade, totalScore, termAverage };
      });


      await Promise.all(gradesToSave.map(grade => saveStudentTermGrade(grade)));
      setMessage({ type: 'success', text: 'Grades saved successfully!' });
      loadStudentGrades();
    } catch (err: any) {
      console.error('Failed to save grades:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save grades. Please try again.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCalculatePositions = async () => {
    setCalcLoading(true);
    setMessage(null);
    try {
      const updatedGrades = await calculateCoursePositions(selectedCourseId, selectedTerm, CURRENT_YEAR);
      setMessage({ type: 'success', text: 'Positions and averages calculated!' });
      setStudentGrades(updatedGrades);
      setEditingGrades(prev => {
        const newEditingGrades = { ...prev };
        updatedGrades.forEach(grade => {
          newEditingGrades[grade.studentId] = {
            ...newEditingGrades[grade.studentId],
            termAverage: grade.termAverage,
            totalScore: grade.totalScore,
            termPosition: grade.termPosition,
            cumulativeAverage: grade.cumulativeAverage,
            promotionStatus: grade.promotionStatus,
            promotedToClass: grade.promotedToClass,
          };
        });
        return newEditingGrades;
      });
    } catch (err: any) {
      console.error('Failed to calculate positions:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to calculate positions. Please try again.' });
    } finally {
      setCalcLoading(false);
    }
  };

  const gradeInput = (studentId: string, field: keyof StudentTermGrade, maxScore: number) => (
    <input
      type="number"
      min="0"
      max={maxScore}
      step="1"
      value={editingGrades[studentId]?.[field] ?? ''}
      onChange={(e) => handleGradeChange(studentId, field, e.target.value === '' ? '' : Number(e.target.value))}
      className="w-20 p-1 border border-gray-300 rounded-md text-center focus:ring-blue-500 focus:border-blue-500 text-sm"
      aria-label={`${studentId} ${field} (max ${maxScore})`}
    />
  );

  const gradeColumns = useMemo(() => ([
    { header: 'Student Name', accessor: (row: StudentTermGrade) => allUsers.find(u => u.id === row.studentId)?.name || row.studentId, className: 'font-medium' },
    { header: 'Assign. 1 (10)', accessor: (row: StudentTermGrade) => gradeInput(row.studentId, 'assignment1', 10) },
    { header: 'Assign. 2 (10)', accessor: (row: StudentTermGrade) => gradeInput(row.studentId, 'assignment2', 10) },
    { header: 'Test 1 (20)', accessor: (row: StudentTermGrade) => gradeInput(row.studentId, 'test1', 20) },
    { header: 'Test 2 (20)', accessor: (row: StudentTermGrade) => gradeInput(row.studentId, 'test2', 20) },
    { header: 'Exam (40)', accessor: (row: StudentTermGrade) => gradeInput(row.studentId, 'exam', 40) },
    { header: 'Total Score', accessor: (row: StudentTermGrade) => editingGrades[row.studentId]?.totalScore?.toFixed(2) ?? 'N/A', className: 'font-semibold text-blue-700' },
    { header: 'Term Avg', accessor: (row: StudentTermGrade) => editingGrades[row.studentId]?.termAverage?.toFixed(2) ?? 'N/A', className: 'font-semibold text-blue-700' },
    { header: 'Position', accessor: (row: StudentTermGrade) => editingGrades[row.studentId]?.termPosition || 'N/A' },
    { header: 'Cum. Avg', accessor: (row: StudentTermGrade) => (selectedTerm === 3 ? (editingGrades[row.studentId]?.cumulativeAverage?.toFixed(2) ?? 'N/A') : '-'), className: 'font-semibold text-green-700' },
    { header: 'Promotion', accessor: (row: StudentTermGrade) => (selectedTerm === 3 ? (editingGrades[row.studentId]?.promotionStatus || 'N/A') : '-'), className: 'text-sm' },
    { header: 'Promoted To', accessor: (row: StudentTermGrade) => (selectedTerm === 3 ? (editingGrades[row.studentId]?.promotedToClass || 'N/A') : '-'), className: 'text-sm' },
  ]), [editingGrades, selectedTerm, calculateRealtimeWeightedScores, allUsers]);

  if (user.role !== UserRole.Teacher) {
    return <div className="p-6 text-red-600">Access Denied: Only teachers can access this page.</div>;
  }

  const tableData = studentsInCourse.map(student => editingGrades[student.id] || {
    id: student.id,
    studentId: student.id,
    courseId: selectedCourseId,
    term: selectedTerm,
    year: CURRENT_YEAR,
    updatedAt: '',
  });


  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Manage Grades</h2>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <label htmlFor="course-select" className="text-gray-700 font-medium whitespace-nowrap">Course:</label>
            <select
              id="course-select"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:w-48"
              disabled={loading}
              aria-label="Select course"
            >
              <option value="">Select a Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <label htmlFor="term-select" className="text-gray-700 font-medium whitespace-nowrap">Term:</label>
            <select
              id="term-select"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(Number(e.target.value) as 1 | 2 | 3)}
              className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:w-32"
              disabled={loading}
              aria-label="Select term"
            >
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
            </select>
          </div>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">My Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <p><span className="font-semibold">Teacher ID:</span> {user.id}</p>
            <p><span className="font-semibold">Phone:</span> {user.phoneNumber || 'N/A'}</p>
            <p><span className="font-semibold">Email:</span> {user.email}</p>
          </div>
        </section>

        {message && (
          <div
            className={`p-3 rounded-lg text-white mb-4 ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        {selectedCourseId && selectedTerm ? (
          <>
            <div className="mb-4 flex gap-4">
              <Button onClick={handleSaveGrades} loading={saveLoading} disabled={loading} className="px-6 py-2.5">
                Save Grades
              </Button>
              <Button onClick={handleCalculatePositions} loading={calcLoading} disabled={loading || saveLoading} variant="secondary" className="px-6 py-2.5">
                Calculate Positions
              </Button>
            </div>
            <Table
              data={tableData}
              columns={gradeColumns}
              rowKey="studentId"
              emptyMessage={loading ? "Loading students..." : "No students found in this course/term or select a course and term."}
            />
          </>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center text-gray-600">
            Please select a course and term to view and manage grades.
          </div>
        )}
      </div>

      {/* <div className="w-full lg:w-96 flex-shrink-0">
        <AIAssistant systemInstruction="You are a teaching assistant. Help teachers with questions about grading rubrics, lesson planning, student assessment strategies, or how to use this grading system effectively." />
      </div> */}
    </div>
  );
};

export default TeacherGradesPage;