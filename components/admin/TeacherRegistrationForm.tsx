import React, { useState } from 'react';
import { Course, ClassLevel } from '../../types';
import { registerTeacher, uploadImage } from '../../services/apiService';
import Button from '../Button';

interface TeacherRegistrationFormProps {
    courses: Course[];
    classLevels: ClassLevel[];
    onSuccess: () => void;
    onError: (message: string) => void;
}

const TeacherRegistrationForm: React.FC<TeacherRegistrationFormProps> = ({ courses, classLevels, onSuccess, onError }) => {
    const [teacherName, setTeacherName] = useState('');
    const [teacherEmail, setTeacherEmail] = useState('');
    const [teacherImageFile, setTeacherImageFile] = useState<File | null>(null);
    const [teacherPhoneNumber, setTeacherPhoneNumber] = useState('');
    const [selectedSubjectsTaught, setSelectedSubjectsTaught] = useState<string[]>([]);
    const [selectedClassLevelsTaught, setSelectedClassLevelsTaught] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [newCredentials, setNewCredentials] = useState<{ id: string, password: string } | null>(null);

    const handleTeacherRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNewCredentials(null);

        if (!teacherName.trim() || !teacherEmail.trim() || !teacherPhoneNumber.trim() || selectedSubjectsTaught.length === 0 || selectedClassLevelsTaught.length === 0) {
            onError('Please fill in all required teacher fields, including phone number, and select at least one subject and one class level.');
            setLoading(false);
            return;
        }

        try {
            let imageUrl = '';
            if (teacherImageFile) {
                imageUrl = await uploadImage(teacherImageFile);
            }

            const { user: newTeacher, password: teacherPassword } = await registerTeacher(
                teacherName,
                teacherEmail,
                selectedSubjectsTaught,
                selectedClassLevelsTaught,
                teacherPhoneNumber,
                imageUrl
            );
            setNewCredentials({ id: newTeacher.id, password: teacherPassword });
            setTeacherName('');
            setTeacherEmail('');
            setTeacherImageFile(null);
            setTeacherPhoneNumber('');
            setSelectedSubjectsTaught([]);
            setSelectedClassLevelsTaught([]);
            onSuccess();
        } catch (err: any) {
            onError(err.message || 'Failed to register teacher.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleTeacherRegistration} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">New Teacher Registration</h3>
            <div>
                <label htmlFor="teacher-name" className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="teacher-name" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="teacher-email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="teacher-email" value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="teacher-image" className="block text-sm font-medium text-gray-700">Profile Image (Optional)</label>
                <input
                    type="file"
                    id="teacher-image"
                    accept="image/*"
                    onChange={(e) => setTeacherImageFile(e.target.files ? e.target.files[0] : null)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>
            <div>
                <label htmlFor="teacher-phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" id="teacher-phone" value={teacherPhoneNumber} onChange={(e) => setTeacherPhoneNumber(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="border p-4 rounded-md bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-2">Subjects Taught</h4>
                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {courses.map(course => (
                            <div key={course.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`teacher-subject-${course.id}`}
                                    checked={selectedSubjectsTaught.includes(course.id)}
                                    onChange={(e) => {
                                        setSelectedSubjectsTaught(prev =>
                                            e.target.checked ? [...prev, course.id] : prev.filter(id => id !== course.id)
                                        );
                                    }}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor={`teacher-subject-${course.id}`} className="ml-2 text-sm text-gray-700">{course.name} ({course.code})</label>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-gray-600">No subjects available.</p>}
            </div>

            <div className="border p-4 rounded-md bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-2">Class Levels Taught</h4>
                {classLevels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {classLevels.map(classLevel => (
                            <div key={classLevel.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`teacher-class-level-${classLevel.id}`}
                                    checked={selectedClassLevelsTaught.includes(classLevel.id)}
                                    onChange={(e) => {
                                        setSelectedClassLevelsTaught(prev =>
                                            e.target.checked ? [...prev, classLevel.id] : prev.filter(id => id !== classLevel.id)
                                        );
                                    }}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor={`teacher-class-level-${classLevel.id}`} className="ml-2 text-sm text-gray-700">{classLevel.name}</label>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-gray-600">No class levels available.</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full">
                Register Teacher
            </Button>
            {newCredentials && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                    <p className="font-semibold">Teacher Registered!</p>
                    <p>ID: <span className="font-mono">{newCredentials.id}</span></p>
                    <p>Password: <span className="font-mono">{newCredentials.password}</span></p>
                    <p className="text-sm mt-1">Please note these credentials securely.</p>
                </div>
            )}
        </form>
    );
};

export default TeacherRegistrationForm;
