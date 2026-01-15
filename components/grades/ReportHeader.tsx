import React from 'react';
import { MOCK_SCHOOL_DETAILS } from '../../constants';

interface ReportHeaderProps {
    term: number;
}

const CURRENT_YEAR = new Date().getFullYear();

const ReportHeader: React.FC<ReportHeaderProps> = ({ term }) => {
    return (
        <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
                <img
                    src="/cocin_logo_left.png"
                    alt="COCIN Logo"
                    className="h-20 w-auto object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=Logo'; }}
                />
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-800">{MOCK_SCHOOL_DETAILS.name}</h1>
                    <p className="text-lg text-gray-700">{MOCK_SCHOOL_DETAILS.address}</p>
                    <p className="text-sm italic text-gray-600">{MOCK_SCHOOL_DETAILS.motto}</p>
                </div>
                <img
                    src="/cocin_logo_right.png"
                    alt="COCIN Logo"
                    className="h-20 w-auto object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=Logo'; }}
                />
            </div>
            <h2 className="text-xl font-bold text-gray-800 border-t pt-2 mt-2">
                {term === 1 ? "FIRST" : term === 2 ? "SECOND" : "THIRD"} TERM {CURRENT_YEAR}/{CURRENT_YEAR + 1} ACADEMIC REPORT
            </h2>
        </div>
    );
};

export default ReportHeader;
