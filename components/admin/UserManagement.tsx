import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, Course, SchoolClass, ClassLevel } from '../../types';
import { fetchAllUsers, verifyAdminPassword, updateUser, deleteUser } from '../../services/apiService';
import Table from '../Table';
import Button from '../Button';
import Modal from '../Modal';
import { Pencil, Trash } from 'lucide-react';

interface UserManagementProps {
    currentUser: User;
    classes: SchoolClass[];
    courses: Course[];
    classLevels: ClassLevel[];
    users: User[];
    onRefresh: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, classes, courses, classLevels, users: initialUsers, onRefresh }) => {
    const [localUsers, setLocalUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | 'all'>('all');
    const [selectedClassFilter, setSelectedClassFilter] = useState<string>('');
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('');

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [userToReset, setUserToReset] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');

    // --- Delete State ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // --- Edit State ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Sync initialUsers to localUsers initially or when Refreshed
    useEffect(() => {
        setLocalUsers(initialUsers);
    }, [initialUsers]);

    // Backend Filtering Effect
    useEffect(() => {
        const fetchFiltered = async () => {
            if (selectedClassFilter || selectedSubjectFilter) {
                setLoading(true);
                try {
                    const { fetchAllUsers } = await import('../../services/apiService');
                    const response = await fetchAllUsers(false, 1, 100, { // Fetch up to 100 for now
                        classId: selectedClassFilter,
                        subjectId: selectedSubjectFilter,
                        role: 'student' // Usually imply student when filtering by class/subject
                    });
                    setLocalUsers(response.data);
                } catch (err) {
                    console.error("Filter fetch failed", err);
                } finally {
                    setLoading(false);
                }
            } else {
                // Revert to initialUsers if no complex filters
                setLocalUsers(initialUsers);
            }
        };

        // Debounce or just call
        fetchFiltered();
    }, [selectedClassFilter, selectedSubjectFilter, initialUsers]);


    useEffect(() => {
        let currentFilteredUsers = localUsers;
        if (selectedRoleFilter !== 'all') {
            currentFilteredUsers = localUsers.filter(u => u.role === selectedRoleFilter);
        }
        setFilteredUsers(currentFilteredUsers);
    }, [localUsers, selectedRoleFilter]);

    const handleResetPasswordClick = (user: User) => {
        setUserToReset(user);
        setNewPassword(''); // or set a random default
        setIsResetModalOpen(true);
        setMessage(null);
    };

    const handleConfirmResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToReset || !newPassword) return;

        setLoading(true);
        try {
            await updateUser({ ...userToReset, password: newPassword });

            setMessage({ type: 'success', text: `Password for ${userToReset.name} updated successfully.` });
            setIsResetModalOpen(false);
            setUserToReset(null);
        } catch (err: any) {
            console.error('Password reset failed:', err);
            setMessage({ type: 'error', text: 'Failed to reset password.' });
        } finally {
            setLoading(false);
        }
    };

    // --- Delete Handlers ---
    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setLoading(true);
        try {
            await deleteUser(userToDelete.id);
            setMessage({ type: 'success', text: 'User deleted successfully' });
            onRefresh();
            setIsDeleteModalOpen(false);
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to delete user' });
        } finally { setLoading(false); setUserToDelete(null); }
    };

    // --- Edit Handlers ---
    const handleEditClick = (user: User) => {
        setUserToEdit(user);
        setEditForm({ ...user }); // Copy all user props to form
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToEdit || !editForm.id) return;
        setLoading(true);
        try {
            await updateUser(editForm as User);
            setMessage({ type: 'success', text: 'User updated successfully' });
            onRefresh();
            setIsEditModalOpen(false);
            setUserToEdit(null);
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to update user' });
        } finally { setLoading(false); }
    };



    const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
    const [transactionsUser, setTransactionsUser] = useState<User | null>(null);
    const [studentTransactions, setStudentTransactions] = useState<any[]>([]);

    const handleTransactionsClick = async (user: User) => {
        setTransactionsUser(user);
        setIsTransactionsModalOpen(true);
        setLoading(true);
        try {
            const { fetchStudentPayments } = await import('../../services/apiService');
            const payments = await fetchStudentPayments(user.id);
            setStudentTransactions(payments);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setStudentTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const userColumns = useMemo(() => ([
        { header: 'ID', accessor: 'id' as keyof User, className: 'font-semibold' },
        { header: 'Name', accessor: 'name' as keyof User },
        { header: 'Role', accessor: 'role' as keyof User },
        {
            header: 'Details', accessor: (row: User) => {
                if (row.role === UserRole.Student) {
                    const className = classes.find(c => c.id === row.classId)?.name || row.classId;
                    return (
                        <div className="text-xs">
                            <p>Class: {className || 'N/A'}</p>
                            <p>Adm: {row.admissionYear || 'N/A'}</p>
                        </div>
                    );
                }
                return 'N/A';
            }
        },
        {
            header: 'Actions',
            accessor: (row: User) => (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditClick(row)}
                        className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPasswordClick(row)}
                        className="text-xs"
                    >
                        Reset PWD
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteClick(row)}
                        className="text-xs"
                    >
                        <Trash className="w-3 h-3" />
                    </Button>
                    {row.role === UserRole.Student && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleTransactionsClick(row)}
                            className="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200"
                        >
                            History
                        </Button>
                    )}
                </div>
            )
        },
    ]), [classes, courses, classLevels, initialUsers]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">All Users</h3>

            {/* Filters ... (same as before) */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-4">
                {/* ... Keep filter UI ... */}
                <div className="flex flex-wrap gap-2">
                    <Button variant={selectedRoleFilter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedRoleFilter('all')}>All</Button>
                    <Button variant={selectedRoleFilter === UserRole.Student ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedRoleFilter(UserRole.Student)}>Students</Button>
                    <Button variant={selectedRoleFilter === UserRole.Teacher ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedRoleFilter(UserRole.Teacher)}>Teachers</Button>
                    <Button variant={selectedRoleFilter === UserRole.Parent ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedRoleFilter(UserRole.Parent)}>Parents</Button>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="w-full md:w-auto">
                        <select
                            className="block w-full p-2 border border-gray-300 rounded-md text-sm"
                            value={selectedClassFilter}
                            onChange={(e) => {
                                setSelectedClassFilter(e.target.value);
                                if (e.target.value) setSelectedRoleFilter(UserRole.Student);
                            }}
                        >
                            <option value="">Filter by Class...</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Showing {filteredUsers.length} users</span>
                <Button variant="secondary" size="sm" onClick={onRefresh}>Refresh Data</Button>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {loading && !isResetModalOpen && !isTransactionsModalOpen ? <div className="text-center py-4">Loading...</div> : (
                <Table data={filteredUsers} columns={userColumns} rowKey="id" emptyMessage="No users found." />
            )}

            {/* Reset Password Modal */}
            <Modal
                isOpen={isResetModalOpen}
                onClose={() => {
                    setIsResetModalOpen(false);
                    setUserToReset(null);
                }}
                title={`Reset Password for ${userToReset?.name}`}
                size="sm"
                footer={
                    <Button onClick={handleConfirmResetPassword} loading={loading} variant="primary">
                        Update Password
                    </Button>
                }
            >
                {/* ... form ... */}
                <form onSubmit={handleConfirmResetPassword} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter new password"
                            required
                            minLength={6}
                        />
                    </div>
                </form>
            </Modal>

            {/* Transactions History Modal */}
            <Modal
                isOpen={isTransactionsModalOpen}
                onClose={() => setIsTransactionsModalOpen(false)}
                title={`Transaction History - ${transactionsUser?.name}`}
                size="md"
                footer={<></>}
            >
                <div className="space-y-4">
                    {studentTransactions.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No transactions found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {studentTransactions.map((tx: any) => (
                                        <tr key={tx.id}>
                                            <td className="px-3 py-2 text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="px-3 py-2 text-xs text-gray-900">{tx.term}</td>
                                            <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(tx.amount)}
                                            </td>
                                            <td className="px-3 py-2 text-xs">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${tx.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit ${userToEdit?.role}`}
                footer={
                    <>
                        <Button variant="primary" onClick={handleUpdateUser} loading={loading}>Save Changes</Button>
                    </>
                }
            >
                {userToEdit && (
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" className="w-full border p-2 rounded"
                                value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" className="w-full border p-2 rounded"
                                value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="text" className="w-full border p-2 rounded"
                                value={editForm.phoneNumber || ''} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} />
                        </div>
                        {userToEdit.role === UserRole.Student && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class</label>
                                <select className="w-full border p-2 rounded"
                                    value={editForm.classId || ''} onChange={e => setEditForm({ ...editForm, classId: e.target.value })}>
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                    </form>
                )}
            </Modal>

            {/* Delete User Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete User"
                footer={<Button variant="danger" onClick={confirmDelete} loading={loading}>Delete User</Button>}
            >
                <p>Are you sure you want to delete <b>{userToDelete?.name}</b>?</p>
                <p className="text-sm text-red-600 mt-2">This action is permanent and may affect linked data (e.g. grades, payments).</p>
            </Modal>
        </div>
    );
};

export default UserManagement;
