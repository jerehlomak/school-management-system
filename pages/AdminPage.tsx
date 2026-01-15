import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { User, UserRole, Course, SchoolClass, ClassLevel } from '../types';
import { fetchAllUsers, fetchCourses, fetchClasses, fetchClassLevels, fetchStudentsWithoutParents } from '../services/apiService';
import AIAssistant from '../components/AIAssistant';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy loaded components for code splitting
const StudentRegistrationForm = lazy(() => import('../components/admin/StudentRegistrationForm'));
const TeacherRegistrationForm = lazy(() => import('../components/admin/TeacherRegistrationForm'));
const ParentRegistrationForm = lazy(() => import('../components/admin/ParentRegistrationForm'));
const UserManagement = lazy(() => import('../components/admin/UserManagement'));
const AddCourseForm = lazy(() => import('@/components/AddCourseForm'));
const AddClassForm = lazy(() => import('@/components/AddClassForm'));
const AddClassLevelForm = lazy(() => import('@/components/AddClassLevelForm'));
const ManageClassSubjectsForm = lazy(() => import('@/components/ManageClassSubjectsForm'));
const RecentPaymentsWidget = lazy(() => import('../components/admin/RecentPaymentsWidget'));

interface AdminPageProps {
  user: User;
}

const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registerStudent' | 'registerTeacher' | 'registerParent' | 'manageUsers' | 'manageClasses' | 'addCourses' | 'addClasses' | 'addClassLevels' | 'feeStructure'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [studentsWithoutParents, setStudentsWithoutParents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedUsersResponse, fetchedCourses, fetchedClasses, fetchedClassLevels, fetchedStudentsWithoutParentsByAPI] = await Promise.all([
        fetchAllUsers(),
        fetchCourses(),
        fetchClasses(),
        fetchClassLevels(),
        fetchStudentsWithoutParents()
      ]);
      const fetchedUsers = fetchedUsersResponse.data;
      setUsers(fetchedUsers);
      setCourses(fetchedCourses);
      setClasses(fetchedClasses);
      setClassLevels(fetchedClassLevels);
      setStudentsWithoutParents(fetchedStudentsWithoutParentsByAPI);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setMessage({ type: 'error', text: 'Failed to load initial data.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user.role === UserRole.Admin) {
      loadInitialData();
    }
  }, [user.role, loadInitialData]);

  const parentsList = useMemo(() => users.filter(u => u.role === UserRole.Parent), [users]);

  // Derived Stats
  const studentCount = users.filter(u => u.role === UserRole.Student).length;
  const teacherCount = users.filter(u => u.role === UserRole.Teacher).length;
  const parentCount = users.filter(u => u.role === UserRole.Parent).length;
  const classCount = classes.length;

  if (user.role !== UserRole.Admin) {
    return <div className="p-6 text-red-600">Access Denied: Only administrators can access this page.</div>;
  }

  const renderTabContent = () => {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-blue-800 font-semibold">Students</h4>
                <p className="text-2xl font-bold text-blue-900">{studentCount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h4 className="text-green-800 font-semibold">Teachers</h4>
                <p className="text-2xl font-bold text-green-900">{teacherCount}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h4 className="text-purple-800 font-semibold">Parents</h4>
                <p className="text-2xl font-bold text-purple-900">{parentCount}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <h4 className="text-orange-800 font-semibold">Classes</h4>
                <p className="text-2xl font-bold text-orange-900">{classCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentPaymentsWidget />
              {/* Placeholder for other widgets */}
            </div>
          </div>
        )}
        {activeTab === 'registerStudent' && (
          <StudentRegistrationForm
            classes={classes}
            courses={courses}
            parentsList={parentsList}
            onSuccess={() => {
              setMessage({ type: 'success', text: 'Student registered successfully!' });
              loadInitialData();
            }}
            onError={(msg) => setMessage({ type: 'error', text: msg })}
          />
        )}
        {activeTab === 'registerTeacher' && (
          <TeacherRegistrationForm
            courses={courses}
            classLevels={classLevels}
            onSuccess={() => {
              setMessage({ type: 'success', text: 'Teacher registered successfully!' });
              loadInitialData();
            }}
            onError={(msg) => setMessage({ type: 'error', text: msg })}
          />
        )}
        {activeTab === 'registerParent' && (
          <ParentRegistrationForm
            studentsWithoutParents={studentsWithoutParents}
            onSuccess={() => {
              setMessage({ type: 'success', text: 'Parent registered successfully!' });
              loadInitialData();
            }}
            onError={(msg) => setMessage({ type: 'error', text: msg })}
          />
        )}
        {activeTab === 'manageUsers' && (
          <UserManagement
            currentUser={user}
            classes={classes}
            courses={courses}
            classLevels={classLevels}
            users={users}
            onRefresh={loadInitialData}
          />
        )}
        {activeTab === 'manageClasses' && <ManageClassSubjectsForm />}
        {activeTab === 'addCourses' && <AddCourseForm />}
        {activeTab === 'addClasses' && <AddClassForm />}
        {activeTab === 'addClassLevels' && <AddClassLevelForm />}
      </Suspense>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Admin Panel</h2>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-4 pb-2">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'manageUsers', label: 'Manage Users' },
              { id: 'registerStudent', label: 'Register Student' },
              { id: 'registerTeacher', label: 'Register Teacher' },
              { id: 'registerParent', label: 'Register Parent' },
              { id: 'manageClasses', label: 'Manage Classes' },
              { id: 'addClassLevels', label: 'Add Class Level' },
              { id: 'addCourses', label: 'Add Subject' },
              { id: 'addClasses', label: 'Add Class' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMessage(null);
                }}
                className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-white mb-4 ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} role="alert">
              {message.text}
            </div>
          )}

          {loading && !users.length ? <LoadingSpinner /> : renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
