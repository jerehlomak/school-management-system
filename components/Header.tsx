
import React from 'react';
import { APP_NAME } from '../constants';
import { User } from '../types';
import Button from './Button';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-40 border-b border-gray-200">
      <div className="flex items-center gap-4">
        {user && (
          <button
            onClick={onToggleSidebar}
            className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1 md:hidden"
            aria-label="Toggle sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-2xl font-bold text-blue-700">
          {APP_NAME}
        </h1>
      </div>
      {user && (
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-medium hidden sm:block">
            Welcome, {user.name} ({user.role})
          </span>
          <Button onClick={onLogout} variant="secondary" size="sm">
            Logout
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
