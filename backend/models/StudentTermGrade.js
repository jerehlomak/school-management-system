
const mongoose = require('mongoose');

const StudentTermGradeSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true }, // Custom ID for the grade record
  studentId: { type: String, ref: 'User', required: true },
  courseId: { type: String, ref: 'Course', required: true },
  term: { type: Number, enum: [1, 2, 3], required: true },
  year: { type: Number, required: true },
  assignment1: { type: Number, min: 0, max: 10 },
  assignment2: { type: Number, min: 0, max: 10 },
  test1: { type: Number, min: 0, max: 20 },
  test2: { type: Number, min: 0, max: 20 },
  exam: { type: Number, min: 0, max: 40 },
  totalScore: { type: Number, default: 0 },
  termAverage: { type: Number, default: 0 },
  termPosition: { type: String },
  cumulativeAverage: { type: Number },
  promotionStatus: { type: String, enum: ['Promoted', 'Not Promoted', 'N/A'], default: 'N/A' },
  promotedToClass: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index to ensure uniqueness for a student in a course for a given term/year
StudentTermGradeSchema.index({ studentId: 1, courseId: 1, term: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('StudentTermGrade', StudentTermGradeSchema);
