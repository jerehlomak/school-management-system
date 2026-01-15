import React, { useState, useEffect } from 'react';
import { User, UserRole, Course } from '../types';
import { fetchCourses } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

interface StudentCoursesPageProps {
    user: User;
}

const StudentCoursesPage: React.FC<StudentCoursesPageProps> = ({ user }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourses = async () => {
            setLoading(true);
            setError(null);
            try {
                const allCourses = await fetchCourses();
                const studentCourses = allCourses.filter(course =>
                    user.subjectsEnrolled?.includes(course.id)
                );
                setCourses(studentCourses);
            } catch (err: any) {
                console.error('Failed to load courses:', err);
                setError('Failed to load your courses.');
            } finally {
                setLoading(false);
            }
        };

        if (user.role === UserRole.Student) {
            loadCourses();
        }
    }, [user]);

    if (user.role !== UserRole.Student) {
        return <div className="p-6 text-red-600">Access Denied: Only students can view this page.</div>;
    }

    if (loading) return <LoadingSpinner />;

    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">My Courses</h2>

            {courses.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-gray-600">You are not enrolled in any courses yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-semibold text-blue-700 mb-2">{course.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">Code: <span className="font-medium text-gray-700">{course.code}</span></p>
                            <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-4">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</span>
                                {/* Logic to find teacher name would go here if available, currently just displaying course info */}
                                <span className="text-sm text-gray-700">View Details</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentCoursesPage;
