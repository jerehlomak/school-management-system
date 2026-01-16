
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course'); // Needed for updating course students/teachers
const ClassLevel = require('../models/ClassLevel'); // Needed for student ID generation
const SchoolClass = require('../models/SchoolClass'); // Needed for student ID generation
const { generateUniqueAlphaNumericId, generateRandomPassword, generateStudentId } = require('../constants'); // Reuse frontend utilities
const { paginate, getPaginationMeta, createPaginatedResponse } = require('../utils/pagination');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

// Helper to calculate next student number without relying on localStorage
const getNextStudentNumberFromDB = async (classLevelType) => {
  const lastStudent = await User.findOne({ role: 'student', id: new RegExp(`^${classLevelType}/`) })
    .sort({ id: -1 }); // Sort by ID descending to get the last one

  let nextNum = 1;
  if (lastStudent && lastStudent.id) {
    const parts = lastStudent.id.split('/');
    const lastNum = parseInt(parts[1], 10);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }
  return nextNum;
};

// Helper to generate student ID on backend
const generateBackendStudentId = async (classLevelId) => {
  const classLevel = await ClassLevel.findOne({ id: classLevelId });
  if (!classLevel) {
    throw new Error(`Class level with ID ${classLevelId} not found.`);
  }
  const classLevelType = classLevel.type; // 'JSS' or 'SSS'

  const studentNum = await getNextStudentNumberFromDB(classLevelType);
  const formattedNum = String(studentNum).padStart(3, '0');
  const CURRENT_ACADEMIC_YEAR = new Date().getFullYear();
  return `${classLevelType}/${formattedNum}/${CURRENT_ACADEMIC_YEAR}`;
};


// GET /api/users - Fetch all users (with optional password stripping and pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const total = await User.countDocuments({});

    // Apply pagination to query
    const query = {};
    if (req.query.classId) {
      query.classId = req.query.classId;
    }
    if (req.query.subjectId) { // Filtering students enrolled in a subject
      query.subjectsEnrolled = req.query.subjectId;
    }
    // Filter by role if needed (e.g. only students) - though the UI might handle general lists.
    // If filtering by class/subject, usually implies students.
    if (req.query.role) {
      query.role = req.query.role;
    }

    const { query: paginatedQuery } = paginate(User.find(query), page, limit);
    let users = await paginatedQuery;

    // NEVER return passwords, even for admin. 
    // Admin can verify a password via a dedicated endpoint or reset it.
    users = users.map(user => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    });

    // Create pagination metadata
    const paginationMeta = getPaginationMeta(total, page, limit);

    // Return paginated response
    res.json(createPaginatedResponse(users, paginationMeta));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// GET /api/users/students-without-parents
router.get('/students-without-parents', async (req, res) => {
  try {
    const students = await User.find({ role: 'student', parentId: null });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students without parents:', error);
    res.status(500).json({ message: 'Server error fetching students without parents' });
  }
});

// PUT /api/users/:id - Update a user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // If password is being updated, hash it
    if (updates.password) {
      const bcrypt = require('bcryptjs');
      const SALT_ROUNDS = 10;
      updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
    }

    const user = await User.findOneAndUpdate({ id }, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userResponse = user.toObject();
    delete userResponse.password; // Don't send password back
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});
// DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOneAndDelete({ id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cleanup related data
    if (user.role === 'student') {
      // Remove from Parent
      if (user.parentId) {
        await User.updateOne({ id: user.parentId }, { $pull: { studentIds: user.id } });
      }
      // Remove from Courses
      await Course.updateMany({ students: user.id }, { $pull: { students: user.id } });
    } else if (user.role === 'teacher') {
      // Unassign from Courses
      await Course.updateMany({ teacherId: user.id }, { $unset: { teacherId: "" } });
    } else if (user.role === 'parent') {
      // Unlink Students
      await User.updateMany({ parentId: user.id }, { $unset: { parentId: "" } });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// POST /api/users/register-student
router.post('/register-student', async (req, res) => {
  const { studentName, email, classId, subjectsEnrolled, admissionYear, parentId } = req.body;

  try {
    const existingUsername = await User.findOne({ username: `student_${classId}_${generateUniqueAlphaNumericId('', [])}` }); // Placeholder check
    if (existingUsername) {
      return res.status(400).json({ message: 'Generated username already exists. Please try again.' });
    }

    const parentUser = await User.findOne({ id: parentId, role: 'parent' });
    if (!parentUser || !parentUser.phoneNumber) {
      return res.status(400).json({ message: 'Parent not found or parent does not have a phone number for student password.' });
    }

    const classObj = await SchoolClass.findOne({ id: classId });
    if (!classObj) {
      return res.status(400).json({ message: 'Invalid class selected.' });
    }

    const studentId = await generateBackendStudentId(classObj.classLevelId);
    const username = `student_${studentId.replace(/\//g, '_')}`;
    const plainPassword = parentUser.phoneNumber; // Student password is parent's phone number
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    const newStudent = new User({
      id: studentId,
      username,
      password: hashedPassword,
      name: studentName,
      email,
      phoneNumber: parentUser.phoneNumber, // Student phone is parent's phone
      profileImage: req.body.profileImage,
      role: 'student',
      classId,
      subjectsEnrolled,
      admissionYear,
      parentId,
    });

    await newStudent.save();

    // Update parent's studentIds array
    parentUser.studentIds.push(newStudent.id);
    await parentUser.save();

    // Update Courses to include the new student in enrolled courses
    await Course.updateMany(
      { id: { $in: subjectsEnrolled } },
      { $addToSet: { students: newStudent.id } } // Add student to courses without duplicates
    );

    const studentResponse = newStudent.toObject();
    delete studentResponse.password;
    res.status(201).json({ user: studentResponse, password: plainPassword });

  } catch (error) {
    console.error('Student registration failed:', error);
    res.status(500).json({ message: 'Server error during student registration', error: error.message });
  }
});

// POST /api/users/register-teacher
router.post('/register-teacher', async (req, res) => {
  const { teacherName, email, subjectsTaught, classLevelsTaught, phoneNumber } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone number already registered.' });
    }

    const existingTeacherIds = await User.find({ role: 'teacher' }).select('id');
    const newTeacherId = generateUniqueAlphaNumericId('t', existingTeacherIds.map(u => u.id));
    const username = `teacher_${newTeacherId}`;
    const plainPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    const newTeacher = new User({
      id: newTeacherId,
      username,
      password: hashedPassword,
      name: teacherName,
      email,
      phoneNumber,
      profileImage: req.body.profileImage,
      role: 'teacher',
      subjectsTaught,
      classLevelsTaught,
    });

    await newTeacher.save();

    // Update Courses to assign this teacher to the subjects they teach
    // Importantly, this will overwrite any previous teacher for these courses
    await Course.updateMany(
      { id: { $in: subjectsTaught } },
      { $set: { teacherId: newTeacher.id } }
    );

    const teacherResponse = newTeacher.toObject();
    delete teacherResponse.password;
    res.status(201).json({ user: teacherResponse, password: plainPassword });

  } catch (error) {
    console.error('Teacher registration failed:', error);
    res.status(500).json({ message: 'Server error during teacher registration', error: error.message });
  }
});

// POST /api/users/register-parent
router.post('/register-parent', async (req, res) => {
  const { parentName, email, phoneNumber, studentIdsToLink } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone number already registered.' });
    }

    const existingParentIds = await User.find({ role: 'parent' }).select('id');
    const newParentId = generateUniqueAlphaNumericId('p', existingParentIds.map(u => u.id));
    const username = `parent_${newParentId}`;
    const plainPassword = generateRandomPassword(); // Parents get a random password
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    const newParent = new User({
      id: newParentId,
      username,
      password: hashedPassword,
      name: parentName,
      email,
      phoneNumber,
      profileImage: req.body.profileImage,
      role: 'parent',
      studentIds: studentIdsToLink || [],
    });

    await newParent.save();

    // Link students to this parent
    if (studentIdsToLink && studentIdsToLink.length > 0) {
      const studentHashedPassword = await bcrypt.hash(newParent.phoneNumber, SALT_ROUNDS);
      await User.updateMany(
        { id: { $in: studentIdsToLink }, role: 'student' },
        { $set: { parentId: newParent.id, password: studentHashedPassword, phoneNumber: newParent.phoneNumber } } // Set student password and phone number to parent's
      );
    }

    const parentResponse = newParent.toObject();
    delete parentResponse.password;
    res.status(201).json({ user: parentResponse, password: plainPassword });

  } catch (error) {
    console.error('Parent registration failed:', error);
    res.status(500).json({ message: 'Server error during parent registration', error: error.message });
  }
});


// POST /api/users/verify-admin - Securely verify admin and return target password
router.post('/verify-admin', async (req, res) => {
  const { adminId, adminPassword, targetUserId } = req.body;

  try {
    const admin = await User.findOne({ id: adminId, role: 'admin' });
    if (!admin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const isMatch = await bcrypt.compare(adminPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const targetUser = await User.findOne({ id: targetUserId });
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // This is still a bit insecure to send passwords back, but it's the requested functionality
    // In a real app, you'd probably reset the password instead.
    // NOTE: This will only work if the target password isn't hashed yet, or we'd need a way to decrypt (which we don't have with bcrypt).
    // Actually, if it's hashed, we can't "show" it. We'll return a message.

    res.json({
      password: "Passwords are now hashed and cannot be viewed. Please use the reset password feature (to be implemented) or contact support.",
      isHashed: true
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

module.exports = router;
