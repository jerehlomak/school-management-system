import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

interface PublicNavbarProps {
    transparentOnTop?: boolean;
}

const PublicNavbar: React.FC<PublicNavbarProps> = ({ transparentOnTop = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isTransparent = transparentOnTop && !isScrolled;

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
        { label: 'Admissions', path: '/admissions' },
        // { label: 'Academics', path: '#' }, // Placeholder
        { label: 'News', path: '/blog' },
        { label: 'Gallery', path: '/gallery' },
        { label: 'Contact', path: '/contact' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${!isTransparent ? 'bg-white shadow-lg py-4' : 'bg-transparent py-6'}`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                    <GraduationCap className={`w-8 h-8 ${!isTransparent ? 'text-blue-900' : 'text-white'}`} />
                    <span className={`text-2xl font-bold font-heading ${!isTransparent ? 'text-blue-900' : 'text-white'}`}>COCIN Danbong</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={`#${item.path}`} // Using hash routing structure if needed, or just onClick
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(item.path);
                            }}
                            className={`text-sm font-semibold uppercase tracking-wider hover:text-yellow-500 transition-colors cursor-pointer ${!isTransparent ? 'text-gray-700' : 'text-white/90'} ${location.pathname === item.path ? 'text-yellow-500' : ''}`}
                        >
                            {item.label}
                        </a>
                    ))}
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                    >
                        <Monitor className="w-4 h-4" />
                        <span>PORTAL</span>
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-2xl"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="text-gray-800" /> : <Menu className={!isTransparent ? 'text-gray-800' : 'text-white'} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="md:hidden bg-white px-6 py-4 shadow-xl"
                >
                    <div className="flex flex-col space-y-4">
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(item.path);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="text-gray-800 font-semibold hover:text-blue-900"
                            >
                                {item.label}
                            </a>
                        ))}
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-900 text-white px-4 py-2 rounded w-full text-center font-bold"
                        >
                            PORTAL LOGIN
                        </button>
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

export default PublicNavbar;
