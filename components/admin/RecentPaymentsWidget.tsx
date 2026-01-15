
import React, { useEffect, useState } from 'react';
import { FeePayment } from '../../types';
import { fetchRecentPayments } from '../../services/apiService';

const RecentPaymentsWidget: React.FC = () => {
    const [payments, setPayments] = useState<FeePayment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchRecentPayments();
                setPayments(data);
            } catch (error) {
                console.error("Failed to load recent payments", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading recent payments...</div>;
    }

    if (payments.length === 0) {
        return <div className="p-4 text-center text-gray-500">No recent payments.</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Recent Fee Payments</h3>
            </div>
            <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {payments.map(payment => (
                    <li key={payment.id} className="px-6 py-3 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {(payment.studentId as any).name || payment.studentId}
                                    <span className="text-gray-500 text-xs ml-2">({(payment.studentId as any).classId || 'N/A'})</span>
                                </p>
                                <p className="text-xs text-gray-500">{payment.description}</p>
                                {payment.isPartPayment && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Part Payment
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-green-600">
                                    +₦{payment.amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(payment.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecentPaymentsWidget;
