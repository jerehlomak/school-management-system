import React, { useState, useEffect } from 'react';
import { Application } from '../types';
import Table from '../components/Table';
import { fetchApplications, updateApplicationStatus } from '../services/apiService';
import Button from '../components/Button';

const AdminApplicationsPage: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const data = await fetchApplications();
            setApplications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: 'Approved' | 'Rejected') => {
        try {
            await updateApplicationStatus(id, newStatus);
            // Optimistic update or reload
            setApplications(apps => apps.map(app =>
                app.id === id ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="p-8">Loading applications...</div>;

    const columns = [
        { header: 'Applicant', accessor: (row: Application) => `${row.firstName} ${row.lastName}` },
        { header: 'Grade', accessor: 'grade' as keyof Application },
        { header: 'Parent', accessor: 'parentName' as keyof Application },
        { header: 'Date', accessor: (row: Application) => new Date(row.submissionDate).toLocaleDateString() },
        {
            header: 'Status',
            accessor: (row: Application) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        row.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (row: Application) => (
                <div className="flex gap-2">
                    {row.status === 'Pending' && (
                        <>
                            <Button
                                variant="primary"
                                className="px-2 py-1 text-xs"
                                onClick={() => handleStatusUpdate(row.id, 'Approved')}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="danger"
                                className="px-2 py-1 text-xs"
                                onClick={() => handleStatusUpdate(row.id, 'Rejected')}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    <a href={row.passportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center">
                        View Passport
                    </a>
                </div>
            )
        }
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Student Applications</h1>
            <Table<Application>
                data={applications}
                columns={columns}
                rowKey="id"
                itemsPerPage={10}
                emptyMessage="No applications received yet."
            />
        </div>
    );
};

export default AdminApplicationsPage;
