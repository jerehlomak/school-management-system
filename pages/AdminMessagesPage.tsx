import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import { fetchContactMessages, deleteContactMessage } from '../services/apiService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Eye, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

const AdminMessagesPage: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        loadMessages(currentPage);
    }, [currentPage]);

    const loadMessages = async (page: number) => {
        setLoading(true);
        try {
            const response = await fetchContactMessages(page, ITEMS_PER_PAGE) as any;
            if (response.data) {
                setMessages(response.data);
                setTotalItems(response.total);
            } else {
                // Fallback
                setMessages(response as unknown as ContactMessage[]);
                setTotalItems((response as unknown as ContactMessage[]).length);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await deleteContactMessage(id);
            toast.success("Message deleted successfully");
            loadMessages(currentPage); // Refresh
        } catch (error) {
            toast.error("Failed to delete message");
        }
    };

    const columns = [
        { header: 'Date', accessor: (row: ContactMessage) => new Date(row.createdAt).toLocaleDateString() + ' ' + new Date(row.createdAt).toLocaleTimeString() },
        { header: 'Name', accessor: 'name' as keyof ContactMessage },
        { header: 'Email', accessor: 'email' as keyof ContactMessage },
        {
            header: 'Message',
            accessor: (row: ContactMessage) => (
                <div className="max-w-xs truncate" title={row.message}>
                    {row.message}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: (row: ContactMessage) => (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setViewMessage(row)}
                        className="text-xs flex items-center"
                    >
                        <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        className="text-xs flex items-center"
                        onClick={() => handleDelete(row._id)}
                    >
                        <Trash className="w-3 h-3 mr-1" /> Delete
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Contact Messages</h1>

            {loading ? (
                <div className="p-8">Loading messages...</div>
            ) : (
                <Table<ContactMessage>
                    data={messages}
                    columns={columns}
                    rowKey="_id"
                    itemsPerPage={ITEMS_PER_PAGE}
                    emptyMessage="No messages received yet."
                    manualPagination={true}
                    totalItems={totalItems}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* View Message Modal */}
            <Modal
                isOpen={!!viewMessage}
                onClose={() => setViewMessage(null)}
                title="Message Details"
                footer={<></>}
            >
                {viewMessage && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-bold text-gray-500">Sender</p>
                            <p className="text-lg">{viewMessage.name} <span className="text-sm text-gray-500">({viewMessage.email})</span></p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500">Date</p>
                            <p>{new Date(viewMessage.createdAt).toLocaleString()}</p>
                        </div>
                        <hr />
                        <div>
                            <p className="text-sm font-bold text-gray-500 mb-2">Message</p>
                            <div className="bg-gray-50 p-4 rounded text-gray-800 whitespace-pre-wrap">
                                {viewMessage.message}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminMessagesPage;
