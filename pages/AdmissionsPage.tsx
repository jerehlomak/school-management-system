import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, FileText, Calendar, CreditCard } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const AdmissionsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <PublicLayout transparentNavbar={true}>
            {/* Header */}
            <section className="relative h-96 flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                        alt="Admissions Header"
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
                        Admissions
                    </motion.h1>
                    <div className="flex justify-center space-x-2 text-yellow-500 uppercase tracking-widest text-sm font-semibold">
                        <span>Home</span>
                        <span>/</span>
                        <span>Admissions</span>
                    </div>
                </div>
            </section>

            {/* Intro */}
            <section className="py-20">
                <div className="container mx-auto px-6 text-center max-w-3xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Join Our Community</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        We welcome students who are curious, driven, and ready to make a difference. Our admission process is designed to get to know you as a person, not just a set of grades.
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-blue-900 font-bold uppercase tracking-widest text-sm">How to Apply</span>
                        <h2 className="text-3xl font-bold text-gray-800 mt-2">Application Process</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { icon: FileText, title: "1. Online Application", desc: "Complete the form and submit required details." },
                            { icon: CreditCard, title: "2. Application Fee", desc: "Pay the non-refundable application fee." },
                            { icon: Calendar, title: "3. Interview / Exam", desc: "Schedule an interview or entrance exam." },
                            { icon: CheckCircle, title: "4. Final Decision", desc: "Receive your offer letter and enroll." }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded shadow text-center group hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                    <step.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">{step.title}</h3>
                                <p className="text-gray-600 font-light">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-blue-900 text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-6">Ready to Apply?</h2>
                    <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
                        Applications for the upcoming academic year are now open. Secure your spot today.
                    </p>
                    <button
                        onClick={() => navigate('/apply')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-10 py-4 font-bold rounded shadow-lg uppercase tracking-wider transition-colors"
                    >
                        Apply Online Now
                    </button>
                </div>
            </section>
        </PublicLayout>
    );
};

export default AdmissionsPage;
