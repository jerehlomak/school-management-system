import React from 'react';
import { GraduationCap } from 'lucide-react';

const PublicFooter: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-16">
            <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
                <div>
                    <div className="flex items-center space-x-2 text-white mb-6">
                        <GraduationCap className="w-8 h-8" />
                        <span className="text-2xl font-bold font-heading">COCIN Danbong</span>
                    </div>
                    <p className="mb-6">Providing quality education and fostering a community of lifelong learners.</p>
                    <div className="flex space-x-4">
                        {/* Social Icons Placeholder */}
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-colors cursor-pointer">F</div>
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-colors cursor-pointer">T</div>
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-colors cursor-pointer">L</div>
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 uppercase tracking-wider font-heading">Our Campus</h4>
                    <ul className="space-y-4">
                        <li><a href="#" className="hover:text-yellow-500 transition-colors">Acedemic</a></li>
                        <li><a href="#" className="hover:text-yellow-500 transition-colors">Planning & Administration</a></li>
                        <li><a href="#" className="hover:text-yellow-500 transition-colors">Campus Safety</a></li>
                        <li><a href="#" className="hover:text-yellow-500 transition-colors">Facility Services</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 uppercase tracking-wider font-heading">Academics</h4>
                    <ul className="space-y-4">
                        <li><a href="#" className="hover:text-yellow-500 transition-colors">Canvas</a></li>
                        <li><a href="#" className="hover:text-yellow-500 transition-colors">Catalyst</a></li>
                        <li><a href="#" className="hover:text-yellow-500 transition-colors">Library</a></li>
                        <li><a href="#" className="hover:text-yellow-500 transition-colors">Time Schedule</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 uppercase tracking-wider font-heading">Contact Us</h4>
                    <p className="mb-4">123 COCIN Danbong St, Education City, ED 54321</p>
                    <p className="mb-4 text-white font-bold">+1-234-567-8900</p>
                    <p className="text-yellow-500">info@cocindanbong.edu</p>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
