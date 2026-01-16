import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchTestimonials } from '../services/apiService';
import { TestimonialItem } from '../types';

const TestimonialSlider: React.FC = () => {
    const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTestimonials = async () => {
            try {
                const data = await fetchTestimonials();
                setTestimonials(data);
            } catch (error) {
                console.error("Failed to fetch testimonials:", error);
            } finally {
                setLoading(false);
            }
        };
        loadTestimonials();
    }, []);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % testimonials.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    if (loading) return null; // Or a loading spinner if preferred
    if (testimonials.length === 0) return null;

    return (
        <section className="pt-8 pb-20 bg-blue-900 overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-yellow-500 font-bold uppercase tracking-widest text-sm font-heading">Testimonials</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 font-heading">What Parents Say</h2>
                </div>

                <div className="max-w-4xl mx-auto relative">
                    {/* Navigation Buttons */}
                    {testimonials.length > 1 && (
                        <>
                            <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-20 text-white/30 hover:text-yellow-500 transition-colors hidden md:block">
                                <ChevronLeft className="w-10 h-10" />
                            </button>
                            <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-20 text-white/30 hover:text-yellow-500 transition-colors hidden md:block">
                                <ChevronRight className="w-10 h-10" />
                            </button>
                        </>
                    )}

                    <div className="bg-white rounded-lg p-8 md:p-12 shadow-2xl relative">
                        <div className="absolute top-0 left-0 transform -translate-x-6 -translate-y-6 text-yellow-500 hidden md:block">
                            <Quote size={64} fill="currentColor" className="opacity-20" />
                        </div>

                        <div className="min-h-[250px] flex items-center justify-center">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={current}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center"
                                >
                                    <p className="text-xl md:text-2xl text-gray-700 font-light italic leading-relaxed mb-8">
                                        "{testimonials[current].text}"
                                    </p>
                                    <div className="flex flex-col items-center">
                                        <img
                                            src={testimonials[current].image || 'https://via.placeholder.com/150'}
                                            alt={testimonials[current].name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500 mb-4"
                                        />
                                        <h4 className="text-lg font-bold text-blue-900">{testimonials[current].name}</h4>
                                        <span className="text-sm text-gray-500 uppercase tracking-wide">{testimonials[current].role}</span>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Dots Mobile */}
                    {testimonials.length > 1 && (
                        <div className="flex justify-center space-x-2 mt-8 md:hidden">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrent(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${current === index ? 'bg-yellow-500 w-6' : 'bg-white/30'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSlider;
