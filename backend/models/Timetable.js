const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SchoolClass',
        required: true,
    },
    term: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    entries: [{
        day: {
            type: String, // Monday, Tuesday...
            required: true,
        },
        period: {
            type: Number, // 1-indexed
            required: true,
        },
        startTime: String,
        endTime: String,
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        type: {
            type: String,
            enum: ['Lesson', 'Break'],
            default: 'Lesson'
        }
    }],
}, { timestamps: true });

// Prevent duplicate timetables for the same class/term/year? 
// Maybe just findOneAndUpdate.

module.exports = mongoose.model('Timetable', TimetableSchema);
