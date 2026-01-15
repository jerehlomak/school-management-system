import React from 'react';
import { MOCK_SCHOOL_DETAILS } from '../../constants';

const ReportFooter: React.FC = () => {
    return (
        <div className="mt-8 text-gray-700 text-sm">
            <p className="mb-2"><span className="font-semibold">FORM TEACHER:</span> {MOCK_SCHOOL_DETAILS.teacherName}</p>
            <p className="mb-2"><span className="font-semibold">FORM TEACHER'S REMARK:</span> __________________________________________________</p>
            <p><span className="font-semibold">PRINCIPAL'S REMARK:</span> __________________________________________________</p>
        </div>
    );
};

export default ReportFooter;
