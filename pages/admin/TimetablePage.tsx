import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SchoolClass, Timetable, TimetableEntry } from '../../types';
import { API_BASE_URL } from '../../config';
import { FolderPlus, Loader, Calendar, Download } from 'lucide-react';

const TimetablePage: React.FC = () => {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [timetable, setTimetable] = useState<Timetable | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [term, setTerm] = useState<number>(1);
    const [year, setYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchTimetable();
        } else {
            setTimetable(null);
        }
    }, [selectedClassId, term, year]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/classes`);
            setClasses(res.data);
            if (res.data.length > 0) setSelectedClassId(res.data[0].id);
        } catch (err) {
            console.error('Error fetching classes:', err);
            setError('Failed to load classes');
        }
    };

    const fetchTimetable = async () => {
        if (!selectedClassId) return;
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_BASE_URL}/timetable/${selectedClassId}`, {
                params: { term, year }
            });
            setTimetable(res.data);
        } catch (err) {
            console.error(err);
            // It's okay if not found, just means no timetable yet
            setTimetable(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedClassId) return;
        if (!window.confirm('This will overwrite any existing timetable for this class. Continue?')) return;

        setGenerating(true);
        setError('');
        try {
            const res = await axios.post(`${API_BASE_URL}/timetable/generate`, {
                classId: selectedClassId,
                term,
                year,
                constraints: {
                    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    periodsPerDay: 8,
                    breakPeriods: [4]
                }
            });
            setTimetable(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to generate timetable');
        } finally {
            setGenerating(false);
        }
    };

    // --- Grid Rendering Helpers ---
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    const getEntry = (day: string, period: number) => {
        return timetable?.entries?.find(e => e.day === day && e.period === period);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <Calendar className="mr-3" /> Timetable Management
            </h1>

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                    <select
                        className="border rounded p-2 w-48"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        <option value="">-- Select Class --</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                    <select className="border rounded p-2" value={term} onChange={e => setTerm(Number(e.target.value))}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input type="number" className="border rounded p-2 w-24" value={year} onChange={e => setYear(Number(e.target.value))} />
                </div>

                <div className="flex-grow"></div>

                <button
                    onClick={handleGenerate}
                    disabled={!selectedClassId || generating}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"
                >
                    {generating ? <Loader className="animate-spin mr-2" size={18} /> : <FolderPlus className="mr-2" size={18} />}
                    Generate Timetable
                </button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            {/* Timetable Grid */}
            {loading ? (
                <div className="text-center py-10"><Loader className="animate-spin inline" /> Loading...</div>
            ) : timetable ? (
                <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                    <div className="min-w-max">
                        <div className="grid grid-cols-[100px_repeat(8,1fr)] border-b-2 border-gray-200">
                            {/* Header Row */}
                            <div className="p-3 font-bold bg-gray-50 text-gray-500 border-r">Period / Day</div>
                            {periods.map(p => (
                                <div key={p} className="p-3 font-bold bg-gray-50 text-center border-l">
                                    {p}
                                </div>
                            ))}
                        </div>

                        {days.map(day => (
                            <div key={day} className="grid grid-cols-[100px_repeat(8,1fr)] border-b border-gray-100 items-stretch">
                                <div className="p-3 font-semibold text-gray-700 bg-gray-50 border-r flex items-center justify-center">
                                    {day}
                                </div>
                                {periods.map(p => {
                                    const entry = getEntry(day, p);
                                    let cellClass = "p-2 border-l text-sm min-h-[80px] flex flex-col justify-center items-center text-center relative group";
                                    let content = <span className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">-</span>;

                                    if (entry) {
                                        if (entry.type === 'Break') {
                                            cellClass += " bg-gray-100 text-gray-400 font-bold tracking-widest";
                                            content = "BREAK";
                                        } else {
                                            cellClass += " bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer";
                                            content = (
                                                <>
                                                    <div className="font-bold text-blue-900 line-clamp-2">
                                                        {/* @ts-ignore - joined data */}
                                                        {entry.subjectId?.name || entry.subjectId || 'Unknown Subject'}
                                                    </div>
                                                    <div className="text-gray-600 text-xs mt-1">
                                                        {/* @ts-ignore - joined data */}
                                                        {entry.teacherId?.name || entry.teacherId || 'No Teacher'}
                                                    </div>
                                                    <div className="text-gray-400 text-[10px] mt-1">
                                                        {entry.startTime} - {entry.endTime}
                                                    </div>
                                                </>
                                            );
                                        }
                                    }

                                    return (
                                        <div key={p} className={cellClass}>
                                            {content}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
                    No timetable found. Click "Generate" to create one.
                </div>
            )}
        </div>
    );
};

export default TimetablePage;
