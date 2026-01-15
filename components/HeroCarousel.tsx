import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
    {
        id: 1,
        image: "https://plus.unsplash.com/premium_photo-1661290835495-9d1a6144c19c?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        subtitle: "EST. 1984",
        title: "Education for the, Future Generation",
        desc: "Providing world-class education with a focus on holistic development, academic excellence, and character building."
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop",
        subtitle: "EXCELLENCE IN ACADEMICS",
        title: "Shaping Minds, Building Character",
        desc: "Our rigorous curriculum prepares students for top universities and global challenges."
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
        subtitle: "VIBRANT COMMUNITY",
        title: "A Campus Life, Like No Other",
        desc: "Join a diverse community where creativity, sports, and leadership thrive alongside academics."
    }
];

const HeroCarousel: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <img
                        src={slides[current].image}
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <span className="block text-xl md:text-2xl font-light mb-4 tracking-[0.2em] text-yellow-400 uppercase font-heading">
                            {slides[current].subtitle}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight font-heading">
                            {slides[current].title.includes(',') ? (
                                slides[current].title.split(',').map((part, i) => (
                                    <span key={i} className="block">
                                        {i === 1 ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">{part}</span> : part}
                                    </span>
                                ))
                            ) : (
                                <span>{slides[current].title}</span>
                            )}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
                            {slides[current].desc}
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/apply')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all transform hover:-translate-y-1 hover:shadow-xl rounded"
                            >
                                Apply Now
                            </button>
                            <button
                                onClick={() => navigate('/about')}
                                className="border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all rounded"
                            >
                                Take a Tour
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full border border-white/30 text-white/50 hover:bg-white hover:text-blue-900 transition-all hidden md:block"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full border border-white/30 text-white/50 hover:bg-white hover:text-blue-900 transition-all hidden md:block"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full transition-all ${current === index ? 'bg-yellow-500 w-8' : 'bg-white/50 hover:bg-white'}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroCarousel;
