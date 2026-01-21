
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import {
  LayoutDashboard,
  CreditCard,
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  School,
  LogOut,
  Menu,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const getNavLinks = (role: UserRole) => {
    const commonLinks = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/fees', label: 'Fees & Payments', icon: CreditCard },
    ];

    switch (role) {
      case UserRole.Student:
        return [
          ...commonLinks,
          { path: '/student/grades', label: 'My Grades', icon: GraduationCap },
          { path: '/student/courses', label: 'My Courses', icon: BookOpen },
        ];
      case UserRole.Teacher:
        return [
          ...commonLinks,
          { path: '/teacher/classes', label: 'My Classes', icon: School },
          { path: '/teacher/grades', label: 'Enter Grades', icon: FileText },
        ];
      case UserRole.Parent:
        return [
          ...commonLinks,
          { path: '/parent/children', label: 'My Children', icon: Users },
          { path: '/parent/results', label: 'Check Results', icon: GraduationCap },
          { path: '/parent/payments', label: 'Payment History', icon: CreditCard },
        ];
      case UserRole.Admin:
        return [
          ...commonLinks,
          { path: '/admin/users', label: 'Manage Users', icon: Users },
          { path: '/admin/manage-classes', label: 'Manage Classes', icon: School },
          { path: '/admin/fees', label: 'Fee Structure', icon: CreditCard },
          { path: '/admin/payments', label: 'Payments', icon: CreditCard },
          { path: '/admin/applications', label: 'Applications', icon: FileText },
          { path: '/admin/content', label: 'CMS (News/Gallery)', icon: FileText },
          { path: '/admin/timetable', label: 'Timetable', icon: BookOpen },
          { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
          // { path: '/admin/reports', label: 'Reports', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks(user.role);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 z-30 md:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 bg-blue-900 text-white shadow-lg z-40
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          transition-[width,transform] duration-300 ease-in-out md:relative
          ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col`}
      >
        <div className={`flex items-center h-16 px-4 bg-blue-950 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-blue-300 whitespace-nowrap overflow-hidden">Navigation</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden text-white hover:text-gray-300 focus:outline-none"
            aria-label="Close sidebar"
          >
            <Menu size={24} />
          </button>
        </div>

        <nav className="mt-4 flex-1 px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-transparent">
          <ul className="space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={onClose}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative
                      ${isActive
                        ? 'bg-yellow-500 text-blue-900 shadow-md font-bold'
                        : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? link.label : ''}
                  >
                    <div className={`${isCollapsed ? '' : 'mr-3'} flex-shrink-0`}>
                      <link.icon size={22} className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    </div>

                    {!isCollapsed && (
                      <span className="font-medium truncate">{link.label}</span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        {link.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Optional Footer/User section could go here */}
      </aside>
    </>
  );
};

export default Sidebar;
