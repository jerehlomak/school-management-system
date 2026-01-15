
const mongoose = require('mongoose');

const SchoolClassSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true }, // e.g., "JSS1A"
  classLevelId: { type: String, ref: 'ClassLevel', required: true }, // Links to a ClassLevel, e.g., 'JSS1'
  classTeacherId: { type: String, ref: 'User' }, // Link to Teacher
  studentsIds: [{ type: String, ref: 'User' }], // Array of Student IDs
  capacity: { type: Number, default: 30 },
  coreSubjects: [{ type: String, ref: 'Course' }],
  optionalSubjects: [{
    group: { type: String, required: true },
    options: [{ type: String, ref: 'Course' }],
    minSelection: { type: Number, default: 0 },
    maxSelection: { type: Number, default: 0 },
  }],
});

module.exports = mongoose.model('SchoolClass', SchoolClassSchema);
