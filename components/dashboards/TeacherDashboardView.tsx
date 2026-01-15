import React from 'react';
import { User, Course, StudentTermGrade } from '../../types';
import DashboardCard from '../DashboardCard';
import Table from '../Table';

interface TeacherDashboardViewProps {
    user: User;
    teacherCourses: Course[];
    teacherAllGrades: StudentTermGrade[];
    allFetchedUsers: User[];
}

const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
    user,
    teacherCourses,
    teacherAllGrades,
    allFetchedUsers
}) => {
    const totalClasses = teacherCourses.length;
    const totalStudents = new Set(teacherCourses.flatMap(c => c.students)).size;
    const gradesEntered = teacherAllGrades.length;

    const coursesColumns = [
        { header: 'Course Code', accessor: 'code' as keyof Course },
        { header: 'Course Name', accessor: 'name' as keyof Course },
        { header: 'Enrolled Students', accessor: (row: Course) => row.students.length },
        { header: 'Assigned Teacher', accessor: (row: Course) => allFetchedUsers.find(t => t.id === row.teacherId)?.name || 'N/A' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Teacher Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="Classes Taught"
                    value={totalClasses}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>}
                />
                <DashboardCard
                    title="Total Students"
                    value={totalStudents}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 005.356-1.857M9 20v-2a3 3 0 013-3m-4.75 0V7a4.5 4.5 0 119 0v10M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
                />
                <DashboardCard
                    title="Grades Entered"
                    value={gradesEntered}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
                />
            </div>

            <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">My Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                    <p><span className="font-semibold">Teacher ID:</span> {user.id}</p>
                    <p><span className="font-semibold">Phone:</span> {user.phoneNumber || 'N/A'}</p>
                    <p><span className="font-semibold">Email:</span> {user.email}</p>
                </div>
            </section>

            <section>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">My Courses</h3>
                <Table data={teacherCourses} columns={coursesColumns} rowKey="id" emptyMessage="No courses assigned yet." />
            </section>
        </div>
    );
};

export default TeacherDashboardView;
