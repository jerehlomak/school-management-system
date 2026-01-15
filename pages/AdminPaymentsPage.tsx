
import React, { useState, useEffect, useCallback } from 'react';
import { FeePayment, UserRole, SchoolClass } from '../types';
import { fetchAllPayments, fetchClasses } from '../services/apiService';
import PaymentDetailModal from '../components/PaymentDetailModal';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<FeePayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        studentName: '',
        classId: '',
        startDate: '',
        endDate: '',
        status: 'All'
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [paymentsData, classesData] = await Promise.all([
                fetchAllPayments(filters.status === 'All' ? { ...filters, status: undefined } : filters),
                fetchClasses()
            ]);
            setPayments(paymentsData);
            setClasses(classesData);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]); // Reload when filters change (debouncing might be better for text input, but let's separate apply)

    // Initial load
    useEffect(() => {
        loadData();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        loadData();
    };

    const handleViewDetails = (payment: FeePayment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const handleClearFilters = () => {
        setFilters({
            studentName: '',
            classId: '',
            startDate: '',
            endDate: '',
            status: 'All'
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Payment Receipts & History</h1>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                        <input
                            type="text"
                            name="studentName"
                            value={filters.studentName}
                            onChange={handleFilterChange}
                            placeholder="Search name..."
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            name="classId"
                            value={filters.classId}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <div className="flex gap-2">
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-1/2 p-2 border text-xs rounded" />
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-1/2 p-2 border text-xs rounded" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" variant="primary" className="flex-1" loading={loading}>
                            Apply
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            className="px-3"
                            onClick={handleClearFilters}
                            title="Clear Filters"
                        >
                            Clear
                        </Button>
                    </div>
                </form>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadowoverflow-hidden border border-gray-200">
                {loading ? (
                    <div className="p-10"><LoadingSpinner /></div>
                ) : payments.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No payment records found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleViewDetails(payment)}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {payment.studentName || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {payment.classId || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            <button onClick={(e) => { e.stopPropagation(); handleViewDetails(payment); }} className="hover:underline">
                                                View Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <PaymentDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                payment={selectedPayment}
                currentUserRole={UserRole.Admin}
                onPaymentUpdated={() => {
                    loadData(); // Refresh list to show updated status
                }}
            />
        </div>
    );
};

export default AdminPaymentsPage;
