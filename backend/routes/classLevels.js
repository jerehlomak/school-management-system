
const express = require('express');
const router = express.Router();
const ClassLevel = require('../models/ClassLevel');

// GET /api/class-levels
router.get('/', async (req, res) => {
  try {
    const classLevels = await ClassLevel.find({});
    res.json(classLevels);
  } catch (error) {
    console.error('Error fetching class levels:', error);
    res.status(500).json({ message: 'Server error fetching class levels' });
  }
});

// GET /api/class-levels/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const classLevel = await ClassLevel.findOne({ id });
    if (!classLevel) {
      return res.status(404).json({ message: 'Class Level not found' });
    }
    res.json(classLevel);
  } catch (error) {
    console.error('Error fetching class level:', error);
    res.status(500).json({ message: 'Server error fetching class level' });
  }
});

// POST /api/class-levels
router.post('/', async (req, res) => {
  const newClassLevelData = req.body;
  try {
    const newClassLevel = new ClassLevel(newClassLevelData);
    await newClassLevel.save();
    res.status(201).json(newClassLevel);
  } catch (error) {
    console.error('Error creating class level:', error);
    res.status(500).json({ message: 'Server error creating class level', error: error.message });
  }
});

// PUT /api/class-levels/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updatedClassLevel = await ClassLevel.findOneAndUpdate({ id }, updates, { new: true });
    if (!updatedClassLevel) {
      return res.status(404).json({ message: 'Class Level not found' });
    }
    res.json(updatedClassLevel);
  } catch (error) {
    console.error('Error updating class level:', error);
    res.status(500).json({ message: 'Server error updating class level', error: error.message });
  }
});

// DELETE /api/class-levels/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedClassLevel = await ClassLevel.findOneAndDelete({ id });
    if (!deletedClassLevel) {
      return res.status(404).json({ message: 'Class Level not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting class level:', error);
    res.status(500).json({ message: 'Server error deleting class level' });
  }
});

module.exports = router;
