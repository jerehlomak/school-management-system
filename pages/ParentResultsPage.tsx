
import React, { useState, useEffect } from 'react';
import { User, StudentTermGrade, Course } from '../types';
import { fetchStudentTermGrades, fetchCourses, fetchAllUsers, fetchClasses, fetchPaymentStatus } from '../services/apiService';
import GradesDisplay from '../components/GradesDisplay';

interface ParentResultsPageProps {
    user: User;
}

const CURRENT_YEAR = new Date().getFullYear();

const ParentResultsPage: React.FC<ParentResultsPageProps> = ({ user }) => {
    const [children, setChildren] = useState<User[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [selectedTerm, setSelectedTerm] = useState<1 | 2 | 3>(1);
    const [selectedChildUser, setSelectedChildUser] = useState<User | null>(null);

    const [allStudentGrades, setAllStudentGrades] = useState<StudentTermGrade[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allClasses, setAllClasses] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [feesOwingError, setFeesOwingError] = useState<{ term: number, year: number } | null>(null);
    const [hasCheckedFees, setHasCheckedFees] = useState(false);

    useEffect(() => {
        const loadChildren = async () => {
            if (user.studentIds && user.studentIds.length > 0) {
                // In a real app we might need to fetch the child objects if we only have IDs
                // Assuming fetchAllUsers is cached or we can fetch individually.
                // For now, let's fetch all users and filter.
                // Optimization: endpoint should allow fetching by IDs.
                const response = await fetchAllUsers();
                const all = response.data;
                const kids = all.filter(u => user.studentIds?.includes(u.id));
                setChildren(kids);
                if (kids.length > 0) {
                    setSelectedChildId(kids[0].id);
                    setSelectedChildUser(kids[0]);
                }
            }
        };
        loadChildren();
    }, [user]);

    const handleChildChange = (childId: string) => {
        setSelectedChildId(childId);
        const child = children.find(c => c.id === childId);
        setSelectedChildUser(child || null);
        setHasCheckedFees(false);
        setFeesOwingError(null);
    };

    const handleCheckResult = async () => {
        if (!selectedChildId) return;
        setLoading(true);
        setFeesOwingError(null);
        setHasCheckedFees(false);

        try {
            // 1. Check Fees Status
            const status = await fetchPaymentStatus(selectedChildId, selectedTerm, CURRENT_YEAR);
            if (!status.paid) {
                setFeesOwingError({ term: selectedTerm, year: CURRENT_YEAR });
                setHasCheckedFees(true);
                return;
            }

            // 2. Fetch Grades if fees paid
            const fetchedGrades = await fetchStudentTermGrades(selectedChildId, undefined, undefined, CURRENT_YEAR);
            setAllStudentGrades(fetchedGrades);

            const fetchedCourses = await fetchCourses();
            setCourses(fetchedCourses);

            const fetchedUsersResponse = await fetchAllUsers();
            setAllUsers(fetchedUsersResponse.data || []);

            const fetchedClasses = await fetchClasses();
            setAllClasses(fetchedClasses);

            setHasCheckedFees(true); // Success

        } catch (error) {
            console.error("Error checking results:", error);
            // Handle error appropriately
        } finally {
            setLoading(false);
        }
    };

    // Calculate props for GradesDisplay if data is loaded
    // Copied logic from StudentGradesPage logic reuse
    const gradesForSelectedTerm = allStudentGrades.filter(g => g.term === selectedTerm);
    const studentsInClass = allUsers.filter(s => s.role === 'student' && s.classId === selectedChildUser?.classId);

    const classAveragesForTerm = studentsInClass.map(s => {
        const studentTermAverage = allStudentGrades.find(g => g.studentId === s.id && g.term === selectedTerm)?.termAverage;
        return studentTermAverage !== undefined ? studentTermAverage : 0;
    }).filter(avg => avg > 0);

    const classAverage = classAveragesForTerm.length > 0
        ? (classAveragesForTerm.reduce((sum, avg) => sum + avg, 0) / classAveragesForTerm.length).toFixed(2)
        : 'N/A';

    const firstGradeInTerm = gradesForSelectedTerm[0];
    const classPositionText = firstGradeInTerm?.termPosition || 'N/A';
    const classPositionMatch = classPositionText.match(/(\d+)(?:st|nd|rd|th) of (\d+)/);
    const positionInClass = classPositionMatch ? `${classPositionMatch[1]} out of ${classPositionMatch[2]}` : 'N/A';

    const cumulativeAverage = (selectedTerm === 3 && firstGradeInTerm?.cumulativeAverage !== undefined)
        ? firstGradeInTerm.cumulativeAverage.toFixed(2)
        : 'N/A';

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Check Results</h2>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Child</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded"
                            value={selectedChildId}
                            onChange={(e) => handleChildChange(e.target.value)}
                        >
                            {children.map(child => (
                                <option key={child.id} value={child.id}>{child.name} ({child.classId})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded"
                            value={selectedTerm}
                            onChange={(e) => { setSelectedTerm(Number(e.target.value) as 1 | 2 | 3); setHasCheckedFees(false); }}
                        >
                            <option value={1}>Term 1</option>
                            <option value={2}>Term 2</option>
                            <option value={3}>Term 3</option>
                        </select>
                    </div>
                    <div>
                        <button
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                            onClick={handleCheckResult}
                            disabled={loading || !selectedChildId}
                        >
                            {loading ? 'Checking...' : 'View Result'}
                        </button>
                    </div>
                </div>
            </div>

            {hasCheckedFees && feesOwingError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-md mb-8 text-center shadow-sm">
                    <h3 className="text-2xl font-bold text-red-800 mb-2">Access Restricted</h3>
                    <p className="text-red-700 text-lg mb-4">
                        School fees for <strong>Term {feesOwingError.term}, {feesOwingError.year}</strong> have not been paid.
                    </p>
                    <p className="text-gray-600">
                        Please visit the Usage Payment History page to clear outstanding dues.
                    </p>
                </div>
            )}

            {hasCheckedFees && !feesOwingError && selectedChildUser && (
                <GradesDisplay
                    user={selectedChildUser}
                    selectedTerm={selectedTerm}
                    onTermChange={setSelectedTerm} // Note: This might need adjustment if we want to re-trigger check on term change inside component
                    allStudentGrades={allStudentGrades}
                    courses={courses}
                    allClasses={allClasses}
                    classAverage={classAverage}
                    positionInClass={positionInClass}
                    cumulativeAverage={cumulativeAverage}
                    loading={loading}
                    feesOwingError={feesOwingError}
                />
            )}
        </div>
    );
};

export default ParentResultsPage;
