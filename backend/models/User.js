
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'parent', 'admin'], required: true },
  email: { type: String, unique: true, required: true },
  phoneNumber: { type: String },
  parentId: { type: String, ref: 'User', default: null }, // For students, links to parent User.id
  studentIds: [{ type: String, ref: 'User' }], // For parents, links to student User.id
  classId: { type: String, ref: 'SchoolClass' }, // For students, link to their segmented class (e.g., 'JSS1A')
  subjectsEnrolled: [{ type: String, ref: 'Course' }], // For students, list of course IDs they are taking
  subjectsTaught: [{ type: String, ref: 'Course' }], // For teachers, list of course IDs they teach
  classLevelsTaught: [{ type: String, ref: 'ClassLevel' }], // For teachers, list of ClassLevel IDs they are associated with (e.g., 'JSS1', 'SSS2')
  admissionYear: { type: Number }, // For students
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model('User', UserSchema);
