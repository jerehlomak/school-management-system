
import React, { useState } from 'react';
import Button from './Button';
import { generateRemitaRRR, addPayment, updatePaymentStatus } from '../services/apiService';
import { FeePayment, PaymentStatus, User } from '../types';
import Modal from './Modal';

interface RemitaPaymentFormProps {
  student: User;
  onPaymentSuccess: (payment: FeePayment) => void;
}

const RemitaPaymentForm: React.FC<RemitaPaymentFormProps> = ({ student, onPaymentSuccess }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rrrInfo, setRrrInfo] = useState<{ rrr: string; paymentLink: string; amount: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMockPayment, setCurrentMockPayment] = useState<FeePayment | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount === '' || amount <= 0 || !description.trim()) {
      setError('Please enter a valid amount and description.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create a pending payment record
      const newPayment: Omit<FeePayment, 'id'> = {
        studentId: student.id,
        amount: amount as number,
        description: description,
        term: 1, // Default to term 1 for now if not selected
        year: new Date().getFullYear(),
        date: new Date().toISOString().split('T')[0],
        status: PaymentStatus.Pending,
      };
      const addedPayment = await addPayment(newPayment);
      setCurrentMockPayment(addedPayment); // Store for later update

      // 2. Simulate RRR generation
      const generatedRrr = await generateRemitaRRR(student.id, amount as number, description);
      setRrrInfo(generatedRrr);
      setIsModalOpen(true);

      // 3. Update the pending payment with RRR (still pending for actual payment)
      if (addedPayment) {
        await updatePaymentStatus(addedPayment.id, PaymentStatus.Pending, generatedRrr.rrr);
      }

    } catch (err) {
      console.error('Payment initiation error:', err);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePaymentCompletion = async () => {
    if (currentMockPayment && rrrInfo) {
      setLoading(true);
      try {
        // Simulate actual payment completion
        const updatedPayment = await updatePaymentStatus(currentMockPayment.id, PaymentStatus.Completed, rrrInfo.rrr);
        if (updatedPayment) {
          onPaymentSuccess(updatedPayment);
          setIsModalOpen(false);
          setRrrInfo(null);
          setCurrentMockPayment(null);
          setAmount('');
          setDescription('');
        } else {
          setError('Failed to update payment status to completed.');
        }
      } catch (err) {
        console.error('Error simulating payment completion:', err);
        setError('Error completing payment. Please check console.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Initiate School Fees Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (NGN)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="1"
            step="any"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
            aria-label="Payment amount in NGN"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
            aria-label="Payment description"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Generate Remita RRR
        </Button>
      </form>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Remita Payment Details"
        size="sm"
        footer={
          <Button
            onClick={handleSimulatePaymentCompletion}
            loading={loading}
            variant="primary"
          >
            Simulate Payment Success
          </Button>
        }
      >
        {rrrInfo && (
          <div className="space-y-3 text-gray-700">
            <p className="text-lg font-semibold text-gray-800">
              Your Remita Retrieval Reference (RRR) has been generated!
            </p>
            <p>
              <span className="font-medium">RRR:</span>{' '}
              <span className="font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                {rrrInfo.rrr}
              </span>
            </p>
            <p>
              <span className="font-medium">Amount:</span>{' '}
              <span className="font-bold text-green-600">
                ₦{rrrInfo.amount.toLocaleString()}
              </span>
            </p>
            <p>
              Click the link below to proceed with payment on Remita:
            </p>
            <a
              href={rrrInfo.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:underline hover:text-blue-800 font-medium"
            >
              Go to Remita Payment Page
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
            <p className="text-sm text-gray-500 mt-4">
              Note: This is a simulation. In a real application, you would be redirected to Remita to complete the payment.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RemitaPaymentForm;
