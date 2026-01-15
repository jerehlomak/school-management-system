
const express = require('express');
const router = express.Router();
const SchoolClass = require('../models/SchoolClass');

// GET /api/classes
router.get('/', async (req, res) => {
  try {
    const classes = await SchoolClass.find({}).lean(); // Use lean() for better performance and modification
    const User = require('../models/User'); // Ensure User model is available

    // Populate actual student counts dynamically
    const classesWithStudentCounts = await Promise.all(classes.map(async (cls) => {
      const students = await User.find({ classId: cls.id, role: 'student' }).select('id');
      return {
        ...cls,
        studentsIds: students.map(s => s.id) // Populate with actual current student IDs
      };
    }));

    res.json(classesWithStudentCounts);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Server error fetching classes' });
  }
});

// GET /api/classes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const classObj = await SchoolClass.findOne({ id });
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classObj);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ message: 'Server error fetching class' });
  }
});

// POST /api/classes
router.post('/', async (req, res) => {
  const newClassData = req.body;
  console.log(newClassData)
  try {
    const newClass = new SchoolClass(newClassData);
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ message: 'Server error creating class', error: error.message });
  }
});

// PUT /api/classes/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updatedClass = await SchoolClass.findOneAndUpdate({ id }, updates, { new: true });
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ message: 'Server error updating class', error: error.message });
  }
});

// DELETE /api/classes/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedClass = await SchoolClass.findOneAndDelete({ id });
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Server error deleting class' });
  }
});

module.exports = router;
