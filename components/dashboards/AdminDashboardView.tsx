import React from 'react';
import { User, UserRole } from '../../types';
import DashboardCard from '../DashboardCard';
import Table from '../Table';

interface AdminDashboardViewProps {
    adminUsers: User[];
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ adminUsers }) => {
    const totalUsers = adminUsers.length;
    const totalStudents = adminUsers.filter(u => u.role === UserRole.Student).length;
    const totalTeachers = adminUsers.filter(u => u.role === UserRole.Teacher).length;
    const totalParents = adminUsers.filter(u => u.role === UserRole.Parent).length;

    const userColumns = [
        { header: 'Name', accessor: 'name' as keyof User },
        { header: 'Username', accessor: 'username' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User },
        { header: 'Role', accessor: 'role' as keyof User },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Total Users"
                    value={totalUsers}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292V15a2 2 0 01-2 2H8a2 2 0 01-2-2v-4.646m8 0V15a2 2 0 002 2h2a2 2 0 002-2v-4.646M12 18.535V22"></path></svg>}
                />
                <DashboardCard
                    title="Total Students"
                    value={totalStudents}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 18v-1a2 2 0 00-2-2H7a2 2 0 00-2 2v1"></path></svg>}
                />
                <DashboardCard
                    title="Total Teachers"
                    value={totalTeachers}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 005.356-1.857M9 20v-2a3 3 0 013-3m-4.75 0V7a4.5 4.5 0 119 0v10M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
                />
                <DashboardCard
                    title="Total Parents"
                    value={totalParents}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 18.72a4.5 4.5 0 002.2-.97m0 0a4.5 4.5 0 00-2.2-.97m0 0H12m4.053 4.908a2.91 2.91 0 002.868-.262M18 18.72c-1.353-.193-2.636-.534-3.832-1.018M7.89 18.72a4.5 4.5 0 01-2.2-.97m0 0a4.5 4.5 0 012.2-.97m0 0H12m-.868 4.908a2.91 2.91 0 01-2.868-.262M6 18.72c1.353-.193 2.636-.534 3.832-1.018m0 0a3 3 0 012.236-1.956M11.999 4.418c-2.34-.14-4.26-1.32-5.594-3.15M12 21.082a9 9 0 100-18 9 9 0 000 18z"></path></svg>}
                />
            </div>

            <section>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">All Users</h3>
                <Table data={adminUsers} columns={userColumns} rowKey="id" emptyMessage="No users found." />
            </section>
        </div>
    );
};

export default AdminDashboardView;
