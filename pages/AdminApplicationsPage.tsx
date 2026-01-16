import React, { useState, useEffect } from 'react';
import { Application } from '../types';
import Table from '../components/Table';
import { fetchApplications, updateApplicationStatus } from '../services/apiService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Eye, Check, X, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminApplicationsPage: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [viewApp, setViewApp] = useState<Application | null>(null);
    const [approveApp, setApproveApp] = useState<Application | null>(null);
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        loadApplications(currentPage);
    }, [currentPage]);

    const loadApplications = async (page: number) => {
        setLoading(true);
        try {
            const response = await fetchApplications(page, ITEMS_PER_PAGE) as any;
            // Handle Paginated Response
            if (response.data) {
                setApplications(response.data);
                setTotalItems(response.total);
            } else {
                // Fallback for non-paginated (array)
                setApplications(response as Application[]);
                setTotalItems((response as Application[]).length);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this application?')) return;
        try {
            await updateApplicationStatus(id, 'Rejected');
            updateLocalStatus(id, 'Rejected');
            toast.success("Application rejected successfully");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const initiateApprove = (app: Application) => {
        setApproveApp(app);
        setInterviewDate('');
        setInterviewTime('09:00'); // Default time
    };

    const confirmApprove = async () => {
        if (!approveApp || !interviewDate || !interviewTime) {
            toast.info("Please select an interview date and time.");
            return;
        }
        setSubmitting(true);
        try {
            const fullDate = new Date(`${interviewDate}T${interviewTime}`);
            await updateApplicationStatus(approveApp.id, 'Approved', { interviewDate: fullDate });
            updateLocalStatus(approveApp.id, 'Approved');
            setApproveApp(null);
            toast.success("Application approved and email sent!");
        } catch (error: any) {
            console.error(error);
            toast.error(`Failed to approve application: ${error.message || "Unknown error"}`);
        } finally {
            setSubmitting(false);
        }
    };

    const updateLocalStatus = (id: string, newStatus: 'Approved' | 'Rejected') => {
        setApplications(apps => apps.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        ));
    };

    if (loading) return <div className="p-8">Loading applications...</div>;

    const columns = [
        { header: 'Applicant', accessor: (row: Application) => `${row.firstName} ${row.lastName}` },
        { header: 'Grade', accessor: 'grade' as keyof Application },
        { header: 'Parent', accessor: 'parentName' as keyof Application },
        { header: 'Date', accessor: (row: Application) => new Date(row.submissionDate).toLocaleDateString() },
        {
            header: 'Status',
            accessor: (row: Application) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    row.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (row: Application) => (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setViewApp(row)}
                        className="text-xs flex items-center"
                    >
                        <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                    {row.status === 'Pending' && (
                        <>
                            <Button
                                variant="primary"
                                size="sm"
                                className="text-xs bg-green-600 hover:bg-green-700 border-green-600 flex items-center"
                                onClick={() => initiateApprove(row)}
                            >
                                <Check className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                className="text-xs flex items-center"
                                onClick={() => handleReject(row.id)}
                            >
                                <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Student Applications</h1>
            <Table<Application>
                data={applications}
                columns={columns}
                rowKey="id"
                itemsPerPage={ITEMS_PER_PAGE}
                emptyMessage="No applications received yet."
                manualPagination={true}
                totalItems={totalItems}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
            />

            {/* View Details Modal */}
            <Modal
                isOpen={!!viewApp}
                onClose={() => setViewApp(null)}
                title="Application Details"
                size="lg"
                footer={<></>}
            >
                {viewApp && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-gray-700">Student Info</h4>
                                <p>Name: {viewApp.firstName} {viewApp.middleName} {viewApp.lastName}</p>
                                <p>DOB: {new Date(viewApp.dateOfBirth).toLocaleDateString()}</p>
                                <p>Gender: {viewApp.gender}</p>
                                <p>Grade: {viewApp.grade}</p>
                                <p>Prev School: {viewApp.prevSchool || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700">Parent/Guardian</h4>
                                <p>Name: {viewApp.parentName}</p>
                                <p>Email: {viewApp.parentEmail}</p>
                                <p>Phone: {viewApp.parentPhone}</p>
                                <p>Address: {viewApp.address}</p>
                            </div>
                        </div>

                        {viewApp.medicalInfo && (
                            <div>
                                <h4 className="font-semibold text-gray-700">Medical Info</h4>
                                <p className="text-sm bg-gray-50 p-2 rounded">{viewApp.medicalInfo}</p>
                            </div>
                        )}

                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Documents</h4>
                            <div className="flex flex-wrap gap-2">
                                {viewApp.passportUrl && (
                                    <a href={viewApp.passportUrl} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">
                                        <Eye className="w-3 h-3" /> Passport
                                    </a>
                                )}
                                {viewApp.documentUrls?.map((doc, idx) => (
                                    <a key={idx} href={doc} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                                        <Eye className="w-3 h-3" /> Document {idx + 1}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Approve Modal */}
            <Modal
                isOpen={!!approveApp}
                onClose={() => setApproveApp(null)}
                title={`Approve Application - ${approveApp?.firstName} ${approveApp?.lastName}`}
                footer={
                    <>
                        <Button variant="primary" onClick={confirmApprove} loading={submitting}>
                            Confirm & Send Email
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Please schedule an interview/exam date for this student. An email will be sent to the parent (<b>{approveApp?.parentEmail}</b>) with these details.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="date"
                                className="w-full border p-2 rounded mt-1"
                                value={interviewDate}
                                onChange={(e) => setInterviewDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Time</label>
                            <input
                                type="time"
                                className="w-full border p-2 rounded mt-1"
                                value={interviewTime}
                                onChange={(e) => setInterviewTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminApplicationsPage;
