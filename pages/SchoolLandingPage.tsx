
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Trophy, ArrowRight, Menu, X, Monitor, Calendar } from 'lucide-react';

const SchoolLandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
    const heroY = useTransform(scrollY, [0, 600], [0, 200]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerChildren = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    return (
        <div className="font-sans text-gray-800 overflow-x-hidden bg-white">
            {/* Navbar */}
            <nav
                className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-6'}`}
            >
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <GraduationCap className={`w-8 h-8 ${isScrolled ? 'text-blue-900' : 'text-white'}`} />
                        <span className={`text-2xl font-bold ${isScrolled ? 'text-blue-900' : 'text-white'}`}>Kingster High</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {['Home', 'Admissions', 'Academics', 'Athletics', 'News'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className={`text-sm font-semibold uppercase tracking-wider hover:text-yellow-500 transition-colors ${isScrolled ? 'text-gray-700' : 'text-white/90'}`}
                            >
                                {item}
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
                        {isMobileMenuOpen ? <X className="text-gray-800" /> : <Menu className={isScrolled ? 'text-gray-800' : 'text-white'} />}
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
                            {['Home', 'Admissions', 'Academics', 'Athletics', 'News'].map((item) => (
                                <a key={item} href="#" className="text-gray-800 font-semibold hover:text-blue-900">{item}</a>
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

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
                        alt="University Campus"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/40" />
                </div>

                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
                >
                    <motion.span
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="block text-xl md:text-2xl font-light mb-4 tracking-[0.2em] text-yellow-400"
                    >
                        EST. 1984
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                    >
                        Education for the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                            Future Generation
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light"
                    >
                        Providing world-class education with a focus on holistic development, academic excellence, and character building.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col md:flex-row gap-4 justify-center"
                    >
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all transform hover:-translate-y-1 hover:shadow-xl rounded">
                            Apply Now
                        </button>
                        <button className="border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all rounded">
                            Take a Tour
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50 relative -mt-20 z-20 container mx-auto px-4">
                <motion.div
                    variants={staggerChildren}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {[
                        { icon: BookOpen, title: "Special Education", desc: "Tailored learning programs ensuring every student reaches their full potential." },
                        { icon: Users, title: "Honors Classes", desc: "Rigorous academic pathways for high-achieving students preparing for top universities." },
                        { icon: Trophy, title: "Traditional Academy", desc: "A time-honored approach to education focusing on core values and discipline." }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={fadeIn}
                            className="bg-white p-8 rounded shadow-lg hover:shadow-2xl transition-all duration-300 border-b-4 border-transparent hover:border-yellow-500 group"
                        >
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-900 transition-colors">
                                <feature.icon className="w-8 h-8 text-blue-900 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            <a href="#" className="inline-flex items-center mt-6 text-yellow-500 font-bold hover:text-yellow-600">
                                Learn More <ArrowRight className="w-4 h-4 ml-2" />
                            </a>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* About Section */}
            <section className="py-20 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="md:w-1/2 relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-yellow-500 transform translate-x-4 translate-y-4 -z-10 rounded" />
                            <img
                                src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop"
                                alt="Student studying"
                                className="w-full h-auto rounded shadow-xl"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="md:w-1/2"
                        >
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="h-0.5 w-12 bg-yellow-500"></div>
                                <span className="text-blue-900 font-bold uppercase tracking-widest text-sm">About University</span>
                            </div>
                            <h2 className="text-4xl font-bold mb-6 text-gray-800">Kingster University</h2>
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                We are one of the world's leading academic institutions, dedicated to rigorous intellectual inquiry and the holistic development of our students. Our campus is a vibrant community where bright minds meet.
                            </p>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Founded in 1984, Kingster High has consistently ranked among the top schools in the nation. We pride ourselves on our state-of-the-art facilities, distinguished faculty, and a supportive environment that fosters growth.
                            </p>
                            <button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded shadow-lg transition-colors font-bold">
                                Read More
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section with Parallax */}
            <section className="py-24 bg-blue-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { num: "3,000+", label: "STUDENTS" },
                            { num: "120+", label: "FACULTY" },
                            { num: "50+", label: "AWARDS" },
                            { num: "100%", label: "GRADUATION" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, type: "spring" }}
                            >
                                <h3 className="text-5xl font-bold mb-2 text-yellow-400">{stat.num}</h3>
                                <p className="font-semibold tracking-widest text-sm uppercase text-blue-200">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* News & Events Preview */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-blue-900 font-bold uppercase tracking-widest text-sm">Stay Updated</span>
                        <h2 className="text-3xl font-bold text-gray-800 mt-2">Latest News & Events</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { date: "15 Jan", title: "Professor Albert won the Researcher of the Year", img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1770&auto=format&fit=crop" },
                            { date: "22 Jan", title: "Kingster Basketball Team Finals", img: "https://images.unsplash.com/photo-1546519638-68e109498ad0?q=80&w=1770&auto=format&fit=crop" },
                            { date: "05 Feb", title: "Guest Lecture: Future of AI", img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1949&auto=format&fit=crop" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white rounded-lg overflow-hidden shadow-lg group"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img src={item.img} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 text-center rounded font-bold shadow">
                                        <span className="block text-lg leading-tight">{item.date.split(' ')[0]}</span>
                                        <span className="text-xs uppercase">{item.date.split(' ')[1]}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-blue-900 transition-colors cursor-pointer">{item.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                                    <a href="#" className="flex items-center text-sm font-bold text-gray-400 hover:text-yellow-500 transition-colors">
                                        <Calendar className="w-4 h-4 mr-2" /> Read Article
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-16">
                <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
                    <div>
                        <div className="flex items-center space-x-2 text-white mb-6">
                            <GraduationCap className="w-8 h-8" />
                            <span className="text-2xl font-bold">Kingster</span>
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
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Our Campus</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Acedemic</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Planning & Administration</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Campus Safety</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Facility Services</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Academics</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Canvas</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Catalyst</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Library</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Time Schedule</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Contact Us</h4>
                        <p className="mb-4">123 Kingster St, Education City, ED 54321</p>
                        <p className="mb-4 text-white font-bold">+1-234-567-8900</p>
                        <p className="text-yellow-500">info@kingsteruni.edu</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SchoolLandingPage;
