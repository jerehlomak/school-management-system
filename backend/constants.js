const CURRENT_ACADEMIC_YEAR = new Date().getFullYear();

const generateUniqueAlphaNumericId = (prefix, existingIds) => {
  let id;
  do {
    id = `${prefix}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  } while (existingIds.includes(id));
  return id;
};

const generateRandomPassword = (length = 8) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Mock function for student number since DB lookup is not passed here
const getNextStudentNumber = (classLevelType) => {
  return Math.floor(Math.random() * 1000);
}

const generateStudentId = (classLevelType) => {
  const studentNum = getNextStudentNumber(classLevelType);
  const formattedNum = String(studentNum).padStart(3, '0'); // e.g., 001
  return `${classLevelType}/${formattedNum}/${CURRENT_ACADEMIC_YEAR}`;
};

const getOrdinalSuffix = (i) => {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
};

module.exports = {
  CURRENT_ACADEMIC_YEAR,
  generateUniqueAlphaNumericId,
  generateRandomPassword,
  generateStudentId,
  getOrdinalSuffix
};