const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const SchoolClass = require('../models/SchoolClass');
const Course = require('../models/Course');
const User = require('../models/User');

// --- Helper Functions ---

// Calculate start and end time for a period (40 mins duration, starts 8:00 AM)
const calculateTime = (period) => {
    const startHour = 8;
    const duration = 40; // minutes

    const totalStartMinutes = (startHour * 60) + ((period - 1) * duration);
    const totalEndMinutes = totalStartMinutes + duration;

    const formatTime = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return {
        startTime: formatTime(totalStartMinutes),
        endTime: formatTime(totalEndMinutes)
    };
};

// Check if a teacher is busy at a specific slot in any OTHER class's timetable
const isTeacherBusy = async (teacherObjectId, day, period, term, year, currentClassObjectId) => {
    if (!teacherObjectId) return false;

    // Find any timetable for this term/year that has an entry with this teacher, day, and period
    const conflict = await Timetable.findOne({
        term,
        year,
        classId: { $ne: currentClassObjectId }, // currentClassObjectId must be ObjectId
        entries: {
            $elemMatch: {
                day: day,
                period: period,
                teacherId: teacherObjectId // Must be ObjectId
            }
        }
    });

    return !!conflict;
};

// --- Routes ---

// @route   POST /api/timetable/generate
// @desc    Generate a timetable for a specific class
// @access  Admin
router.post('/generate', async (req, res) => {
    const { classId, term, year, constraints, subjectAllocations } = req.body;
    // classId here is the custom string ID (e.g. "wKGG6g7tAM")

    try {
        // Find the class by its custom ID to get the real MongoDB _id
        const schoolClass = await SchoolClass.findOne({ id: classId });
        if (!schoolClass) return res.status(404).json({ message: 'Class not found' });

        const classObjectId = schoolClass._id;

        // Get all subjects (Courses) for this class using custom 'id' field
        let subjects = [];
        if (schoolClass.coreSubjects && schoolClass.coreSubjects.length > 0) {
            // FIX: Query by 'id', not '_id'
            const cores = await Course.find({ id: { $in: schoolClass.coreSubjects } });
            subjects = [...subjects, ...cores];
        }

        // Handle Optional Subjects
        if (schoolClass.optionalSubjects && schoolClass.optionalSubjects.length > 0) {
            let optionalCourseIds = [];
            schoolClass.optionalSubjects.forEach(group => {
                if (group.options && group.options.length > 0) {
                    optionalCourseIds = [...optionalCourseIds, ...group.options];
                }
            });

            if (optionalCourseIds.length > 0) {
                // Remove duplicates if any
                optionalCourseIds = [...new Set(optionalCourseIds)];
                const optionals = await Course.find({ id: { $in: optionalCourseIds } });
                subjects = [...subjects, ...optionals];
            }
        }

        // Resolve Teacher ObjectIds
        // Course.teacherId is a string (custom ID). Timetable.teacherId needs ObjectId.
        const teacherStringIds = [...new Set(subjects.map(s => s.teacherId).filter(Boolean))];
        const teachers = await User.find({ id: { $in: teacherStringIds } });

        // Map string ID -> ObjectId
        const teacherMap = {};
        teachers.forEach(t => {
            teacherMap[t.id] = t._id;
        });

        const days = constraints?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const periodsPerDay = constraints?.periodsPerDay || 8;
        const breakPeriods = constraints?.breakPeriods || [4];

        // Flatten slots to fill
        let slotsToFill = []; // { day, period }
        for (const day of days) {
            for (let p = 1; p <= periodsPerDay; p++) {
                if (breakPeriods.includes(p)) continue;
                slotsToFill.push({ day, period: p });
            }
        }

        // Fill Slots Logic (Simplified)
        let entries = [];

        // Add Breaks
        for (const day of days) {
            for (const p of breakPeriods) {
                const { startTime, endTime } = calculateTime(p);
                entries.push({
                    day,
                    period: p,
                    type: 'Break',
                    startTime,
                    endTime
                });
            }
        }

        const subjectCounts = {};
        subjects.forEach(s => subjectCounts[s._id] = 0);

        const targetCounts = {};
        // Even Distribution Logic
        if (subjectAllocations) {
            subjects.forEach(s => targetCounts[s._id] = subjectAllocations[s._id] || 0);
        } else {
            const totalSlots = slotsToFill.length;
            const subjectCount = subjects.length;
            if (subjectCount > 0) {
                const baseCount = Math.floor(totalSlots / subjectCount);
                let remainder = totalSlots % subjectCount;

                // Sort subjects by name or ID to ensure deterministic distribution of remainders? 
                // Or just iteration order.
                subjects.forEach((s, index) => {
                    // Give extra slot to the first 'remainder' subjects
                    targetCounts[s._id] = baseCount + (remainder > 0 ? 1 : 0);
                    if (remainder > 0) remainder--;
                });
            }
        }

        // Pre-allocate Double Periods for Mathematics and English
        const doublePeriodSubjects = subjects.filter(s => /mathematics|english/i.test(s.name));

        for (const sub of doublePeriodSubjects) {
            // Ensure we have enough quota for 2 slots
            if ((targetCounts[sub._id] || 0) - (subjectCounts[sub._id] || 0) < 2) continue;

            const teacherObjectId = teacherMap[sub.teacherId];
            const shuffledDays = [...days].sort(() => Math.random() - 0.5);
            let placedDouble = false;

            for (const day of shuffledDays) {
                if (placedDouble) break;
                // Try to find consecutive periods p and p+1
                for (let p = 1; p < periodsPerDay; p++) {
                    const nextP = p + 1;

                    // Check if either is a break
                    if (breakPeriods.includes(p) || breakPeriods.includes(nextP)) continue;

                    // Check if already occupied (e.g. by another fixed slot, though currently only breaks)
                    const slot1Occupied = entries.some(e => e.day === day && e.period === p);
                    const slot2Occupied = entries.some(e => e.day === day && e.period === nextP);
                    if (slot1Occupied || slot2Occupied) continue;

                    // Check teacher availability for BOTH slots
                    const busy1 = await isTeacherBusy(teacherObjectId, day, p, term, year, classObjectId);
                    const busy2 = await isTeacherBusy(teacherObjectId, day, nextP, term, year, classObjectId);

                    if (!busy1 && !busy2) {
                        // Place Double
                        const t1 = calculateTime(p);
                        entries.push({
                            day,
                            period: p,
                            subjectId: sub._id,
                            teacherId: teacherObjectId,
                            type: 'Lesson',
                            startTime: t1.startTime,
                            endTime: t1.endTime
                        });

                        const t2 = calculateTime(nextP);
                        entries.push({
                            day,
                            period: nextP,
                            subjectId: sub._id,
                            teacherId: teacherObjectId,
                            type: 'Lesson',
                            startTime: t2.startTime,
                            endTime: t2.endTime
                        });

                        subjectCounts[sub._id] = (subjectCounts[sub._id] || 0) + 2;
                        placedDouble = true;
                        break;
                    }
                }
            }
        }

        for (const slot of slotsToFill) {
            // Check if slot is already filled (by Pre-allocation or Break)
            if (entries.some(e => e.day === slot.day && e.period === slot.period)) continue;

            const shuffledSubjects = [...subjects].sort(() => Math.random() - 0.5);
            let placed = false;
            for (const sub of shuffledSubjects) {
                if (subjectCounts[sub._id] >= targetCounts[sub._id]) continue; // Strict limit enforcement

                // Rule: Single subject per day (Don't repeat subject on the same day)
                const alreadyTaughtToday = entries.some(e => e.day === slot.day && e.subjectId && e.subjectId.toString() === sub._id.toString());
                if (alreadyTaughtToday) continue;

                const teacherObjectId = teacherMap[sub.teacherId];

                // Pass classObjectId (the real _id) to isTeacherBusy
                const busy = await isTeacherBusy(teacherObjectId, slot.day, slot.period, term, year, classObjectId);
                if (!busy) {
                    const { startTime, endTime } = calculateTime(slot.period);
                    entries.push({
                        day: slot.day,
                        period: slot.period,
                        subjectId: sub._id,
                        teacherId: teacherObjectId, // User _id (ObjectId)
                        type: 'Lesson',
                        startTime,
                        endTime
                    });
                    subjectCounts[sub._id]++;
                    placed = true;
                    break;
                }
            }
        }

        // Save using Real ObjectId
        await Timetable.deleteOne({ classId: classObjectId, term, year });

        const newTimetable = new Timetable({
            classId: classObjectId,
            term,
            year,
            entries
        });

        await newTimetable.save();

        const populatedTimetable = await Timetable.findById(newTimetable._id)
            .populate('entries.subjectId', 'name code')
            .populate('entries.teacherId', 'name');

        res.json(populatedTimetable);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/timetable/:classId
router.get('/:classId', async (req, res) => {
    try {
        const { term, year } = req.query;
        const customClassId = req.params.classId;

        // Find the class by custom ID first
        const schoolClass = await SchoolClass.findOne({ id: customClassId });
        if (!schoolClass) {
            // If class not found, we can't find a timetable for it.
            return res.status(404).json({ message: 'Class not found' });
        }

        const query = { classId: schoolClass._id };
        if (term) query.term = term;
        if (year) query.year = year;

        const timetable = await Timetable.findOne(query)
            .populate('entries.subjectId', 'name code')
            .populate('entries.teacherId', 'name');

        res.json(timetable);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
