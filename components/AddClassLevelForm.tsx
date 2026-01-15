import React, { useState } from 'react';
import { addClassLevel } from '../services/apiService';
import { ClassLevelEnum, ClassLevel, AddClassLevelPayload } from '../types';
import { generateUniqueAlphaNumericId } from '../constants'; // Import the ID generator

const AddClassLevelForm: React.FC = () => {
  const [name, setName] = useState<ClassLevelEnum>(ClassLevelEnum.JSS1); // Default to JSS1
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload: AddClassLevelPayload = {
        id: generateUniqueAlphaNumericId('', []), // Generate a unique ID for the backend
        name,
        type: name.startsWith('JSS') ? 'JSS' : 'SSS', // Fixed type to satisfy backend validation
      };
      const newClassLevel: ClassLevel = await addClassLevel(payload);
      setSuccessMessage(`Class Level "${newClassLevel.name}" added successfully!`);
      // Optionally reset to default or keep current selection
      // setName(ClassLevelEnum.JSS1);
    } catch (error) {
      setErrorMessage((error as Error).message || 'Failed to add class level.');
      console.error('Failed to add class level:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Add New Class Level</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="classLevelName" className="block text-sm font-medium text-gray-700 mb-1">
            Class Level Name
          </label>
          <select
            id="classLevelName"
            value={name}
            onChange={(e) => setName(e.target.value as ClassLevelEnum)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            required
            disabled={loading}
          >
            {Object.values(ClassLevelEnum).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
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
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Add Class Level'
          )}
        </button>
      </form>
    </div>
  );
};

export default AddClassLevelForm;