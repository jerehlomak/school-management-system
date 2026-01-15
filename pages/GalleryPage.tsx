import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '../components/PublicLayout';

const GalleryPage: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

    const images = [
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1596496181961-d748f52af8ee?q=80&w=1974&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1772&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=1974&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1770&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1832&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=1770&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1510531704581-5b2870972060?q=80&w=1773&auto=format&fit=crop",
    ];

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex + 1) % images.length);
        }
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
        }
    };

    const handleClose = () => setSelectedIndex(null);

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex]);

    return (
        <PublicLayout transparentNavbar={true}>
            {/* Header */}
            <section className="relative h-96 flex items-center justify-center">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?q=80&w=2070&auto=format&fit=crop"
                        alt="Gallery Header"
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
                        Campus Gallery
                    </motion.h1>
                    <div className="flex justify-center space-x-2 text-yellow-500 uppercase tracking-widest text-sm font-semibold">
                        <span>Home</span>
                        <span>/</span>
                        <span>Gallery</span>
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        {images.map((src, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="h-64 rounded overflow-hidden shadow-lg cursor-pointer group relative"
                                onClick={() => setSelectedIndex(i)}
                            >
                                <img
                                    src={src}
                                    alt={`Gallery ${i}`}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                                    <span className="text-white font-bold uppercase tracking-widest border border-white px-4 py-2">View</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-50"
                    >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>

                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4 rounded-full bg-black/20 hover:bg-black/50 transition-colors z-50"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4 rounded-full bg-black/20 hover:bg-black/50 transition-colors z-50"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>

                    {/* Image Container */}
                    <div
                        className="relative max-w-7xl w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image area
                    >
                        <motion.img
                            key={selectedIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            src={images[selectedIndex]}
                            alt="Gallery Fullscreen"
                            className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
                        />
                        <div className="absolute bottom-4 left-0 right-0 text-center text-white/80 font-medium">
                            {selectedIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
};

export default GalleryPage;
