import React, { useState, useEffect } from 'react';
import { addCourse, fetchClassLevels } from '../services/apiService';
import { Course, ClassLevel } from '../types';
import { generateUniqueAlphaNumericId } from '@/constants';

const AddCourseForm: React.FC = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [classLevelId, setClassLevelId] = useState('');
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadClassLevels = async () => {
      try {
        const levels = await fetchClassLevels();
        setClassLevels(levels);
        if (levels.length > 0) {
          setClassLevelId(levels[0].id); // Select the first one by default
        }
      } catch (error) {
        setErrorMessage('Failed to load class levels.');
        console.error('Failed to fetch class levels:', error);
      }
    };
    loadClassLevels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const newCourse: Course = await addCourse({
        id: generateUniqueAlphaNumericId(),
        name,
        code,
        description,
        classLevelId: classLevelId || undefined,
      });
      setSuccessMessage(`Course "${newCourse.name}" added successfully!`);
      setName('');
      setCode('');
      setDescription('');
      // Keep classLevelId selected if user wants to add more for same level
    } catch (error) {
      setErrorMessage((error as Error).message || 'Failed to add course.');
      console.error('Failed to add course:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Add New Course</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Course Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Mathematics"
            required
          />
        </div>
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Course Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., MTH101"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Brief description of the course content"
          ></textarea>
        </div>
        <div>
          <label htmlFor="classLevelId" className="block text-sm font-medium text-gray-700 mb-1">
            Associated Class Level
          </label>
          <select
            id="classLevelId"
            value={classLevelId}
            onChange={(e) => setClassLevelId(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            required
            disabled={loading || classLevels.length === 0}
          >
            {classLevels.length === 0 ? (
              <option value="">Loading class levels...</option>
            ) : (
              classLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))
            )}
          </select>
          {classLevels.length === 0 && !loading && (
            <p className="text-red-500 text-xs mt-1">No class levels available. Please add them first.</p>
          )}
        </div>

        {successMessage && (
          <p className="text-green-600 text-center font-semibold text-base">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="text-red-600 text-center font-semibold text-base">{errorMessage}</p>
        )}

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || classLevels.length === 0}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Add Course'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddCourseForm;
