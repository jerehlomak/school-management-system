import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Users, BookOpen, Upload } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { submitApplication } from '../services/apiService';
import { toast } from 'react-toastify';

const ApplicationPage: React.FC = () => {
    // ... existing initial state ...
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', middleName: '', dob: '', gender: '', grade: '',
        parentName: '', parentEmail: '', parentPhone: '', address: '', prevSchool: '', medicalInfo: ''
    });
    // State for files
    const [passport, setPassport] = useState<File | null>(null);
    const [documents, setDocuments] = useState<File[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ... handlers ...

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPassport(e.target.files[0]);
        }
    };

    const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, (formData as any)[key]);
            });

            if (passport) {
                data.append('passport', passport);
            }
            documents.forEach((doc) => {
                data.append('documents', doc);
            });

            await submitApplication(data);
            setSuccess(true);
            await submitApplication(data);
            setSuccess(true);
            toast.success("Application submitted successfully!");
        } catch (err: any) {
            console.error(err);
            const msg = err.message || "Failed to submit application.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <PublicLayout transparentNavbar={false}>
                <section className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
                    <div className="bg-white p-12 rounded-lg shadow-xl text-center max-w-lg">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Send className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Received!</h2>
                        <p className="text-gray-600 mb-8">
                            Thank you for applying to COCIN Danbong. We have received your details. Please expect an email from us regarding your application status and next steps within 5 working days.
                        </p>
                        <button onClick={() => window.location.reload()} className="text-blue-600 hover:text-blue-800 font-semibold">
                            Submit Another Application
                        </button>
                    </div>
                </section>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout transparentNavbar={false}>
            {/* Header */}
            <section className="bg-blue-900 pt-28 pb-10 text-white text-center">
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

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                                {error}
                            </div>
                        )}

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
                                        <option value="JSS 1">Grade 7 (JSS 1)</option>
                                        <option value="JSS 2">Grade 8 (JSS 2)</option>
                                        <option value="JSS 3">Grade 9 (JSS 3)</option>
                                        <option value="SSS 1">Grade 10 (SSS 1)</option>
                                        <option value="SSS 2">Grade 11 (SSS 2)</option>
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

                        {/* Documents */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2 font-heading">
                                <Upload className="w-6 h-6 text-yellow-500" />
                                Documents Upload
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Passport Photo */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Passport Photo <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-yellow-500 transition-colors bg-gray-50">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePassportChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Required. JPG/PNG only. Max 5MB.</p>
                                    </div>
                                </div>

                                {/* Supporting Documents */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Supporting Documents
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-yellow-500 transition-colors bg-gray-50">
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleDocumentsChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Birth Certificate, Previous Results, etc. (Can select multiple)</p>
                                    </div>
                                </div>
                            </div>

                            {/* File List Preview */}
                            {(passport || documents.length > 0) && (
                                <div className="mt-4 bg-gray-100 p-4 rounded text-sm text-gray-700">
                                    <p className="font-bold mb-2">Selected Files:</p>
                                    <ul className="list-disc pl-5">
                                        {passport && <li>Passport: {passport.name}</li>}
                                        {documents.map((doc, idx) => (
                                            <li key={idx}>Doc: {doc.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>


                        {/* Submit Button */}
                        <div className="text-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-12 rounded shadow-lg transform transition-all flex items-center gap-2 mx-auto uppercase tracking-wider ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                            >
                                {loading ? (
                                    <span>Submitting...</span>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Submit Application
                                    </>
                                )}
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
