import React, { useState, useEffect, useMemo } from 'react';
import { fetchClasses, fetchCourses, updateClass } from '../services/apiService';
import { SchoolClass, Course } from '../types';
import { generateUniqueAlphaNumericId } from '../constants'; // For temporary group IDs

const ManageClassSubjectsForm: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);

  const [newCoreSubjectId, setNewCoreSubjectId] = useState<string>('');
  const [newOptionalGroupName, setNewOptionalGroupName] = useState<string>('');
  const [newOptionalSubjectId, setNewOptionalSubjectId] = useState<{ groupId: string; courseId: string }>({ groupId: '', courseId: '' });

  const [loading, setLoading] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setInitialLoadError(null);
      try {
        const [fetchedClasses, fetchedCourses] = await Promise.all([
          fetchClasses(),
          fetchCourses(),
        ]);
        setClasses(fetchedClasses);
        setCourses(fetchedCourses);

        // If there's a previously selected class, try to re-select it
        if (selectedClassId && fetchedClasses.some(c => c.id === selectedClassId)) {
          setSelectedClass(fetchedClasses.find(c => c.id === selectedClassId) || null);
        } else if (fetchedClasses.length > 0) {
          setSelectedClassId(fetchedClasses[0].id);
          setSelectedClass(fetchedClasses[0]);
        }
      } catch (error) {
        setInitialLoadError((error as Error).message || 'Failed to load classes or courses.');
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClassId && classes.length > 0) {
      const classFound = classes.find(c => c.id === selectedClassId);
      setSelectedClass(classFound || null);
      if (classFound && courses.length > 0) {
        // Reset new subject dropdowns
        setNewCoreSubjectId('');
        if (classFound.optionalSubjects && classFound.optionalSubjects.length > 0) {
          setNewOptionalSubjectId({ groupId: classFound.optionalSubjects[0].groupName, courseId: '' });
        } else {
          setNewOptionalSubjectId({ groupId: '', courseId: '' });
        }
      }
    } else {
      setSelectedClass(null);
    }
  }, [selectedClassId, classes, courses]);


  const availableCoreCourses = useMemo(() => {
    if (!selectedClass) return [];
    const currentCoreSubjectIds = new Set(selectedClass.coreSubjects || []);
    return courses.filter(course => !currentCoreSubjectIds.has(course.id));
  }, [selectedClass, courses]);

  console.log('available courses',availableCoreCourses)

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.name || `Unknown Course (${courseId})`;
  };

  const handleAddCoreSubject = () => {
    if (!selectedClass || !newCoreSubjectId) return;

    setSelectedClass(prev => {
      if (!prev) return null;
      const updatedCoreSubjects = [...(prev.coreSubjects || []), newCoreSubjectId];
      return { ...prev, coreSubjects: updatedCoreSubjects };
    });
    setNewCoreSubjectId('');
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleRemoveCoreSubject = (courseIdToRemove: string) => {
    if (!selectedClass) return;

    setSelectedClass(prev => {
      if (!prev) return null;
      const updatedCoreSubjects = (prev.coreSubjects || []).filter(id => id !== courseIdToRemove);
      return { ...prev, coreSubjects: updatedCoreSubjects };
    });
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleAddOptionalGroup = () => {
    if (!selectedClass || !newOptionalGroupName.trim()) return;

    setSelectedClass(prev => {
      if (!prev) return null;
      const updatedOptionalSubjects = [
        ...(prev.optionalSubjects || []),
        { groupName: newOptionalGroupName.trim(), options: [] },
      ];
      return { ...prev, optionalSubjects: updatedOptionalSubjects };
    });
    setNewOptionalGroupName('');
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleAddOptionalSubjectToGroup = () => {
    if (!selectedClass || !newOptionalSubjectId.groupId || !newOptionalSubjectId.courseId) return;

    setSelectedClass(prev => {
      if (!prev) return null;
      const updatedOptionalSubjects = (prev.optionalSubjects || []).map(group => {
        if (group.groupName === newOptionalSubjectId.groupId) {
          if (!group.options.includes(newOptionalSubjectId.courseId)) {
            return { ...group, options: [...group.options, newOptionalSubjectId.courseId] };
          }
        }
        return group;
      });
      return { ...prev, optionalSubjects: updatedOptionalSubjects };
    });
    setNewOptionalSubjectId(prev => ({ ...prev, courseId: '' }));
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleRemoveOptionalSubjectFromGroup = (groupName: string, courseIdToRemove: string) => {
    if (!selectedClass) return;

    setSelectedClass(prev => {
      if (!prev) return null;
      const updatedOptionalSubjects = (prev.optionalSubjects || []).map(group => {
        if (group.groupName === groupName) {
          return { ...group, options: group.options.filter(id => id !== courseIdToRemove) };
        }
        return group;
      });
      return { ...prev, optionalSubjects: updatedOptionalSubjects };
    });
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleRemoveOptionalGroup = (groupNameToRemove: string) => {
    if (!selectedClass) return;

    setSelectedClass(prev => {
      if (!prev) return null;
      const updatedOptionalSubjects = (prev.optionalSubjects || []).filter(
        group => group.groupName !== groupNameToRemove
      );
      return { ...prev, optionalSubjects: updatedOptionalSubjects };
    });
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleSaveSubjects = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      setSaveError('No class selected to save.');
      return;
    }

    setLoading(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      // Ensure arrays are not undefined, even if empty
      const classToSave: SchoolClass = {
        ...selectedClass,
        coreSubjects: selectedClass.coreSubjects || [],
        optionalSubjects: selectedClass.optionalSubjects || [],
      };
      console.log('classToSave', classToSave);
      const updatedClass = await updateClass(classToSave);
      // Update local state with the saved version (useful if backend does further processing)
      setClasses(prevClasses =>
        prevClasses.map(c => (c.id === updatedClass.id ? updatedClass : c))
      );
      setSelectedClass(updatedClass);
      setSaveMessage(`Subjects for "${updatedClass.name}" saved successfully!`);
    } catch (error) {
      setSaveError((error as Error).message || 'Failed to save subjects.');
      console.error('Failed to save subjects:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading && classes.length === 0 && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-4">
        <div className="text-blue-700 text-xl flex items-center">
          <svg className="animate-spin h-6 w-6 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading data...
        </div>
      </div>
    );
  }

  if (initialLoadError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md max-w-2xl mx-auto my-8" role="alert">
        <p className="font-bold text-lg mb-2">Error loading data</p>
        <p>{initialLoadError}</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md max-w-2xl mx-auto my-8">
        <p className="font-bold text-lg mb-2">No Classes Found</p>
        <p>Please add classes first using the "Add Class" tab.</p>
      </div>
    );
  }
  if (courses.length === 0) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md max-w-2xl mx-auto my-8">
        <p className="font-bold text-lg mb-2">No Courses Found</p>
        <p>Please add courses first using the "Add Course" tab.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Manage Class Subjects</h2>

      <div className="mb-6">
        <label htmlFor="selectClass" className="block text-lg font-medium text-gray-800 mb-2">
          Select Class
        </label>
        <select
          id="selectClass"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base bg-white cursor-pointer"
          disabled={loading}
        >
          {classes.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedClass ? (
        <form onSubmit={handleSaveSubjects} className="space-y-8">
          {/* Core Subjects Section */}
          <div className="border border-blue-200 rounded-lg p-5 bg-blue-50">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">Core Subjects for {selectedClass.name}</h3>
            {((selectedClass.coreSubjects || []).length === 0) ? (
              <p className="text-gray-600 italic mb-4">No core subjects assigned yet.</p>
            ) : (
              <ul className="list-disc pl-5 mb-4 space-y-2">
                {(selectedClass.coreSubjects || []).map(courseId => (
                  <li key={courseId} className="flex justify-between items-center text-gray-700 text-base">
                    <span>{getCourseName(courseId)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCoreSubject(courseId)}
                      className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col sm:flex-row items-end sm:space-x-4 space-y-3 sm:space-y-0 mt-4 pt-4 border-t border-blue-100">
              <div className="flex-grow w-full">
                <label htmlFor="addCoreSubject" className="block text-sm font-medium text-gray-700 mb-1">
                  Add New Core Subject
                </label>
                <select
                  id="addCoreSubject"
                  value={newCoreSubjectId}
                  onChange={(e) => setNewCoreSubjectId(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  disabled={loading || availableCoreCourses.length === 0}
                >
                  <option value="">{availableCoreCourses.length === 0 ? "No more courses to add" : "Select a course"}</option>
                  {availableCoreCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddCoreSubject}
                className="w-full sm:w-auto flex-shrink-0 py-2 px-5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !newCoreSubjectId || availableCoreCourses.length === 0}
              >
                Add Core Subject
              </button>
            </div>
          </div>

          {/* Optional Subjects Section */}
          <div className="border border-purple-200 rounded-lg p-5 bg-purple-50">
            <h3 className="text-2xl font-semibold text-purple-800 mb-4">Optional Subjects for {selectedClass.name}</h3>

            {(selectedClass.optionalSubjects || []).length === 0 && (
              <p className="text-gray-600 italic mb-4">No optional subject groups defined yet.</p>
            )}

            {(selectedClass.optionalSubjects || []).map((group, groupIndex) => (
              <div key={group.groupName || `temp-group-${groupIndex}`} className="mb-6 p-4 border border-purple-100 rounded-md bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-purple-100">
                  <h4 className="text-xl font-medium text-purple-700">{group.groupName}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveOptionalGroup(group.groupName)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                    disabled={loading}
                  >
                    Remove Group
                  </button>
                </div>
                {group.options.length === 0 ? (
                  <p className="text-gray-500 italic mb-3">No subjects in this group yet.</p>
                ) : (
                  <ul className="list-disc pl-5 mb-3 space-y-1">
                    {group.options.map(courseId => (
                      <li key={courseId} className="flex justify-between items-center text-gray-700 text-sm">
                        <span>{getCourseName(courseId)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionalSubjectFromGroup(group.groupName, courseId)}
                          className="ml-4 px-2 py-0.5 bg-red-400 text-white text-xs rounded-md hover:bg-red-500 transition-colors"
                          disabled={loading}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col sm:flex-row items-end sm:space-x-3 space-y-2 sm:space-y-0 mt-4 pt-3 border-t border-purple-50">
                  <div className="flex-grow w-full">
                    <label htmlFor={`addOptionalSubject-${groupIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Add Subject to Group
                    </label>
                    <select
                      id={`addOptionalSubject-${groupIndex}`}
                      value={newOptionalSubjectId.groupId === group.groupName ? newOptionalSubjectId.courseId : ''}
                      onChange={(e) => setNewOptionalSubjectId({ groupId: group.groupName, courseId: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                      disabled={loading || courses.filter(c => !group.options.includes(c.id)).length === 0}
                    >
                      <option value="">{courses.filter(c => !group.options.includes(c.id)).length === 0 ? "No more courses to add" : "Select a course"}</option>
                      {courses.filter(c => !group.options.includes(c.id)).map(course => (
                        <option key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOptionalSubjectToGroup}
                    className="w-full sm:w-auto flex-shrink-0 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || newOptionalSubjectId.groupId !== group.groupName || !newOptionalSubjectId.courseId}
                  >
                    Add Subject
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-4 border-t border-purple-100 flex flex-col sm:flex-row items-end sm:space-x-4 space-y-3 sm:space-y-0">
              <div className="flex-grow w-full">
                <label htmlFor="newOptionalGroupName" className="block text-sm font-medium text-gray-700 mb-1">
                  New Optional Subject Group Name
                </label>
                <input
                  type="text"
                  id="newOptionalGroupName"
                  value={newOptionalGroupName}
                  onChange={(e) => setNewOptionalGroupName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Electives, Arts & Crafts"
                  disabled={loading}
                />
              </div>
              <button
                type="button"
                onClick={handleAddOptionalGroup}
                className="w-full sm:w-auto flex-shrink-0 py-2 px-5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !newOptionalGroupName.trim()}
              >
                Add New Group
              </button>
            </div>
          </div>


          {saveMessage && (
            <p className="text-green-600 text-center font-semibold text-base">{saveMessage}</p>
          )}
          {saveError && (
            <p className="text-red-600 text-center font-semibold text-base">{saveError}</p>
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
              'Save All Subjects'
            )}
          </button>
        </form>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-8">Please select a class to manage its subjects.</p>
      )}
    </div>
  );
};

export default ManageClassSubjectsForm;