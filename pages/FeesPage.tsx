
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { fetchAllUsers, fetchFeeStructure } from '../services/apiService';

interface FeesPageProps {
  user: User;
}

interface FeeItem {
  name: string;
  amount: number;
  isCompulsory: boolean;
  isTuition: boolean;
}

const FeesPage: React.FC<FeesPageProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Payment Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [payTerm, setPayTerm] = useState<number>(1);
  const [payYear, setPayYear] = useState<number>(new Date().getFullYear());

  // Advanced Fee Structure State
  const [feeStructure, setFeeStructure] = useState<FeeItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isPartPayment, setIsPartPayment] = useState(false);
  const [customTuitionAmount, setCustomTuitionAmount] = useState<number>(0);
  const [totalPayable, setTotalPayable] = useState<number>(0);

  // Remita RRR State
  const [rrrInfo, setRrrInfo] = useState<{ rrr: string; paymentLink: string; amount: number } | null>(null);
  const [isRRRModalOpen, setIsRRRModalOpen] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      const usersResponse = await fetchAllUsers();
      setAllUsers(usersResponse.data || []);
    };
    loadUsers();
  }, []);

  // Fetch fee structure when student/class/term changes
  const loadFeeStructure = useCallback(async () => {
    const studentId = user.role === UserRole.Student ? user.id : selectedStudentId;

    if (!studentId) return;

    try {
      setLoading(true);
      // Determine student's class (mock logic: find user and get classId)
      // Ideally backend resolves this via studentId, but for now we trust the client logic or fetch user details
      const student = allUsers.find(u => u.id === studentId) || user;

      if (!student.classId) {
        // If no class, can't fetch structure
        setFeeStructure([]);
        return;
      }

      const { fetchFeeStructure } = await import('../services/apiService');
      const structure = await fetchFeeStructure(student.classId, payTerm);

      if (structure && structure.items) {
        setFeeStructure(structure.items);
        // Default selection: all compulsory items
        setSelectedItems(structure.items.filter((i: FeeItem) => i.isCompulsory).map((i: FeeItem) => i.name));

        // Initialize custom tuition default
        const tuition = structure.items.find((i: FeeItem) => i.isTuition);
        if (tuition) {
          setCustomTuitionAmount(tuition.amount);
        }
      } else {
        setFeeStructure([]);
      }
    } catch (err) {
      console.error("Failed to load fee structure", err);
      // Fallback/Silent fail -> empty structure
    } finally {
      setLoading(false);
    }
  }, [user, selectedStudentId, payTerm, allUsers]); // Added dependencies

  useEffect(() => {
    if (selectedStudentId || user.role === UserRole.Student) {
      loadFeeStructure();
    }
  }, [selectedStudentId, payTerm, payYear, loadFeeStructure]);

  // Recalculate Total
  useEffect(() => {
    let total = 0;
    feeStructure.forEach(item => {
      if (selectedItems.includes(item.name)) {
        if (item.isTuition && isPartPayment) {
          total += Number(customTuitionAmount) || 0;
        } else {
          total += item.amount;
        }
      }
    });
    setTotalPayable(total);
  }, [selectedItems, isPartPayment, customTuitionAmount, feeStructure]);


  const handleItemToggle = (itemName: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemName)) {
        return prev.filter(n => n !== itemName);
      } else {
        return [...prev, itemName];
      }
    });
  };

  const handleGenerateRRR = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (user.role === UserRole.Parent && !selectedStudentId) {
        setError("Please select a child to pay for.");
        setLoading(false);
        return;
      }

      // Validation: Min 50% Tuition
      if (isPartPayment) {
        const tuitionItem = feeStructure.find(i => i.isTuition);
        if (tuitionItem && selectedItems.includes(tuitionItem.name)) {
          if (customTuitionAmount < tuitionItem.amount * 0.5) {
            setError(`Minimum part payment for tuition is 50% (₦${(tuitionItem.amount * 0.5).toLocaleString()})`);
            setLoading(false);
            return;
          }
          if (customTuitionAmount > tuitionItem.amount) {
            setError(`Part payment cannot exceed the full tuition amount (₦${tuitionItem.amount.toLocaleString()})`);
            setLoading(false);
            return;
          }
        }
      }

      const studentIdToPayFor = user.role === UserRole.Student ? user.id : selectedStudentId;

      // Import API dynamically
      const { generateRemitaRRR } = await import('../services/apiService');

      // Construct detailed items list for backend
      const itemsToPay = feeStructure.filter(i => selectedItems.includes(i.name)).map(i => ({
        name: i.name,
        amount: i.isTuition && isPartPayment ? Number(customTuitionAmount) : i.amount
      }));

      const response = await generateRemitaRRR(
        studentIdToPayFor,
        totalPayable,
        `School Fees - Term ${payTerm} ${payYear}`,
        payTerm,
        payYear,
        itemsToPay,
        isPartPayment
      );

      setRrrInfo(response);
      setIsRRRModalOpen(true);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate RRR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Pay School Fees</h2>

      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-6 text-gray-700">Payment Details</h3>

        <form onSubmit={handleGenerateRRR} className="space-y-6">
          {user.role === UserRole.Parent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Child</label>
              <select
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                <option value="">-- Select Child --</option>
                {allUsers.filter(u => user.studentIds?.includes(u.id)).map(st => (
                  <option key={st.id} value={st.id}>{st.name} ({st.id})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
              <select
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={payTerm}
                onChange={(e) => setPayTerm(Number(e.target.value))}
              >
                <option value={1}>Term 1</option>
                <option value={2}>Term 2</option>
                <option value={3}>Term 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input
                type="number"
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={payYear}
                onChange={(e) => setPayYear(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Fee Prospectus Section */}
          {feeStructure.length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Fee Breakdown (Prospectus)</h4>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₦)</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feeStructure.map((item) => (
                      <tr key={item.name} className={item.isCompulsory ? "bg-gray-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name} {item.isCompulsory && <span className="text-red-500 text-xs ml-1">(Compulsory)</span>}
                          {item.isTuition && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded ml-2">Tuition</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.name)}
                            onChange={() => !item.isCompulsory && handleItemToggle(item.name)}
                            disabled={item.isCompulsory}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Part Payment Logic */}
          {selectedItems.includes("Tuition") && (
            <div className="flex items-center space-x-3 mt-4 bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <input
                type="checkbox"
                id="partPayment"
                checked={isPartPayment}
                onChange={(e) => setIsPartPayment(e.target.checked)}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <label htmlFor="partPayment" className="block text-sm font-medium text-yellow-800">
                  Make Part Payment for Tuition?
                </label>
                <p className="text-xs text-yellow-700">Minimum 50% of tuition is required.</p>
              </div>
            </div>
          )}

          {isPartPayment && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter Tuition Amount to Pay</label>
              <input
                type="number"
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={customTuitionAmount}
                onChange={(e) => setCustomTuitionAmount(Number(e.target.value))}
              />
              {/* Helper text showing range */}
              {feeStructure.find(i => i.isTuition) && (
                <p className="text-xs text-gray-500 mt-1">
                  Min: ₦{(feeStructure.find(i => i.isTuition)!.amount * 0.5).toLocaleString()} — Max: ₦{feeStructure.find(i => i.isTuition)!.amount.toLocaleString()}
                </p>
              )}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
            <div className="flex justify-between items-center text-blue-900">
              <span className="font-semibold">Total Amount Payable:</span>
              <span className="text-xl font-bold">₦{totalPayable.toLocaleString()}</span>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button type="submit" loading={loading} variant="primary" className="w-full py-3 text-lg" disabled={totalPayable <= 0}>
            Generate Remita RRR
          </Button>
        </form>
      </div>

      <Modal
        isOpen={isRRRModalOpen}
        onClose={() => setIsRRRModalOpen(false)}
        title="Remita Payment Generated"
        size="sm"
      >
        {rrrInfo && (
          <div className="space-y-4 text-center">
            <div className="bg-green-50 text-green-800 p-4 rounded-full inline-block mx-auto mb-2">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">RRR Generated Successfully!</h3>

            <div className="bg-gray-100 p-4 rounded-md my-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Remita Retrieval Reference</p>
              <p className="text-3xl font-mono font-bold tracking-wider text-blue-600">{rrrInfo.rrr}</p>
            </div>

            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded text-left space-y-1">
              <p><strong>Amount:</strong> ₦{rrrInfo.amount.toLocaleString()}</p>
              {/* <p><strong>Items:</strong> {feeStructure.filter(i => selectedItems.includes(i.name)).map(i => i.name).join(', ')}</p> */}
            </div>

            <p className="text-gray-600">
              Please use this RRR to complete your payment at any bank branch or online via Remita.
            </p>

            <div className="pt-4 space-y-3">
              <a
                href={rrrInfo.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              >
                Pay Now on Remita
              </a>
              <button
                onClick={() => setIsRRRModalOpen(false)}
                className="block w-full text-gray-600 hover:text-gray-800 font-medium py-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeesPage;