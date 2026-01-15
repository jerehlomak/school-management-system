import React from 'react';
import Button from '../Button';

interface TermSelectorProps {
    selectedTerm: 1 | 2 | 3;
    onTermChange: (term: 1 | 2 | 3) => void;
    onPrint: () => void;
    loading: boolean;
}

const TermSelector: React.FC<TermSelectorProps> = ({ selectedTerm, onTermChange, onPrint, loading }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center print-button-container">
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <label htmlFor="term-select" className="text-gray-700 font-medium whitespace-nowrap">Select Term:</label>
                <select
                    id="term-select"
                    value={selectedTerm}
                    onChange={(e) => onTermChange(Number(e.target.value) as 1 | 2 | 3)}
                    className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:w-32"
                    disabled={loading}
                    aria-label="Select term"
                >
                    <option value={1}>First Term</option>
                    <option value={2}>Second Term</option>
                    <option value={3}>Third Term</option>
                </select>
            </div>
            <Button onClick={onPrint} variant="primary" className="px-6 py-2.5 w-full sm:w-auto">
                Print Result
            </Button>
        </div>
    );
};

export default TermSelector;
