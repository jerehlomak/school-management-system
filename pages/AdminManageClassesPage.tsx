import React, { useState, useEffect } from 'react';
import { User, UserRole, SchoolClass } from '../types';
import { fetchClasses, fetchAllUsers, updateClass } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

interface AdminManageClassesPageProps {
  user: User;
}

const AdminManageClassesPage: React.FC<AdminManageClassesPageProps> = ({ user }) => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedClasses, fetchedUsers] = await Promise.all([
          fetchClasses(),
          fetchAllUsers()
        ]);
        setClasses(fetchedClasses);
        setTeachers(fetchedUsers.data.filter((u: User) => u.role === UserRole.Teacher));
      } catch (err: any) {
        console.error('Failed to load classes or teachers:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAssignTeacher = async (classId: string, teacherId: string) => {
    try {
      setSuccessMessage(null);
      setError(null);

      const classToUpdate = classes.find(c => c.id === classId);
      if (!classToUpdate) return;

      const updatedClass = { ...classToUpdate, classTeacherId: teacherId };

      await updateClass(updatedClass); // Call API

      // Update local state
      setClasses(prev => prev.map(c => c.id === classId ? updatedClass : c));
      setSuccessMessage(`Form teacher updated for ${classToUpdate.name}`);

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
      console.error('Failed to assign teacher:', err);
      setError('Failed to update form teacher.');
    }
  }

  if (user.role !== UserRole.Admin) {
    return <div className="p-6 text-red-600">Access Denied: Only administrators can access this page.</div>;
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Manage Classes & Form Teachers</h2>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p>{error}</p></div>}
      {successMessage && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert"><p>{successMessage}</p></div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Teacher</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map((cls) => (
              <tr key={cls.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.capacity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.studentsIds?.length || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={cls.classTeacherId || ''}
                    onChange={(e) => handleAssignTeacher(cls.id, e.target.value)}
                  >
                    <option value="">Select Teacher...</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {classes.length === 0 && <div className="p-6 text-center text-gray-500">No classes found.</div>}
      </div>
    </div>
  );
};

export default AdminManageClassesPage;
