
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
});

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findOne({ id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error fetching course' });
  }
});

// POST /api/courses
router.post('/', async (req, res) => {
  const newCourseData = req.body;
  console.log(newCourseData)
  try {
    const newCourse = new Course(newCourseData);
    await newCourse.save();  
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error creating course', error: error.message });
  }
});

// PUT /api/courses/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updatedCourse = await Course.findOneAndUpdate({ id }, updates, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error updating course', error: error.message });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCourse = await Course.findOneAndDelete({ id });
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
});

module.exports = router;
