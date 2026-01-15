import React, { useState } from 'react';
import { User } from '../../types';
import { registerParent } from '../../services/apiService';
import Button from '../Button';

interface ParentRegistrationFormProps {
    studentsWithoutParents: User[];
    onSuccess: () => void;
    onError: (message: string) => void;
}

const ParentRegistrationForm: React.FC<ParentRegistrationFormProps> = ({ studentsWithoutParents, onSuccess, onError }) => {
    const [parentName, setParentName] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [parentPhoneNumber, setParentPhoneNumber] = useState('');
    const [parentStudentsToLink, setParentStudentsToLink] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [newCredentials, setNewCredentials] = useState<{ id: string, password: string } | null>(null);

    const handleParentRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNewCredentials(null);

        if (!parentName.trim() || !parentEmail.trim() || !parentPhoneNumber.trim()) {
            onError('Please fill in all required parent fields, including phone number.');
            setLoading(false);
            return;
        }

        try {
            const { user: newParent, password: parentPassword } = await registerParent(
                parentName,
                parentEmail,
                parentPhoneNumber,
                parentStudentsToLink.length > 0 ? parentStudentsToLink : undefined
            );
            setNewCredentials({ id: newParent.id, password: parentPassword });
            setParentName('');
            setParentEmail('');
            setParentPhoneNumber('');
            setParentStudentsToLink([]);
            onSuccess();
        } catch (err: any) {
            onError(err.message || 'Failed to register parent.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleParentRegistration} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">New Parent Registration</h3>
            <div>
                <label htmlFor="parent-name" className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="parent-name" value={parentName} onChange={(e) => setParentName(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="parent-email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="parent-email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="parent-phone" className="block text-sm font-medium text-gray-700">Phone Number (Also used for student passwords)</label>
                <input type="tel" id="parent-phone" value={parentPhoneNumber} onChange={(e) => setParentPhoneNumber(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" pattern="[0-9]{10,11}" title="Phone number must be 10 or 11 digits" />
            </div>
            <div className="border p-4 rounded-md bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-2">Link Existing Students (Optional)</h4>
                {studentsWithoutParents.length > 0 ? (
                    <div className="space-y-1">
                        {studentsWithoutParents.map(student => (
                            <div key={student.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`link-student-${student.id}`}
                                    checked={parentStudentsToLink.includes(student.id)}
                                    onChange={(e) => {
                                        setParentStudentsToLink(prev =>
                                            e.target.checked ? [...prev, student.id] : prev.filter(id => id !== student.id)
                                        );
                                    }}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor={`link-student-${student.id}`} className="ml-2 text-sm text-gray-700">{student.name} ({student.id})</label>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-gray-600">No unlinked students found.</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full">
                Register Parent
            </Button>
            {newCredentials && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                    <p className="font-semibold">Parent Registered!</p>
                    <p>ID: <span className="font-mono">{newCredentials.id}</span></p>
                    <p>Password: <span className="font-mono">{newCredentials.password}</span></p>
                    <p className="text-sm mt-1">Please note these credentials securely.</p>
                </div>
            )}
        </form>
    );
};

export default ParentRegistrationForm;
