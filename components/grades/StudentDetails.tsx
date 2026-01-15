import React from 'react';
import { User } from '../../types';
import { MOCK_SCHOOL_DETAILS } from '../../constants';

interface StudentDetailsProps {
    user: User;
    term: number;
    positionInClass: string;
    classAverage: string;
    cumulativeAverage: string;
    averageScore: string;
    promotionStatus: string;
    promotedToClass: string;
    currentClassName: string;
    totalSubjects: number;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({
    user,
    term,
    positionInClass,
    classAverage,
    cumulativeAverage,
    averageScore,
    promotionStatus,
    promotedToClass,
    currentClassName,
    totalSubjects,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-8 text-gray-700 text-sm">
            <p><span className="font-semibold">Full Name:</span> {user.name}</p>
            <p><span className="font-semibold">Reg No:</span> {user.id}</p>
            <p><span className="font-semibold">Term:</span> {term === 1 ? "First" : term === 2 ? "Second" : "Third"}</p>
            <p><span className="font-semibold">Session:</span> {MOCK_SCHOOL_DETAILS.session}</p>
            <p><span className="font-semibold">Position in Class:</span> {positionInClass}</p>
            <p><span className="font-semibold">Class Average:</span> {classAverage}</p>
            <p><span className="font-semibold">Cumulative Average:</span> {cumulativeAverage}</p>
            <p><span className="font-semibold">Average Score:</span> {averageScore}</p>
            <p><span className="font-semibold">Promotion Status:</span> {promotionStatus}</p>
            <p><span className="font-semibold">Promoted to Class:</span> {promotedToClass}</p>
            <p><span className="font-semibold">Class:</span> {currentClassName}</p>
            <p><span className="font-semibold">Admission Year:</span> {user.admissionYear || 'N/A'}</p>
            <p><span className="font-semibold">No of Subjects:</span> {totalSubjects}</p>
        </div>
    );
};

export default StudentDetails;
