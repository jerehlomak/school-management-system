import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Loading COCIN Danbong...</h2>
                <p className="text-gray-500 mt-2">Please wait</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
