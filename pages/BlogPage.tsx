import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Tag } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const BlogPage: React.FC = () => {
    const posts = [
        {
            title: "Professor Albert won the Researcher of the Year",
            date: "June 6, 2024",
            author: "John Smith",
            image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1770&auto=format&fit=crop",
            tag: "Academics"
        },
        {
            title: "COCIN Danbong Basketball Team Finals",
            date: "June 5, 2024",
            author: "Jane Doe",
            image: "https://images.unsplash.com/photo-1546519638-68e109498ad0?q=80&w=1770&auto=format&fit=crop",
            tag: "Sports"
        },
        {
            title: "Guest Lecture: Future of AI",
            date: "June 4, 2024",
            author: "Tech Team",
            image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1949&auto=format&fit=crop",
            tag: "Technology"
        },
        {
            title: "Annual Science Fair Winners",
            date: "May 28, 2024",
            author: "Science Dept",
            image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=1974&auto=format&fit=crop",
            tag: "Events"
        },
        {
            title: "New Library Wing Opening",
            date: "May 20, 2024",
            author: "Admin",
            image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop",
            tag: "Campus"
        },
        {
            title: "Student Art Exhibition",
            date: "May 15, 2024",
            author: "Arts Club",
            image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1780&auto=format&fit=crop",
            tag: "Arts"
        }
    ];

    return (
        <PublicLayout transparentNavbar={true}>
            {/* Header */}
            <section className="relative h-96 flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop"
                        alt="Blog Header"
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
                        News & Updates
                    </motion.h1>
                    <div className="flex justify-center space-x-2 text-yellow-500 uppercase tracking-widest text-sm font-semibold">
                        <span>Home</span>
                        <span>/</span>
                        <span>Blog</span>
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {posts.map((post, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 text-xs font-bold uppercase rounded">
                                        {post.tag}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center text-gray-500 text-xs mb-4 space-x-4">
                                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {post.date}</span>
                                        <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {post.author}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-900 transition-colors cursor-pointer">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor...
                                    </p>
                                    <a href="#" className="text-sm font-bold text-gray-400 hover:text-yellow-500 uppercase tracking-wide">Read More</a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default BlogPage;
