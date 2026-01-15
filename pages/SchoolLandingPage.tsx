import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, Users, Trophy, ArrowRight, Calendar } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import HeroCarousel from '../components/HeroCarousel';
import TestimonialSlider from '../components/TestimonialSlider';

import { fetchNews } from '../services/apiService';
import { NewsItem } from '../types';

const SchoolLandingPage: React.FC = () => {
    // Shared animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerChildren = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    // State for dynamic content
    const [news, setNews] = React.useState<NewsItem[]>([]);

    React.useEffect(() => {
        const loadContent = async () => {
            try {
                const newsData = await fetchNews();
                setNews(newsData.slice(0, 3)); // Show top 3
            } catch (e) { console.error(e); }
        };
        loadContent();
    }, []);

    return (
        <PublicLayout transparentNavbar={true}>
            {/* Hero Carousel */}
            <HeroCarousel />

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
                                <span className="text-blue-900 font-bold uppercase tracking-widest text-sm font-heading">About COCIN Danbong</span>
                            </div>
                            <h2 className="text-4xl font-bold mb-6 text-gray-800 font-heading">COCIN Danbong</h2>
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                We are one of the world's leading academic institutions, dedicated to rigorous intellectual inquiry and the holistic development of our students. Our campus is a vibrant community where bright minds meet.
                            </p>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Founded in 1984, COCIN Danbong has consistently ranked among the top schools in the nation. We pride ourselves on our state-of-the-art facilities, distinguished faculty, and a supportive environment that fosters growth.
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

            {/* Testimonials */}
            <TestimonialSlider />

            {/* News & Events Preview */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-blue-900 font-bold uppercase tracking-widest text-sm">Stay Updated</span>
                        <h2 className="text-3xl font-bold text-gray-800 mt-2">Latest News & Events</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {news.length > 0 ? news.map((item, i) => (
                            <motion.div
                                key={item._id}
                                whileHover={{ y: -10 }}
                                className="bg-white rounded-lg overflow-hidden shadow-lg group"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img src={item.image || 'https://via.placeholder.com/400x300'} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 text-center rounded font-bold shadow">
                                        <span className="block text-lg leading-tight">{new Date(item.date).getDate()}</span>
                                        <span className="text-xs uppercase">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-blue-900 transition-colors cursor-pointer">{item.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4">{item.summary ? item.summary.substring(0, 100) : item.content.substring(0, 100)}...</p>
                                    <a href="#/blog" className="flex items-center text-sm font-bold text-gray-400 hover:text-yellow-500 transition-colors">
                                        <Calendar className="w-4 h-4 mr-2" /> Read Article
                                    </a>
                                </div>
                            </motion.div>
                        )) : (
                            <p className="text-center col-span-3 text-gray-500">No news posted yet.</p>
                        )}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default SchoolLandingPage;
