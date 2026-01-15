
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  teacherId: { type: String, ref: 'User', default: null }, // Links to a teacher's User.id
  students: [{ type: String, ref: 'User' }], // Student User.ids enrolled
});

module.exports = mongoose.model('Course', CourseSchema);
