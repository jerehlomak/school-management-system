
const mongoose = require('mongoose');

const ClassLevelSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true }, // e.g., "JSS1", "SSS2"
  type: { type: String, enum: ['JSS', 'SSS'], required: true },
  promotedToClassLevelId: { type: String, ref: 'ClassLevel' }, // E.g., 'JSS1' -> 'JSS2'
});

module.exports = mongoose.model('ClassLevel', ClassLevelSchema);
