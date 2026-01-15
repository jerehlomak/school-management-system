import React from 'react';
import { User, Course, StudentTermGrade, Payment, PaymentStatus } from '../../types';
import DashboardCard from '../DashboardCard';
import Table from '../Table';
import { Link } from 'react-router-dom';
import Button from '../Button';

interface StudentDashboardViewProps {
    user: User;
    studentGrades: StudentTermGrade[];
    studentCourses: Course[];
    studentPayments: Payment[];
    allFetchedCourses: Course[];
    allFetchedClasses: any[];
    allFetchedUsers: User[];
    currentYear: number;
}

const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
    user,
    studentGrades,
    studentCourses,
    studentPayments,
    allFetchedCourses,
    allFetchedClasses,
    allFetchedUsers,
    currentYear
}) => {
    const totalCourses = studentCourses.length;
    const overallAverage = studentGrades.length > 0
        ? (studentGrades.filter(g => g.termAverage !== undefined).reduce((sum, g) => sum + (g.termAverage || 0), 0) / studentGrades.filter(g => g.termAverage !== undefined).length).toFixed(2)
        : 'N/A';
    const pendingPayments = studentPayments.filter(p => p.status === PaymentStatus.Pending).length;

    const latestTerm = studentGrades.length > 0 ? Math.max(...studentGrades.map(g => g.term)) : 0;
    const displayGrades = latestTerm > 0 ? studentGrades.filter(g => g.term === latestTerm) : studentGrades;

    const gradesColumns = [
        { header: 'Course', accessor: (row: StudentTermGrade) => allFetchedCourses.find(c => c.id === row.courseId)?.name || row.courseId },
        { header: 'Term', accessor: 'term' as keyof StudentTermGrade },
        { header: 'Total Score', accessor: (row: StudentTermGrade) => row.totalScore?.toFixed(2) ?? 'N/A', className: 'font-semibold' },
        { header: 'Term Average', accessor: (row: StudentTermGrade) => row.termAverage?.toFixed(2) ?? 'N/A', className: 'font-semibold text-blue-700' },
        { header: 'Position', accessor: (row: StudentTermGrade) => row.termPosition || 'N/A' },
        { header: 'Cum. Average', accessor: (row: StudentTermGrade) => row.cumulativeAverage !== undefined ? row.cumulativeAverage.toFixed(2) : 'N/A', className: 'font-semibold text-green-700' },
    ];

    const coursesColumns = [
        { header: 'Course Code', accessor: 'code' as keyof Course },
        { header: 'Course Name', accessor: 'name' as keyof Course },
        { header: 'Teacher', accessor: (row: Course) => allFetchedUsers.find(t => t.id === row.teacherId)?.name || 'N/A' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Student Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="Total Courses"
                    value={totalCourses}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>}
                />
                <DashboardCard
                    title="Overall Average"
                    value={overallAverage}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
                />
                <DashboardCard
                    title="Pending Payments"
                    value={pendingPayments}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
                />
            </div>

            <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">My Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                    <p><span className="font-semibold">Student ID:</span> {user.id}</p>
                    <p><span className="font-semibold">Class:</span> {allFetchedClasses.find((cls: any) => cls.id === user.classId)?.name || 'N/A'}</p>
                    <p><span className="font-semibold">Admission Year:</span> {user.admissionYear || 'N/A'}</p>
                    <p><span className="font-semibold">Email:</span> {user.email}</p>
                    <p><span className="font-semibold">Parent:</span> {allFetchedUsers.find(p => p.id === user.parentId)?.name || 'N/A'}</p>
                    <p><span className="font-semibold">Phone:</span> {user.phoneNumber || 'N/A'}</p>
                </div>
            </section>

            <section>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    My Grades Overview ({currentYear})
                    <Link to="/student/grades">
                        <Button variant="ghost" size="sm">
                            View Full Report Card
                        </Button>
                    </Link>
                </h3>
                <Table data={displayGrades} columns={gradesColumns} rowKey="id" emptyMessage="No grades recorded yet." />
            </section>

            <section>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">My Courses</h3>
                <Table data={studentCourses} columns={coursesColumns} rowKey="id" emptyMessage="No courses enrolled yet." />
            </section>
        </div>
    );
};

export default StudentDashboardView;
