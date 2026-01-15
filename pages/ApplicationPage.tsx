import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Users, BookOpen, Upload } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const ApplicationPage: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        dob: '',
        gender: '',
        grade: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        address: '',
        prevSchool: '',
        medicalInfo: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Application Submitted Successfully! (Mock)");
        console.log(formData);
    };

    return (
        <PublicLayout transparentNavbar={false}>
            {/* Header */}
            <section className="bg-blue-900 py-20 text-white text-center">
                <div className="container mx-auto px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4 font-heading"
                    >
                        Online Application
                    </motion.h1>
                    <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                        Begin your journey with us. Please fill out the form below carefully.
                    </p>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-6 max-w-4xl">
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8 md:p-12">

                        {/* Student Details */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2 font-heading">
                                <User className="w-6 h-6 text-yellow-500" />
                                Student Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                                    <input
                                        type="text" name="firstName" required
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                                        placeholder="Enter first name"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                                    <input
                                        type="text" name="lastName" required
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                                        placeholder="Enter last name"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Middle Name</label>
                                    <input
                                        type="text" name="middleName"
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                                        placeholder="Enter middle name"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
                                    <input
                                        type="date" name="dob" required
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
                                    <select name="gender" required className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all" onChange={handleChange}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Grade Applying For</label>
                                    <select name="grade" required className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all" onChange={handleChange}>
                                        <option value="">Select Grade</option>
                                        <option value="7">Grade 7 (JSS 1)</option>
                                        <option value="8">Grade 8 (JSS 2)</option>
                                        <option value="9">Grade 9 (JSS 3)</option>
                                        <option value="10">Grade 10 (SSS 1)</option>
                                        <option value="11">Grade 11 (SSS 2)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <hr className="my-8 border-gray-200" />

                        {/* Guardian Details */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2 font-heading">
                                <Users className="w-6 h-6 text-yellow-500" />
                                Parent/Guardian Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                                    <input
                                        type="text" name="parentName" required
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                                        placeholder="Parent/Guardian Full Name"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                                    <input
                                        type="email" name="parentEmail" required
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                                        placeholder="example@email.com"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                                    <input
                                        type="tel" name="parentPhone" required
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                                        placeholder="+1 234 567 890"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Home Address</label>
                                    <textarea
                                        name="address" rows={3} required
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                                        placeholder="Street Address, City, State, Zip"
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <hr className="my-8 border-gray-200" />

                        {/* Additional Info */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2 font-heading">
                                <BookOpen className="w-6 h-6 text-yellow-500" />
                                Academic & Medical History
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Previous School Attended</label>
                                    <input
                                        type="text" name="prevSchool"
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                                        placeholder="School Name"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Medical Conditions / Allergies (if any)</label>
                                    <textarea
                                        name="medicalInfo" rows={3}
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                                        placeholder="Please provide details..."
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Documents Placeholder */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2 font-heading">
                                <Upload className="w-6 h-6 text-yellow-500" />
                                Documents Upload
                            </h3>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-white hover:border-yellow-500 transition-all cursor-pointer">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 font-medium">Click to upload Passport Photo & Report Cards</p>
                                <p className="text-sm text-gray-500 mt-2">Maximum file size: 5MB (JPG, PDF)</p>
                            </div>
                        </div>


                        {/* Submit Button */}
                        <div className="text-center">
                            <button
                                type="submit"
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-12 rounded shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2 mx-auto uppercase tracking-wider"
                            >
                                <Send className="w-5 h-5" />
                                Submit Application
                            </button>
                            <p className="mt-4 text-sm text-gray-500">
                                By clicking submit, you agree to our terms and admission policies.
                            </p>
                        </div>

                    </form>
                </div>
            </section>
        </PublicLayout>
    );
};

export default ApplicationPage;
