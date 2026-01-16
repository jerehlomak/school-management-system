import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { submitContactForm } from '../services/apiService';
import { toast } from 'react-toastify';

const ContactPage: React.FC = () => {
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await submitContactForm(formState);
            toast.success("Thanks for contacting us! We'll get back to you shortly.");
            setFormState({ name: '', email: '', message: '' });
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout transparentNavbar={true}>
            {/* Header */}
            <section className="relative h-96 flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?q=80&w=2010&auto=format&fit=crop"
                        alt="Contact Header"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-900/70"></div>
                </div>
                <div className="relative z-10 text-center text-white">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold mb-4 font-heading"
                    >
                        Contact Us
                    </motion.h1>
                    <div className="flex justify-center space-x-2 text-yellow-500 uppercase tracking-widest text-sm font-semibold">
                        <span>Home</span>
                        <span>/</span>
                        <span>Contact</span>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16">
                        {/* Info & Map */}
                        <div>
                            <span className="text-blue-900 font-bold uppercase tracking-widest text-sm block mb-4">Get in Touch</span>
                            <h2 className="text-3xl font-bold text-gray-800 mb-8">Visit or Call Us</h2>

                            <div className="space-y-8 mb-12">
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center text-blue-900 mr-6">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-2">Location</h4>
                                        <p className="text-gray-600">123 COCIN Danbong St, Education City, ED 54321, United States</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center text-blue-900 mr-6">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-2">Phone</h4>
                                        <p className="text-gray-600">+1-234-567-8900</p>
                                        <p className="text-gray-600">+1-999-888-7777</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center text-blue-900 mr-6">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-2">Email</h4>
                                        <p className="text-gray-600">info@cocindanbong.edu</p>
                                        <p className="text-gray-600">admissions@cocindanbong.edu</p>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="h-64 bg-gray-200 rounded relative overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=2662&auto=format&fit=crop" alt="Map" className="w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="bg-white/90 px-4 py-2 rounded font-bold text-gray-800">Map Integration Here</span>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-gray-50 p-10 rounded-lg">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                        placeholder="John Doe"
                                        value={formState.name}
                                        onChange={e => setFormState({ ...formState, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                        placeholder="john@example.com"
                                        value={formState.email}
                                        onChange={e => setFormState({ ...formState, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                                    <textarea
                                        id="message"
                                        rows={5}
                                        required
                                        className="w-full px-4 py-3 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
                                        placeholder="How can we help you?"
                                        value={formState.message}
                                        onChange={e => setFormState({ ...formState, message: e.target.value })}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className={`w-full bg-blue-900 text-white font-bold py-4 rounded hover:bg-blue-800 transition-colors flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    {loading ? 'Sending...' : <><Send className="w-5 h-5 mr-2" /> Send Message</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default ContactPage;
