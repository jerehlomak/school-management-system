import React, { useState, useEffect } from 'react';
import { User, UserRole, Course, SchoolClass } from '../types';
import { fetchCourses, fetchClasses } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

interface TeacherClassesPageProps {
    user: User;
}

const TeacherClassesPage: React.FC<TeacherClassesPageProps> = ({ user }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [myClasses, setMyClasses] = useState<SchoolClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [allCourses, allClasses] = await Promise.all([
                    fetchCourses(),
                    fetchClasses()
                ]);

                // Filter courses taught by this teacher
                // Assuming user.subjectsTaught contains IDs, OR course.teacherId matches user.id
                // We will prioritize course.teacherId if available, or fallback to the list in user profile
                const teacherCourses = allCourses.filter(course =>
                    course.teacherId === user.id || user.subjectsTaught?.includes(course.id)
                );
                setCourses(teacherCourses);

                // Filter classes where this teacher is the "Class Teacher"
                const teacherClasses = allClasses.filter(cls =>
                    cls.classTeacherId === user.id
                );
                setMyClasses(teacherClasses);

            } catch (err: any) {
                console.error('Failed to load teacher data:', err);
                setError('Failed to load your classes and subjects.');
            } finally {
                setLoading(false);
            }
        };

        if (user.role === UserRole.Teacher) {
            loadData();
        }
    }, [user]);

    if (user.role !== UserRole.Teacher) {
        return <div className="p-6 text-red-600">Access Denied: Only teachers can view this page.</div>;
    }

    if (loading) return <LoadingSpinner />;

    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6 space-y-8">

            {/* Section 1: Subjects Taught */}
            <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">My Subjects</h2>
                {courses.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600">You are not assigned to teach any subjects yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-blue-700">{course.name}</h3>
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                                            {course.code}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-gray-800">{course.students?.length || 0}</span>
                                        <span className="text-xs text-gray-500 uppercase">Students</span>
                                    </div>
                                </div>

                                {/* <div className="border-t border-gray-100 pt-4 mt-2"> */}
                                {/* Future: Add link to View Grades specifically for this course */}
                                {/* <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View Grades Analysis</button> */}
                                {/* </div> */}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Section 2: Form Classes (Class Teacher) */}
            <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">My Class(es) <span className="text-lg font-normal text-gray-500">(Form Teacher)</span></h2>
                {myClasses.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-600">You are not assigned as a Form Teacher for any class.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myClasses.map(cls => (
                            <div key={cls.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">{cls.name}</h3>
                                        <p className="text-sm text-gray-500">Capacity: {cls.capacity}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-gray-800">{cls.studentsIds?.length || 0}</span>
                                        <span className="text-xs text-gray-500 uppercase">Enrolled</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                    <div
                                        className="bg-green-600 h-2.5 rounded-full"
                                        style={{ width: `${Math.min(((cls.studentsIds?.length || 0) / cls.capacity) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-right mt-1 text-gray-500">
                                    {Math.round(((cls.studentsIds?.length || 0) / cls.capacity) * 100)}% Full
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
};

export default TeacherClassesPage;
