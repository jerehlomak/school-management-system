import React, { useState, useEffect } from 'react';
import { addClass, fetchClassLevels } from '../services/apiService';
import { SchoolClass, ClassLevel } from '../types';
import { generateUniqueAlphaNumericId } from '@/constants';

const AddClassForm: React.FC = () => {
  const [name, setName] = useState('');
  const [classLevelId, setClassLevelId] = useState('');
  const [capacity, setCapacity] = useState<number>(30); // Default capacity
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
      const newClass: SchoolClass = await addClass({
        id: generateUniqueAlphaNumericId(),
        name,
        classLevelId,
        capacity,
      });
      console.log('New class added:', newClass);
      setSuccessMessage(`Class "${newClass.name}" added successfully!`);
      setName('');
      setCapacity(30); // Reset capacity to default
      // Keep classLevelId selected if user wants to add more for same level
    } catch (error) {
      setErrorMessage((error as Error).message || 'Failed to add class.');
      console.error('Failed to add class:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Add New Class</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Class Name (e.g., JSS1A)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., JSS1A"
            required
          />
        </div>
        <div>
          <label htmlFor="classLevelId" className="block text-sm font-medium text-gray-700 mb-1">
            Class Level
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
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
            Capacity
          </label>
          <input
            type="number"
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 0)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            min="1"
            required
          />
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
            'Add Class'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddClassForm;
