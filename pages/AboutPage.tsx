import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '../components/PublicLayout';

const AboutPage: React.FC = () => {
    return (
        <PublicLayout transparentNavbar={true}>
            {/* Page Header */}
            <section className="relative h-96 flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086&auto=format&fit=crop"
                        alt="About Header"
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
                        About Us
                    </motion.h1>
                    <div className="flex justify-center space-x-2 text-yellow-500 uppercase tracking-widest text-sm font-semibold">
                        <span>Home</span>
                        <span>/</span>
                        <span>About</span>
                    </div>
                </div>
            </section>

            {/* History Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row gap-16 items-center">
                        <div className="md:w-1/2">
                            <span className="text-blue-900 font-bold uppercase tracking-widest text-sm block mb-2 font-heading">Our History</span>
                            <h2 className="text-4xl font-bold text-gray-800 mb-6 font-heading">COCIN Danbong's Legacy of Excellence</h2>
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                Founded in 1984 under the visionary leadership, our institution began with a simple mission: to provide an education that balances academic rigor with moral character.
                            </p>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Over the decades, we have grown from a small campus of 50 students to a premier institution serving over 3,000 scholars from around the globe. Our commitment to innovation and tradition stands as the cornerstone of our success.
                            </p>
                            <div className="p-6 bg-gray-50 border-l-4 border-yellow-500 italic text-gray-700">
                                "Education is not the learning of facts, but the training of the mind to think." - Albert Einstein
                            </div>
                        </div>
                        <div className="md:w-1/2 relative">
                            <img
                                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
                                alt="History"
                                className="rounded shadow-xl w-full"
                            />
                            <div className="absolute -bottom-8 -right-8 bg-white p-6 shadow-xl rounded hidden md:block">
                                <div className="text-5xl font-bold text-blue-900 mb-1">40+</div>
                                <div className="text-gray-500 uppercase tracking-widest text-xs">Years of Excellence</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="p-8 border border-white/20 rounded hover:bg-white/5 transition-colors">
                            <h3 className="text-3xl font-bold mb-6 text-yellow-500 font-heading">Our Mission</h3>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                To empower students with the knowledge, skills, and values necessary to become responsible global citizens and leaders in their respective fields.
                            </p>
                        </div>
                        <div className="p-8 border border-white/20 rounded hover:bg-white/5 transition-colors">
                            <h3 className="text-3xl font-bold mb-6 text-yellow-500 font-heading">Our Vision</h3>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                To be recognized globally as a center of academic excellence, innovation, and holistic development, shaping the future of education.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership/Team Placeholder */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 text-center">
                    <span className="text-blue-900 font-bold uppercase tracking-widest text-sm block mb-2 font-heading">Our Leadership</span>
                    <h2 className="text-3xl font-bold text-gray-800 mb-12 font-heading">Principals & Deans</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="bg-white rounded overflow-hidden shadow-lg group">
                                <div className="h-64 overflow-hidden bg-gray-200">
                                    <img
                                        src={`https://images.unsplash.com/photo-${i === 0 ? '1560250097-0b93528c311a' : i === 1 ? '1573496359142-b8d87734a5a2' : '1580894732444-8ecded7900cd'}?q=80&w=800&auto=format&fit=crop`}
                                        alt="Team Member"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <h4 className="text-xl font-bold text-gray-800">Dr. Name Surname</h4>
                                    <span className="text-yellow-500 font-medium text-sm">Principal</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default AboutPage;
