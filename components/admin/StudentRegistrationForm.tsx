import React, { useState, useMemo } from 'react';
import { User, Course, SchoolClass } from '../../types';
import { registerStudent, uploadImage } from '../../services/apiService';
import Button from '../Button';

interface StudentRegistrationFormProps {
    classes: SchoolClass[];
    courses: Course[];
    parentsList: User[];
    onSuccess: () => void;
    onError: (message: string) => void;
}

const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({ classes, courses, parentsList, onSuccess, onError }) => {
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentImageFile, setStudentImageFile] = useState<File | null>(null);
    const [studentClassId, setStudentClassId] = useState('');
    const [studentAdmissionYear, setStudentAdmissionYear] = useState<number | ''>(new Date().getFullYear());
    const [selectedParentId, setSelectedParentId] = useState<string>('');
    const [selectedCoreSubjects, setSelectedCoreSubjects] = useState<string[]>([]);
    const [selectedOptionalSubjects, setSelectedOptionalSubjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [newCredentials, setNewCredentials] = useState<{ id: string, password: string } | null>(null);

    const selectedClass = useMemo(() => classes.find(c => c.id === studentClassId), [studentClassId, classes]);

    const availableCoreSubjects = useMemo(() => {
        if (!selectedClass) return [];
        return courses.filter(course => selectedClass.coreSubjects.includes(course.id));
    }, [selectedClass, courses]);

    const availableOptionalSubjectGroups = useMemo(() => {
        if (!selectedClass || !selectedClass.optionalSubjects) return [];
        return selectedClass.optionalSubjects.map(group => ({
            ...group,
            options: courses.filter(course => group.options.includes(course.id))
        }));
    }, [selectedClass, courses]);

    const handleStudentRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNewCredentials(null);

        if (!studentName.trim() || !studentEmail.trim() || !studentClassId || !studentAdmissionYear || !selectedParentId) {
            onError('Please fill in all required student fields, including Admission Year and selecting a Parent.');
            setLoading(false);
            return;
        }
        if (!selectedClass) {
            onError('Please select a valid class.');
            setLoading(false);
            return;
        }

        const allSubjectsEnrolled = [...selectedCoreSubjects, ...selectedOptionalSubjects];

        const languageGroup = availableOptionalSubjectGroups.find(g => g.group === 'Languages');
        if (languageGroup) {
            const selectedLanguages = selectedOptionalSubjects.filter(subId => languageGroup.options.some(opt => opt.id === subId));
            if (selectedLanguages.length < languageGroup.minSelection || selectedLanguages.length > languageGroup.maxSelection) {
                onError(`You must select exactly one language from the optional languages.`);
                setLoading(false);
                return;
            }
        }

        try {
            let imageUrl = '';
            if (studentImageFile) {
                imageUrl = await uploadImage(studentImageFile);
            }

            const { user: newStudent, password: studentPassword } = await registerStudent(
                studentName,
                studentEmail,
                studentClassId,
                allSubjectsEnrolled,
                studentAdmissionYear as number,
                selectedParentId,
                imageUrl
            );
            setNewCredentials({ id: newStudent.id, password: studentPassword });
            setStudentName('');
            setStudentEmail('');
            setStudentImageFile(null);
            setStudentClassId('');
            setStudentAdmissionYear(new Date().getFullYear());
            setSelectedParentId('');
            setSelectedCoreSubjects([]);
            setSelectedOptionalSubjects([]);
            onSuccess();
        } catch (err: any) {
            onError(err.message || 'Failed to register student.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleStudentRegistration} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">New Student Registration</h3>
            <div>
                <label htmlFor="student-name" className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="student-name" value={studentName} onChange={(e) => setStudentName(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="student-email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="student-email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="student-image" className="block text-sm font-medium text-gray-700">Profile Image (Optional)</label>
                <input
                    type="file"
                    id="student-image"
                    accept="image/*"
                    onChange={(e) => setStudentImageFile(e.target.files ? e.target.files[0] : null)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>
            <div>
                <label htmlFor="student-admission-year" className="block text-sm font-medium text-gray-700">Admission Year</label>
                <input type="number" id="student-admission-year" value={studentAdmissionYear} onChange={(e) => setStudentAdmissionYear(Number(e.target.value))} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" min="1900" max={new Date().getFullYear()} />
            </div>
            <div>
                <label htmlFor="student-class" className="block text-sm font-medium text-gray-700">Class</label>
                <select id="student-class" value={studentClassId} onChange={(e) => {
                    setStudentClassId(e.target.value);
                    const newSelectedClass = classes.find(c => c.id === e.target.value);
                    if (newSelectedClass) {
                        setSelectedCoreSubjects(newSelectedClass.coreSubjects);
                    } else {
                        setSelectedCoreSubjects([]);
                    }
                    setSelectedOptionalSubjects([]);
                }} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="student-parent" className="block text-sm font-medium text-gray-700">Link Parent</label>
                <select id="student-parent" value={selectedParentId} onChange={(e) => setSelectedParentId(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                    <option value="">Select Parent</option>
                    {parentsList.map(parent => (
                        <option key={parent.id} value={parent.id}>{parent.name} ({parent.email})</option>
                    ))}
                </select>
                {selectedParentId && (
                    <p className="mt-2 text-sm text-gray-600">
                        Student's password and phone number will be set to the selected parent's phone number: <span className="font-semibold">{parentsList.find(p => p.id === selectedParentId)?.phoneNumber || 'N/A'}</span>
                    </p>
                )}
            </div>

            {selectedClass && (
                <>
                    <div className="border p-4 rounded-md bg-gray-50">
                        <h4 className="font-semibold text-gray-800 mb-2">Core Subjects for {selectedClass.name}</h4>
                        {availableCoreSubjects.length > 0 ? (
                            <div className="space-y-1">
                                {availableCoreSubjects.map(course => (
                                    <div key={course.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`core-${course.id}`}
                                            checked={selectedCoreSubjects.includes(course.id)}
                                            disabled={true}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`core-${course.id}`} className="ml-2 text-sm text-gray-700">{course.name} ({course.code})</label>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-600">No core subjects defined for this class.</p>}
                    </div>

                    {availableOptionalSubjectGroups.map(group => (
                        <div key={group.group} className="border p-4 rounded-md bg-gray-50">
                            <h4 className="font-semibold text-gray-800 mb-2">
                                {group.group} (Select {group.minSelection} to {group.maxSelection})
                            </h4>
                            {group.options.length > 0 ? (
                                <div className="space-y-1">
                                    {group.options.map(course => (
                                        <div key={course.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`optional-${course.id}`}
                                                checked={selectedOptionalSubjects.includes(course.id)}
                                                onChange={(e) => {
                                                    setSelectedOptionalSubjects(prev => {
                                                        if (e.target.checked) {
                                                            if (group.maxSelection === 1 && prev.filter(subId => group.options.some(opt => opt.id === subId)).length >= 1) {
                                                                const filteredPrev = prev.filter(subId => !group.options.some(opt => opt.id === subId));
                                                                return [...filteredPrev, course.id];
                                                            }
                                                            return [...prev, course.id];
                                                        } else {
                                                            return prev.filter(id => id !== course.id);
                                                        }
                                                    });
                                                }}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`optional-${course.id}`} className="ml-2 text-sm text-gray-700">{course.name} ({course.code})</label>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-gray-600">No optional subjects in this group.</p>}
                        </div>
                    ))}
                </>
            )}

            <Button type="submit" loading={loading} className="w-full">
                Register Student
            </Button>
            {newCredentials && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                    <p className="font-semibold">Student Registered!</p>
                    <p>ID: <span className="font-mono">{newCredentials.id}</span></p>
                    <p>Password (Parent Phone No.): <span className="font-mono">{newCredentials.password}</span></p>
                    <p className="text-sm mt-1">Please note these credentials securely.</p>
                </div>
            )}
        </form>
    );
};

export default StudentRegistrationForm;
