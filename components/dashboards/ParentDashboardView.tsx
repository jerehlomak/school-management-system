import React, { useState, useEffect } from 'react';
import { User, FeePayment } from '../../types';
import DashboardCard from '../DashboardCard';
import Table from '../Table';
import { fetchFeeStructure, fetchStudentPayments } from '../../services/apiService';

interface ParentDashboardViewProps {
    user: User;
    parentStudents: User[];
    allFetchedClasses: any[];
}

const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
    user,
    parentStudents,
    allFetchedClasses
}) => {
    const totalChildren = parentStudents.length;
    const [outstandingFees, setOutstandingFees] = useState<number>(0);
    const [loadingFees, setLoadingFees] = useState<boolean>(true);
    const [paymentHistory, setPaymentHistory] = useState<FeePayment[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (parentStudents.length === 0) return;
            try {
                // Fetch payments for all children and attach student info
                const promises = parentStudents.map(async (child) => {
                    const payments = await fetchStudentPayments(child.id);
                    return payments.map(p => ({ ...p, studentName: child.name }));
                });
                const results = await Promise.all(promises);
                // Flatten array
                const allPayments = results.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setPaymentHistory(allPayments);
            } catch (error) {
                console.error("Failed to fetch parent payment history", error);
            }
        };
        fetchHistory();
    }, [parentStudents]);

    const CURRENT_TERM = 1; // Default to Term 1 for now, or could make dynamic later
    const CURRENT_YEAR = new Date().getFullYear();

    useEffect(() => {
        const calculateOutstanding = async () => {
            if (parentStudents.length === 0) {
                setLoadingFees(false);
                return;
            }

            setLoadingFees(true);
            let totalOutstanding = 0;

            try {
                // Determine 'Outstanding' for each child
                // Outstanding = (Total Compulsory Fees for Term) - (Total Paid for Term)

                const promises = parentStudents.map(async (student) => {
                    if (!student.classId) return 0;

                    // 1. Fetch Structure
                    // Note: fetchFeeStructure might fail if checking a previous term or if structure doesn't exist
                    let structureTotal = 0;
                    try {
                        const structure = await fetchFeeStructure(student.classId, CURRENT_TERM);
                        if (structure && structure.items) {
                            // Sum only compulsory items (Tuition is usually compulsory)
                            structureTotal = structure.items
                                .filter((item: any) => item.isCompulsory)
                                .reduce((sum: number, item: any) => sum + item.amount, 0);
                        }
                    } catch (e) {
                        console.warn(`Could not fetch fee structure for student ${student.name}`, e);
                    }

                    // 2. Fetch Payments
                    let paidTotal = 0;
                    try {
                        const payments = await fetchStudentPayments(student.id);
                        // Filter for current Term & Year and 'Completed' status
                        paidTotal = payments
                            .filter((p: FeePayment) =>
                                p.status === 'Completed' &&
                                p.term === CURRENT_TERM &&
                                p.year === CURRENT_YEAR
                            )
                            .reduce((sum: number, p: FeePayment) => sum + p.amount, 0);
                    } catch (e) {
                        console.warn(`Could not fetch payments for student ${student.name}`, e);
                    }

                    // 3. Calc Difference
                    const diff = structureTotal - paidTotal;
                    return diff > 0 ? diff : 0; // If paid more (overpayment), outstanding is 0
                });

                const results = await Promise.all(promises);
                totalOutstanding = results.reduce((acc, curr) => acc + curr, 0);

                setOutstandingFees(totalOutstanding);

            } catch (err) {
                console.error("Error calculating outstanding fees", err);
            } finally {
                setLoadingFees(false);
            }
        };

        calculateOutstanding();
    }, [parentStudents]);


    const studentColumns = [
        { header: 'Student Name', accessor: 'name' as keyof User },
        { header: 'Student ID', accessor: 'id' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User },
        { header: 'Phone No.', accessor: (row: User) => row.phoneNumber || 'N/A' },
        { header: 'Class', accessor: (row: User) => allFetchedClasses.find((cls: any) => cls.id === row.classId)?.name || 'N/A' },
        { header: 'Admission Year', accessor: (row: User) => row.admissionYear || 'N/A' },
    ];

    return (
        <div className="space-y-6">
            {/* <h2 className="text-3xl font-bold text-gray-900 mb-6">Parent Dashboard</h2> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="Children Enrolled"
                    value={totalChildren}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 005.356-1.857M9 20v-2a3 3 0 013-3m-4.75 0V7a4.5 4.5 0 119 0v10M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
                />
                <DashboardCard
                    title="Outstanding Fees (Term 1)"
                    value={loadingFees ? "Calculating..." : `₦${outstandingFees.toLocaleString()}`}
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0h.01M9 12h6m-5 0h.01M9 16h6m-5 0h.01M16 3H8a2 2 0 00-2 2v14a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2z"></path></svg>}
                    color={outstandingFees > 0 ? "red" : "green"}
                />
                <DashboardCard
                    title="Upcoming Events"
                    value="3"
                    icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
                />
            </div>

            <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">My Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                    <p><span className="font-semibold">Parent ID:</span> {user.id}</p>
                    <p><span className="font-semibold">Phone:</span> {user.phoneNumber || 'N/A'}</p>
                    <p><span className="font-semibold">Email:</span> {user.email}</p>
                </div>
            </section>

            <section>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">My Children</h3>
                <Table<User> data={parentStudents} columns={studentColumns} rowKey="id" emptyMessage="No children linked." />
            </section>

            <section>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Payment History</h3>
                <Table<FeePayment>
                    data={paymentHistory}
                    rowKey="id"
                    itemsPerPage={3} // As requested limit 3
                    emptyMessage="No payment history available."
                    columns={[
                        { header: 'Date', accessor: (p) => new Date(p.date).toLocaleDateString() },
                        { header: 'Child Name', accessor: 'studentName' },
                        { header: 'Term', accessor: (p) => `Term ${p.term} (${p.year})` },
                        { header: 'Amount', accessor: (p) => <span className="font-semibold text-gray-900">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(p.amount)}</span> },
                        {
                            header: 'Status',
                            accessor: (p) => (
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    p.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {p.status}
                                </span>
                            )
                        },
                        { header: 'Reference', accessor: (p) => <span className="text-xs text-gray-500 font-mono">{p.paymentReference || 'N/A'}</span> },
                    ]}
                />
            </section>
        </div>
    );
};

export default ParentDashboardView;
