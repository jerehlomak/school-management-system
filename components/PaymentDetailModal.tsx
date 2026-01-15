
import React from 'react';
import { FeePayment, UserRole, PaymentStatus } from '../types';
import Modal from './Modal';
import Button from './Button';
import { updatePaymentStatus } from '../services/apiService';

interface PaymentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: FeePayment | null;
    currentUserRole: UserRole;
    onPaymentUpdated?: () => void;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({ isOpen, onClose, payment, currentUserRole, onPaymentUpdated }) => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    if (!payment) return null;

    const handleConfirmPayment = async () => {
        if (!payment.id) return;
        setLoading(true);
        setError(null);
        try {
            await updatePaymentStatus(payment.id, PaymentStatus.Completed);
            if (onPaymentUpdated) onPaymentUpdated();
            onClose();
        } catch (err: any) {
            console.error('Failed to confirm payment:', err);
            setError('Failed to update status.');
        } finally {
            setLoading(false);
        }
    };

    const isPending = payment.status === 'Pending';
    const isAdmin = currentUserRole === UserRole.Admin;
    const canConfirm = isPending && isAdmin;

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Payment Details"
            size="md"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Close
                    </Button>
                    {canConfirm && (
                        <Button variant="primary" onClick={handleConfirmPayment} loading={loading}>
                            Confirm Payment
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-gray-500">Student Name</span>
                        <span className="font-semibold text-gray-900">{payment.studentName || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500">Class</span>
                        <span className="font-semibold text-gray-900">{payment.classId || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500">Amount Paid</span>
                        <span className="font-semibold text-gray-900 text-lg">{formatCurrency(payment.amount)}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500">Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {payment.status}
                        </span>
                    </div>
                    <div>
                        <span className="block text-gray-500">RRR / Reference</span>
                        <span className="font-mono text-gray-700">{payment.rrr || payment.id}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500">Date</span>
                        <span className="text-gray-900">{new Date(payment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="block text-gray-500">Description</span>
                        <span className="text-gray-900">{payment.description}</span>
                    </div>
                </div>

                {/* Breakdown of Items Paid */}
                {payment.itemsPaid && payment.itemsPaid.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Items Breakdown</h4>
                        <ul className="space-y-1">
                            {payment.itemsPaid.map((item: any, idx: number) => (
                                <li key={idx} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.name}</span>
                                    <span className="text-gray-900 font-medium">{formatCurrency(item.amount)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {isPending && !isAdmin && (
                    <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded mt-2">
                        This payment is currently pending confirmation. Please contact the admin if this persists.
                    </p>
                )}
            </div>
        </Modal>
    );
};

export default PaymentDetailModal;
