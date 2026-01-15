
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { fetchUser } from '../services/apiService';
import { User, UserRole } from '../types';
import { APP_NAME } from '../constants';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await fetchUser(username, password);
      if (user) {
        if (user.role === UserRole.Admin) {
          setError('Admins must use the Admin Login Portal.');
        } else {
          onLoginSuccess(user);
        }
      } else {
        setError('Invalid username/student ID/phone number or password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{APP_NAME}</h1>
          <p className="text-lg text-gray-600">Your Modern School Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username, Student ID, or Phone Number
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
              aria-label="Username, Student ID, or Phone Number input"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
              aria-label="Password input"
            />
          </div>
          <div className="flex justify-end text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500 font-medium">Forgot Password?</Link>
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <Button type="submit" loading={loading} className="w-full py-2.5">
            Log In
          </Button>
        </form>

        {/* <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="mb-2">Hint: Default users (if DB is empty or just populated):</p>
          <ul className="text-left mx-auto max-w-xs space-y-1">
            <li><span className="font-semibold">Student:</span> `student_JSS_001_2023` (or any generated ID), password `08011111111`</li>
            <li><span className="font-semibold">Teacher:</span> `teacher1` or `t001`, password `password`</li>
            <li><span className="font-semibold">Parent:</span> `parent1` or `p001`, password `password`</li>
            <li><span className="font-semibold">Admin:</span> `admin1` or `a001`, password `password`</li>
          </ul>
          <p className="mt-4 text-xs">Note: After registering new users, use their generated IDs/usernames/phone numbers (where applicable) and their assigned passwords.</p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;