
import React, { useState, useEffect } from 'react';
import { SchoolClass, ClassLevel } from '../../types';
import { fetchClassLevels, fetchFeeStructure, saveFeeStructure } from '../../services/apiService';
import Button from '../Button';

interface FeeItem {
    name: string;
    amount: number;
    isCompulsory: boolean;
    isTuition: boolean;
}

const ManageFeeStructure: React.FC = () => {
    const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
    const [selectedClassLevel, setSelectedClassLevel] = useState<string>('');
    const [selectedTerm, setSelectedTerm] = useState<number>(1);
    const [feeItems, setFeeItems] = useState<FeeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const loadLevels = async () => {
            try {
                const levels = await fetchClassLevels();
                setClassLevels(levels);
            } catch (err) {
                console.error("Failed to load class levels");
            }
        }
        loadLevels();
    }, []);

    const handleFetchStructure = async () => {
        if (!selectedClassLevel) return;
        setLoading(true);
        try {
            // Fetch existing structure or load default
            // Since our fetchFeeStructure api service expects classId, not classLevelId, 
            // and we don't have a direct endpoint for classLevelId in the API service yet (except specific custom logic),
            // We will just initialize with a default template for now to allow Overwriting.
            // In a real app we'd fetch specific structure by level.
            setFeeItems([
                { name: "Tuition", amount: 0, isCompulsory: true, isTuition: true },
                { name: "Development Levy", amount: 0, isCompulsory: true, isTuition: false },
                { name: "ICT Fee", amount: 0, isCompulsory: true, isTuition: false }
            ]);
            setMessage({ type: 'success', text: 'Loaded new template.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setFeeItems([...feeItems, { name: '', amount: 0, isCompulsory: true, isTuition: false }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...feeItems];
        newItems.splice(index, 1);
        setFeeItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof FeeItem, value: any) => {
        const newItems = [...feeItems];
        if (field === 'isTuition' && value === true) {
            newItems.forEach(item => item.isTuition = false);
        }
        (newItems[index] as any)[field] = value;
        setFeeItems(newItems);
    };

    const handleSave = async () => {
        if (!selectedClassLevel) {
            setMessage({ type: 'error', text: 'Please select a class level.' });
            return;
        }
        const hasTuition = feeItems.some(i => i.isTuition);
        if (!hasTuition) {
            setMessage({ type: 'error', text: 'You must designate one item as Tuition.' });
            return;
        }

        setSaving(true);
        try {
            await saveFeeStructure({
                classLevelId: selectedClassLevel,
                term: Number(selectedTerm),
                itemGroups: feeItems
            });
            setMessage({ type: 'success', text: 'Fee Structure Saved Successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save fee structure.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Manage Fee Structure</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Class Level</label>
                    <select
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        value={selectedClassLevel}
                        onChange={(e) => setSelectedClassLevel(e.target.value)}
                    >
                        <option value="">Select Level...</option>
                        {classLevels.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Term</label>
                    <select
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(Number(e.target.value))}
                    >
                        <option value={1}>Term 1</option>
                        <option value={2}>Term 2</option>
                        <option value={3}>Term 3</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <Button onClick={handleFetchStructure} disabled={!selectedClassLevel}>New Template</Button>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold w-1/3">Item Name</span>
                    <span className="font-semibold w-1/4">Amount (₦)</span>
                    <span className="font-semibold w-1/6 text-center">Compulsory</span>
                    <span className="font-semibold w-1/6 text-center">Is Tuition</span>
                    <span className="w-10"></span>
                </div>
                {feeItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center gap-2">
                        <input
                            type="text"
                            className="w-1/3 p-2 border border-gray-300 rounded"
                            placeholder="e.g. ICT Fee"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        />
                        <input
                            type="number"
                            className="w-1/4 p-2 border border-gray-300 rounded"
                            value={item.amount}
                            onChange={(e) => handleItemChange(index, 'amount', Number(e.target.value))}
                        />
                        <div className="w-1/6 flex justify-center">
                            <input
                                type="checkbox"
                                checked={item.isCompulsory}
                                onChange={(e) => handleItemChange(index, 'isCompulsory', e.target.checked)}
                                className="h-4 w-4 text-blue-600"
                            />
                        </div>
                        <div className="w-1/6 flex justify-center">
                            <input
                                type="radio"
                                checked={item.isTuition}
                                onChange={(e) => handleItemChange(index, 'isTuition', true)}
                                className="h-4 w-4 text-blue-600"
                            />
                        </div>
                        <button
                            onClick={() => handleRemoveItem(index)}
                            className="w-10 text-red-500 hover:text-red-700"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex gap-4">
                <Button variant="outline" onClick={handleAddItem}>+ Add Item</Button>
                <Button variant="primary" onClick={handleSave} loading={saving} disabled={feeItems.length === 0}>Save Fee Structure</Button>
            </div>
        </div>
    );
};

export default ManageFeeStructure;
