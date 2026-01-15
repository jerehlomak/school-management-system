import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { fetchUser } from '../services/apiService';
import { User, UserRole } from '../types';
import { APP_NAME } from '../constants';

interface AdminLoginPageProps {
    onLoginSuccess: (user: User) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await fetchUser(username, password);
            // Strict check for Admin role
            if (user && user.role === UserRole.Admin) {
                onLoginSuccess(user);
                navigate('/'); // Redirect to dashboard/admin home
            } else if (user) {
                setError('Access Denied: This portal is for Administrators only.');
            } else {
                setError('Invalid admin credentials.');
            }
        } catch (err: any) {
            console.error('Admin Login error:', err);
            setError(err.message || 'An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 border-t-8 border-red-800">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Admin Portal</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">{APP_NAME} Administration</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900"
                            required
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
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900"
                            required
                        />
                    </div>

                    {error && <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>}

                    <Button type="submit" loading={loading} className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white">
                        Access Admin Dashboard
                    </Button>
                </form>
                <div className="mt-6 text-center">
                    <a href="/#/login" className="text-sm text-gray-500 hover:text-gray-900">Return to Standard Login</a>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
