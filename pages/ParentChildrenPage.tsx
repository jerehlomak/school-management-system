import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import Table from '../components/Table';
import { fetchAllUsers, fetchClasses } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

interface ParentChildrenPageProps {
    user: User;
}

const ParentChildrenPage: React.FC<ParentChildrenPageProps> = ({ user }) => {
    const [children, setChildren] = useState<User[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (user.role !== UserRole.Parent) {
                    setError("Access denied.");
                    return;
                }

                const [usersResponse, classesData] = await Promise.all([
                    fetchAllUsers(),
                    fetchClasses()
                ]);

                const allUsers = usersResponse.data || [];
                const linkedChildren = allUsers.filter(u => user.studentIds?.includes(u.id) && u.role === UserRole.Student);

                setChildren(linkedChildren);
                setClasses(classesData);
            } catch (err: any) {
                console.error("Error fetching children:", err);
                setError(err.message || "Failed to load children.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const studentColumns = [
        { header: 'Student Name', accessor: 'name' as keyof User },
        { header: 'Student ID', accessor: 'id' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User },
        { header: 'Phone No.', accessor: (row: User) => row.phoneNumber || 'N/A' },
        { header: 'Class', accessor: (row: User) => classes.find((cls: any) => cls.id === row.classId)?.name || 'N/A' },
        { header: 'Admission Year', accessor: (row: User) => row.admissionYear || 'N/A' },
    ];

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-600 p-6">{error}</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">My Children</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <Table data={children} columns={studentColumns} rowKey="id" emptyMessage="No children linked to this account." />
            </div>
        </div>
    );
};

export default ParentChildrenPage;
