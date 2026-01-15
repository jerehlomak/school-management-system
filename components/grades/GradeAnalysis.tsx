import React from 'react';

const GradeAnalysis: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700 text-sm">
            <div>
                <h3 className="font-bold text-gray-800 mb-2">Grade Analysis</h3>
                <ul className="list-disc list-inside">
                    <li><span className="font-semibold">A</span> 70 - 100</li>
                    <li><span className="font-semibold">B</span> 60 - 69</li>
                    <li><span className="font-semibold">C</span> 50 - 59</li>
                    <li><span className="font-semibold">D</span> 40 - 49</li>
                    <li><span className="font-semibold">F</span> 0 - 39</li>
                </ul>
            </div>
            <div>
                <h3 className="font-bold text-gray-800 mb-2">Note on Grades</h3>
                <p><span className="font-semibold">A (70-100):</span> Excellent Performance</p>
                <p><span className="font-semibold">B (60-69):</span> Very Good</p>
                <p><span className="font-semibold">C (50-59):</span> Good</p>
                <p><span className="font-semibold">D (40-49):</span> Pass</p>
                <p><span className="font-semibold">F (0-39):</span> Fail - Needs Improvement</p>
            </div>
        </div>
    );
};

export default GradeAnalysis;
