
import React, { lazy, Suspense } from 'react';

const ManageFeeStructure = lazy(() => import('../components/admin/ManageFeeStructure'));

const AdminFeesPage: React.FC = () => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Fee Structure Management</h2>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <ManageFeeStructure />
            </Suspense>
        </div>
    );
};

export default AdminFeesPage;
