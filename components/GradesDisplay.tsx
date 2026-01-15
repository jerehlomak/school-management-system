
import React, { useRef } from 'react';
import { StudentTermGrade, User, Course } from '../types';
import { getGradeAndRemark, MOCK_SCHOOL_DETAILS } from '../constants';
import Table from './Table';
import ReportHeader from './grades/ReportHeader';
import StudentDetails from './grades/StudentDetails';
import GradeAnalysis from './grades/GradeAnalysis';
import ReportFooter from './grades/ReportFooter';
import TermSelector from './grades/TermSelector';

interface GradesDisplayProps {
    user: User;
    selectedTerm: 1 | 2 | 3;
    onTermChange: (term: 1 | 2 | 3) => void;
    allStudentGrades: StudentTermGrade[];
    courses: Course[];
    allClasses: any[];
    classAverage: string | number;
    positionInClass: string;
    cumulativeAverage: string | number;
    loading: boolean;
    feesOwingError?: { term: number, year: number } | null;
}

interface ReportTableRow {
    subject: string;
    assignment1?: number;
    assignment2?: number;
    test1?: number;
    test2?: number;
    exam?: number;
    totalScore?: number;
    grade: string;
    position: string;
    remark: string;
}

const GradesDisplay: React.FC<GradesDisplayProps> = ({
    user,
    selectedTerm,
    onTermChange,
    allStudentGrades,
    courses,
    allClasses,
    classAverage,
    positionInClass,
    cumulativeAverage,
    loading,
    feesOwingError
}) => {
    const reportCardRef = useRef<HTMLDivElement>(null);

    const gradesForSelectedTerm = allStudentGrades.filter(
        (grade) => grade.term === selectedTerm
    ).sort((a, b) => (courses.find(c => c.id === a.courseId)?.name || '').localeCompare(courses.find(c => c.id === b.courseId)?.name || ''));

    const tableData: ReportTableRow[] = gradesForSelectedTerm.map((grade) => {
        const course = courses.find((c) => c.id === grade.courseId);
        const { grade: letterGrade, remark } = getGradeAndRemark(grade.termAverage);

        return {
            subject: course?.name || `Unknown Course (${grade.courseId})`,
            assignment1: grade.assignment1,
            assignment2: grade.assignment2,
            test1: grade.test1,
            test2: grade.test2,
            exam: grade.exam,
            totalScore: grade.totalScore,
            grade: letterGrade,
            position: grade.termPosition || 'N/A',
            remark: remark,
        };
    });

    const termTotalScores = gradesForSelectedTerm.map(g => g.totalScore || 0);
    const totalSubjects = gradesForSelectedTerm.length;
    const averageScore = totalSubjects > 0 ? (termTotalScores.reduce((sum, score) => sum + score, 0) / totalSubjects).toFixed(2) : 'N/A';

    const firstGradeInTerm = gradesForSelectedTerm[0];
    const promotionStatus = selectedTerm === 3 ? (firstGradeInTerm?.promotionStatus || 'N/A') : 'N/A';
    const promotedToClass = selectedTerm === 3 ? (firstGradeInTerm?.promotedToClass || 'N/A') : 'N/A';
    const currentClassName = allClasses.find((cls: any) => cls.id === user.classId)?.name || MOCK_SCHOOL_DETAILS.class;


    const handlePrint = async () => {
        if (!reportCardRef.current) return;
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');

        const aiAssistant = document.querySelector('.ai-assistant-container');
        const printButton = document.querySelector('.print-button-container');
        if (aiAssistant) aiAssistant.classList.add('hidden');
        if (printButton) printButton.classList.add('hidden');

        const canvas = await html2canvas(reportCardRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`${user.name.replace(/\s/g, '_')}_Term${selectedTerm}_Report.pdf`);

        if (aiAssistant) aiAssistant.classList.remove('hidden');
        if (printButton) printButton.classList.remove('hidden');
    };

    const reportColumns = [
        { header: 'SUBJECT', accessor: 'subject' as keyof ReportTableRow, className: 'font-medium text-gray-900 w-[15%]' },
        { header: '1ST ASS (10)', accessor: 'assignment1' as keyof ReportTableRow, className: 'text-center' },
        { header: '2ND ASS (10)', accessor: 'assignment2' as keyof ReportTableRow, className: 'text-center' },
        { header: '1ST TEST (20)', accessor: 'test1' as keyof ReportTableRow, className: 'text-center' },
        { header: '2ND TEST (20)', accessor: 'test2' as keyof ReportTableRow, className: 'text-center' },
        { header: 'EXAM (40)', accessor: 'exam' as keyof ReportTableRow, className: 'text-center' },
        { header: 'TOTAL (100)', accessor: 'totalScore' as keyof ReportTableRow, className: 'font-bold text-center' },
        { header: 'GRADE', accessor: 'grade' as keyof ReportTableRow, className: 'font-bold text-center' },
        { header: 'POSITION', accessor: 'position' as keyof ReportTableRow, className: 'text-center' },
        { header: 'REMARK', accessor: 'remark' as keyof ReportTableRow, className: 'text-left' },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">My Report Card</h2>

                {feesOwingError ? (
                    <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-md mb-8 text-center shadow-sm">
                        <div className="flex justify-center mb-4">
                            <div className="bg-red-100 p-3 rounded-full">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-red-800 mb-2">Access Restricted</h3>
                        <p className="text-red-700 text-lg mb-4">
                            School fees for <strong>Term {feesOwingError.term}, {feesOwingError.year}</strong> have not been paid.
                        </p>
                        <p className="text-gray-600">
                            Please visit the Fees & Payments page to clear outstanding dues and view this result.
                        </p>
                    </div>
                ) : (
                    <>
                        <TermSelector
                            selectedTerm={selectedTerm}
                            onTermChange={(t) => onTermChange(t as 1 | 2 | 3)}
                            onPrint={handlePrint}
                            loading={loading}
                        />

                        <div id="report-card-content" ref={reportCardRef} className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8 print:shadow-none print:border-none print:p-0">

                            <ReportHeader term={selectedTerm} />

                            <StudentDetails
                                user={user}
                                term={selectedTerm}
                                positionInClass={positionInClass}
                                classAverage={classAverage}
                                cumulativeAverage={cumulativeAverage}
                                averageScore={averageScore}
                                promotionStatus={promotionStatus}
                                promotedToClass={promotedToClass}
                                currentClassName={currentClassName}
                                totalSubjects={totalSubjects}
                            />

                            {/* Grades Table */}
                            <div className="mb-8">
                                <Table data={tableData} columns={reportColumns} rowKey="subject" emptyMessage="No grades found for this term." />
                            </div>

                            <GradeAnalysis />
                            <ReportFooter />
                        </div>
                    </>
                )}
            </div>
            {/* <div className="w-full lg:w-96 flex-shrink-0 ai-assistant-container">
                <AIAssistant systemInstruction="You are a student academic advisor..."/>
            </div> */}
        </div>
    );
};

export default GradesDisplay;
