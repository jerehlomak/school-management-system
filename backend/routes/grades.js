const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const StudentTermGrade = require('../models/StudentTermGrade');
const User = require('../models/User');
const Course = require('../models/Course');
const SchoolClass = require('../models/SchoolClass');
const ClassLevel = require('../models/ClassLevel');
const { getOrdinalSuffix } = require('../constants'); // Reuse utility

// Helper to calculate weighted total score and term average (out of 100).
const calculateWeightedTermScores = (grade) => {
  const ass1 = grade.assignment1 ?? 0;
  const ass2 = grade.assignment2 ?? 0;
  const test1 = grade.test1 ?? 0;
  const test2 = grade.test2 ?? 0;
  const exam = grade.exam ?? 0;

  const totalScore = ass1 + ass2 + test1 + test2 + exam;
  const termAverage = totalScore;
  return { totalScore: parseFloat(totalScore.toFixed(2)), termAverage: parseFloat(termAverage.toFixed(2)) };
};


// GET /api/grades/student/:studentId - Fetch grades for a specific student
router.get('/student/:studentId', async (req, res) => {
  console.log('Entered GET /api/grades/student/:studentId');
  const { studentId } = req.params;
  console.log('studentId', studentId);
  const { courseId, term, year } = req.query;
  console.log('courseId', courseId);
  console.log('term', term);
  console.log('year', year);

  try {
    // Check fee payment if term and year are specified
    if (term && year) {
      const FeePayment = require('../models/FeePayment');
      const payment = await FeePayment.findOne({
        studentId,
        term: parseInt(term),
        year: parseInt(year),
        status: 'Completed'
      });

      if (!payment) {
        return res.status(402).json({
          message: 'Access Restricted: School fees for this term at not been paid.',
          code: 'FEES_UNPAID',
          term: parseInt(term),
          year: parseInt(year)
        });
      }
    }

    let query = { studentId };
    if (courseId) query.courseId = courseId;
    if (term) query.term = parseInt(term);
    if (year) query.year = parseInt(year);

    const grades = await StudentTermGrade.find(query);
    res.json(grades);
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ message: 'Server error fetching student grades' });
  }
});

// GET /api/grades/teacher/:teacherId - Fetch grades for courses taught by a teacher
router.get('/teacher/:teacherId', async (req, res) => {
  const { teacherId } = req.params;
  const { courseId, term, year } = req.query;

  try {
    const teacherUser = await User.findOne({ id: teacherId, role: 'teacher' });
    if (!teacherUser) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const teacherSubjects = teacherUser.subjectsTaught || [];
    const coursesTaughtByThisTeacher = await Course.find({ id: { $in: teacherSubjects } }).select('id');
    const courseIdsTaught = coursesTaughtByThisTeacher.map(c => c.id);

    let query = { courseId: { $in: courseIdsTaught } };
    if (courseId) query.courseId = courseId;
    if (term) query.term = parseInt(term);
    if (year) query.year = parseInt(year);

    const grades = await StudentTermGrade.find(query);
    res.json(grades);
  } catch (error) {
    console.error('Error fetching teacher grades:', error);
    res.status(500).json({ message: 'Server error fetching teacher grades' });
  }
});

// POST /api/grades/save - Save or update a student's term grade
router.post('/save', async (req, res) => {
  const gradeData = req.body;
  const { studentId, courseId, term, year } = gradeData;

  try {
    const { totalScore, termAverage } = calculateWeightedTermScores(gradeData);
    const gradeToSave = { ...gradeData, totalScore, termAverage, updatedAt: new Date() };

    let gradeRecord = await StudentTermGrade.findOne({ studentId, courseId, term, year });

    if (gradeRecord) {
      // Update existing record
      Object.assign(gradeRecord, gradeToSave);
      await gradeRecord.save();
    } else {
      // Create new record
      gradeToSave.id = `stg_${studentId.replace(/\//g, '_')}_${courseId}_t${term}_${year}_${new mongoose.Types.ObjectId()}`; // Generate unique ID
      gradeRecord = new StudentTermGrade(gradeToSave);
      await gradeRecord.save();
    }

    res.status(200).json(gradeRecord);
  } catch (error) {
    console.error('Error saving student term grade:', error);
    res.status(500).json({ message: 'Server error saving grade', error: error.message });
  }
});

// POST /api/grades/calculate-positions
router.post('/calculate-positions', async (req, res) => {
  let { courseId, term, year } = req.body;

  try {
    // Ensure term and year are numbers
    term = parseInt(term);
    year = parseInt(year);

    console.log(`Calculating positions for Course: ${courseId}, Term: ${term}, Year: ${year}`);

    const gradesInCourseTerm = await StudentTermGrade.find({ courseId, term, year });

    if (!gradesInCourseTerm || gradesInCourseTerm.length === 0) {
      return res.status(200).json([]); // No grades to calculate
    }

    // 1. Calculate total scores and term averages (already done on save, but re-calculate for safety)
    let gradesWithCalculatedScores = gradesInCourseTerm.map(grade => {
      // Use toObject({ getters: true }) if needed, but default is usually fine
      // Explicitly keeping _id to ensure it's available for update
      const obj = grade.toObject();
      const { totalScore, termAverage } = calculateWeightedTermScores(obj);
      return { ...obj, totalScore, termAverage };
    });

    // 2. Sort by term average to determine positions
    gradesWithCalculatedScores.sort((a, b) => (b.termAverage || 0) - (a.termAverage || 0));

    // 3. Assign positions, handling ties
    let currentPosition = 1;
    let lastAverage = -1;
    let tiedCount = 0;

    const gradesWithPositions = gradesWithCalculatedScores.map((grade, index) => {
      if (grade.termAverage !== lastAverage) {
        currentPosition += tiedCount;
        tiedCount = 0;
        lastAverage = grade.termAverage || 0;
      }
      tiedCount++;
      return {
        ...grade,
        termPosition: `${currentPosition}${getOrdinalSuffix(currentPosition)} of ${gradesWithCalculatedScores.length}`,
      };
    });

    // Update grades in DB with positions, totalScore, termAverage
    const bulkOps = gradesWithPositions.map(grade => ({
      updateOne: {
        filter: { _id: grade._id },
        update: {
          $set: {
            totalScore: grade.totalScore,
            termAverage: grade.termAverage,
            termPosition: grade.termPosition,
            updatedAt: new Date()
          }
        }
      }
    }));
    if (bulkOps.length > 0) {
      await StudentTermGrade.bulkWrite(bulkOps);
    }

    // 4. Calculate cumulative averages and promotion status for Term 3 if requested
    if (term === 3) {
      for (const grade3 of gradesWithPositions) {
        const studentGradesAllTerms = await StudentTermGrade.find({
          studentId: grade3.studentId,
          courseId: courseId, // Important: Cumulative is course-specific in this context
          year: year,
          term: { $in: [1, 2, 3] }
        });

        const termAverages = studentGradesAllTerms
          .filter(g => g.termAverage !== undefined && g.termAverage !== null)
          .map(g => g.termAverage);

        if (termAverages.length > 0) {
          grade3.cumulativeAverage = parseFloat((termAverages.reduce((sum, avg) => sum + avg, 0) / termAverages.length).toFixed(2));
        } else {
          grade3.cumulativeAverage = 0;
        }

        grade3.promotionStatus = (grade3.cumulativeAverage || 0) > 50 ? 'Promoted' : 'Not Promoted';

        // Safe Navigation for User and Class lookup
        const currentStudent = await User.findOne({ id: grade3.studentId });
        if (currentStudent && currentStudent.classId) {
          const currentClass = await SchoolClass.findOne({ id: currentStudent.classId });
          // Check if currentClass exists before accessing properties
          if (currentClass) {
            const currentClassLevel = await ClassLevel.findOne({ id: currentClass.classLevelId });

            if (grade3.promotionStatus === 'Promoted' && currentClassLevel?.promotedToClassLevelId) {
              const nextClassLevel = await ClassLevel.findOne({ id: currentClassLevel.promotedToClassLevelId });
              if (nextClassLevel) {
                const segment = currentClass.name.match(/[A-Z]$/)?.[0] || '';
                grade3.promotedToClass = `${nextClassLevel.name}${segment}`;
              }
            } else if (grade3.promotionStatus === 'Not Promoted') {
              grade3.promotedToClass = currentClass?.name || 'N/A';
            }
          } else {
            console.warn(`Class not found for student ${grade3.studentId} with classId ${currentStudent.classId}`);
            grade3.promotedToClass = 'N/A';
          }
        }
      }

      // Update DB with cumulative and promotion status
      const bulkOpsForCumulative = gradesWithPositions.map(grade => ({
        updateOne: {
          filter: { _id: grade._id },
          update: {
            $set: {
              cumulativeAverage: grade.cumulativeAverage,
              promotionStatus: grade.promotionStatus,
              promotedToClass: grade.promotedToClass,
              updatedAt: new Date()
            }
          }
        }
      }));
      if (bulkOpsForCumulative.length > 0) {
        await StudentTermGrade.bulkWrite(bulkOpsForCumulative);
      }
    }

    res.json(gradesWithPositions);

  } catch (error) {
    console.error('Error calculating course positions:', error);
    res.status(500).json({ message: 'Server error calculating positions', error: error.message });
  }
});

module.exports = router;
