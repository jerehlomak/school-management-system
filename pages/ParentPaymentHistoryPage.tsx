import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, FeePayment, PaymentStatus } from '../types';
import Table from '../components/Table';
import { fetchStudentPayments, fetchAllUsers } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

interface ParentPaymentHistoryPageProps {
    user: User;
}

const ParentPaymentHistoryPage: React.FC<ParentPaymentHistoryPageProps> = ({ user }) => {
    const [payments, setPayments] = useState<FeePayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const usersResponse = await fetchAllUsers();
            setAllUsers(usersResponse.data || []);

            let fetchedPayments: FeePayment[] = [];
            if (user.role === UserRole.Parent && user.studentIds && user.studentIds.length > 0) {
                const allStudentPayments = await Promise.all(
                    user.studentIds.map(studentId => fetchStudentPayments(studentId))
                );
                fetchedPayments = allStudentPayments.flat();
            } else if (user.role === UserRole.Student) {
                fetchedPayments = await fetchStudentPayments(user.id);
            }

            setPayments(fetchedPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err: any) {
            console.error("Error loading history:", err);
            setError(err.message || "Failed to load payment history");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const paymentColumns = [
        { header: 'Student Name', accessor: (row: FeePayment) => allUsers.find(u => u.id === row.studentId)?.name || row.studentId },
        { header: 'Description', accessor: 'description' as keyof FeePayment },
        { header: 'Term/Year', accessor: (row: FeePayment) => `Term ${row.term} / ${row.year}` },
        { header: 'Amount (₦)', accessor: (row: FeePayment) => row.amount.toLocaleString() },
        { header: 'Date', accessor: (row: FeePayment) => new Date(row.date).toLocaleDateString() },
        {
            header: 'Status', accessor: (row: FeePayment) => (
                <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === PaymentStatus.Completed ? 'bg-green-100 text-green-800' :
                        row.status === PaymentStatus.Pending ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}
                >
                    {row.status}
                </span>
            )
        },
        { header: 'RRR', accessor: (row: FeePayment) => row.rrr || 'N/A' },
    ];

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment History</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <Table
                    data={payments}
                    columns={paymentColumns}
                    rowKey="id"
                    emptyMessage="No payment records found."
                    caption="Complete history of all school fee payments."
                />
            </div>
        </div>
    );
};

export default ParentPaymentHistoryPage;
