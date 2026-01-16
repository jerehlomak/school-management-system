import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { Plus, Trash, Image as ImageIcon, Calendar, FileText } from 'lucide-react';
import {
    fetchNews, createNews, updateNews, deleteNews,
    fetchEvents, createEvent, updateEvent, deleteEvent,
    fetchGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem,
    fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial
} from '../services/apiService';
import { NewsItem, EventItem, GalleryItem, TestimonialItem } from '../types';
import Table from '../components/Table';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { Pencil } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminContentPage: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [n, e, g, t] = await Promise.all([fetchNews(), fetchEvents(), fetchGallery(), fetchTestimonials()]);
            setNews(n);
            setEvents(e);
            setGallery(g);
            setTestimonials(t);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load content.");
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---
    // --- UI State ---
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'news' | 'event' | 'gallery' | 'testimonial', id: string } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- Handlers ---
    // --- Handlers ---
    const requestDelete = (type: 'news' | 'event' | 'gallery' | 'testimonial', id: string) => {
        setItemToDelete({ type, id });
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (itemToDelete.type === 'news') { await deleteNews(itemToDelete.id); setNews(p => p.filter(x => x._id !== itemToDelete.id)); }
            if (itemToDelete.type === 'event') { await deleteEvent(itemToDelete.id); setEvents(p => p.filter(x => x._id !== itemToDelete.id)); }
            if (itemToDelete.type === 'gallery') { await deleteGalleryItem(itemToDelete.id); setGallery(p => p.filter(x => x._id !== itemToDelete.id)); }
            if (itemToDelete.type === 'testimonial') { await deleteTestimonial(itemToDelete.id); setTestimonials(p => p.filter(x => x._id !== itemToDelete.id)); }
            toast.success("Deleted successfully");
        } catch (err) { toast.error('Failed to delete'); }
        setDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNewsForm({ title: '', content: '', category: 'General', summary: '' });
        setEventForm({ title: '', description: '', date: '', time: '', location: '' });
        setGalleryForm({ title: '', category: 'General' });
        setTestimonialForm({ name: '', role: '', text: '' });
        setFile(null);
    };

    // --- Forms State ---
    const [newsForm, setNewsForm] = useState({ title: '', content: '', category: 'General', summary: '' });
    const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', time: '', location: '' });
    const [galleryForm, setGalleryForm] = useState({ title: '', category: 'General' });
    const [testimonialForm, setTestimonialForm] = useState({ name: '', role: '', text: '' });
    const [file, setFile] = useState<File | null>(null);

    const handleNewsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(newsForm).forEach(([k, v]) => fd.append(k, v as string));
        if (file) fd.append('image', file);

        if (editingId) { await updateNews(editingId, fd); toast.success("News updated"); }
        else { await createNews(fd); toast.success("News created"); }

        setNewsForm({ title: '', content: '', category: 'General', summary: '' }); setFile(null); setEditingId(null); loadData();
    };

    const startEditNews = (item: NewsItem) => {
        setNewsForm({ title: item.title, content: item.content, category: item.category, summary: item.summary });
        setEditingId(item._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(eventForm).forEach(([k, v]) => fd.append(k, v as string));
        if (file) fd.append('image', file);

        if (editingId) { await updateEvent(editingId, fd); toast.success("Event updated"); }
        else { await createEvent(fd); toast.success("Event created"); }

        setEventForm({ title: '', description: '', date: '', time: '', location: '' }); setFile(null); setEditingId(null); loadData();
    };

    const startEditEvent = (item: EventItem) => {
        // Format date to YYYY-MM-DD for input
        const dateStr = new Date(item.date).toISOString().split('T')[0];
        setEventForm({ title: item.title, description: item.description, date: dateStr, time: item.time, location: item.location });
        setEditingId(item._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleGallerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file && !editingId) return toast.error('Image is required for new items');
        const fd = new FormData();
        Object.entries(galleryForm).forEach(([k, v]) => fd.append(k, v as string));
        if (file) fd.append('image', file);

        if (editingId) { await updateGalleryItem(editingId, fd); toast.success("Gallery item updated"); }
        else { await createGalleryItem(fd); toast.success("Gallery item added"); }

        setGalleryForm({ title: '', category: 'General' }); setFile(null); setEditingId(null); loadData();
    };

    const startEditGallery = (item: GalleryItem) => {
        setGalleryForm({ title: item.title, category: item.category });
        setEditingId(item._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTestimonialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(testimonialForm).forEach(([k, v]) => fd.append(k, v as string));
        if (file) fd.append('image', file);

        if (editingId) { await updateTestimonial(editingId, fd); toast.success("Testimonial updated"); }
        else { await createTestimonial(fd); toast.success("Testimonial added"); }

        setTestimonialForm({ name: '', role: '', text: '' }); setFile(null); setEditingId(null); loadData();
    };

    const startEditTestimonial = (item: TestimonialItem) => {
        setTestimonialForm({ name: item.name, role: item.role, text: item.text });
        setEditingId(item._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    function classNames(...classes: string[]) {
        return classes.filter(Boolean).join(' ')
    }

    if (loading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Content Management</h1>

            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
                    {['News', 'Events', 'Gallery', 'Testimonials'].map((category) => (
                        <Tab
                            key={category}
                            className={({ selected }) =>
                                classNames(
                                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                    selected ? 'bg-white shadow text-blue-700' : 'text-blue-600 hover:bg-white/[0.12] hover:text-white'
                                )
                            }
                        >
                            {category}
                        </Tab>
                    ))}
                </Tab.List>

                <Tab.Panels>
                    {/* NEWS PANEL */}
                    <Tab.Panel>
                        <div className="bg-white p-6 rounded-lg shadow mb-8">
                            <h3 className="font-bold mb-4">{editingId ? 'Edit News Article' : 'Add News Article'}</h3>
                            <form onSubmit={handleNewsSubmit} className="space-y-4">
                                <input type="text" placeholder="Title" required className="block w-full border p-2 rounded"
                                    value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Category" className="block w-full border p-2 rounded"
                                        value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })} />
                                    <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="block w-full border p-2 rounded" />
                                </div>
                                <textarea placeholder="Summary" className="block w-full border p-2 rounded"
                                    value={newsForm.summary} onChange={e => setNewsForm({ ...newsForm, summary: e.target.value })} />
                                <textarea placeholder="Content" required rows={4} className="block w-full border p-2 rounded"
                                    value={newsForm.content} onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} />
                                <div className="flex gap-2">
                                    <Button type="submit" variant="primary">{editingId ? 'Update News' : 'Publish News'}</Button>
                                    {editingId && <Button variant="secondary" onClick={cancelEdit}>Cancel Edit</Button>}
                                </div>
                            </form>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-bold mb-4">Existing News</h3>
                            <div className="grid gap-4">
                                {news.map(item => (
                                    <div key={item._id} className="flex justify-between items-center border-b pb-2">
                                        <div>
                                            <p className="font-bold">{item.title}</p>
                                            <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEditNews(item)} className="text-blue-500 hover:text-blue-700">
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => requestDelete('news', item._id)} className="text-red-500 hover:text-red-700">
                                                <Trash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Tab.Panel>

                    {/* EVENTS PANEL */}
                    <Tab.Panel>
                        <div className="bg-white p-6 rounded-lg shadow mb-8">
                            <h3 className="font-bold mb-4">{editingId ? 'Edit Event' : 'Add Event'}</h3>
                            <form onSubmit={handleEventSubmit} className="space-y-4">
                                <input type="text" placeholder="Title" required className="block w-full border p-2 rounded"
                                    value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="date" required className="block w-full border p-2 rounded"
                                        value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                                    <input type="time" className="block w-full border p-2 rounded"
                                        value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Location" className="block w-full border p-2 rounded"
                                        value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} />
                                    <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="block w-full border p-2 rounded" />
                                </div>
                                <textarea placeholder="Description" rows={3} className="block w-full border p-2 rounded"
                                    value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                                <div className="flex gap-2">
                                    <Button type="submit" variant="primary">{editingId ? 'Update Event' : 'Create Event'}</Button>
                                    {editingId && <Button variant="secondary" onClick={cancelEdit}>Cancel Edit</Button>}
                                </div>
                            </form>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-bold mb-4">Upcoming Events</h3>
                            {events.map(item => (
                                <div key={item._id} className="flex justify-between items-center border-b pb-2 mb-2">
                                    <div>
                                        <p className="font-bold">{item.title}</p>
                                        <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()} @ {item.location}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => startEditEvent(item)} className="text-blue-500 hover:text-blue-700">
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => requestDelete('event', item._id)} className="text-red-500 hover:text-red-700">
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Tab.Panel>

                    {/* GALLERY PANEL */}
                    <Tab.Panel>
                        <div className="bg-white p-6 rounded-lg shadow mb-8">
                            <h3 className="font-bold mb-4">{editingId ? 'Edit Gallery Item' : 'Upload to Gallery'}</h3>
                            <form onSubmit={handleGallerySubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Caption/Title" className="block w-full border p-2 rounded"
                                        value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} />
                                    <input type="text" placeholder="Category" className="block w-full border p-2 rounded"
                                        value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })} />
                                </div>
                                <div className="border-2 border-dashed p-8 text-center rounded">
                                    <input type="file" required={!editingId} accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                                    {editingId && <p className="text-xs text-gray-500 mt-2">Leave empty to keep existing image</p>}
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" variant="primary">{editingId ? 'Update Photo' : 'Upload Photo'}</Button>
                                    {editingId && <Button variant="secondary" onClick={cancelEdit}>Cancel Edit</Button>}
                                </div>
                            </form>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {gallery.map(item => (
                                <div key={item._id} className="relative group rounded overflow-hidden shadow">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
                                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEditGallery(item)}
                                            className="bg-blue-600 text-white p-1 rounded">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => requestDelete('gallery', item._id)}
                                            className="bg-red-600 text-white p-1 rounded">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="p-2 text-xs bg-white">
                                        <p className="font-bold truncate">{item.title || 'Untitled'}</p>
                                        <p className="text-gray-500">{item.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Tab.Panel>

                    {/* TESTIMONIALS PANEL */}
                    <Tab.Panel>
                        <div className="bg-white p-6 rounded-lg shadow mb-8">
                            <h3 className="font-bold mb-4">{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                            <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Name" required className="block w-full border p-2 rounded"
                                        value={testimonialForm.name} onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })} />
                                    <input type="text" placeholder="Role (e.g. Parent, Student)" required className="block w-full border p-2 rounded"
                                        value={testimonialForm.role} onChange={e => setTestimonialForm({ ...testimonialForm, role: e.target.value })} />
                                </div>
                                <textarea placeholder="Testimonial Text" required rows={3} className="block w-full border p-2 rounded"
                                    value={testimonialForm.text} onChange={e => setTestimonialForm({ ...testimonialForm, text: e.target.value })} />
                                <div className="border-2 border-dashed p-4 text-center rounded">
                                    <p className="text-sm text-gray-500 mb-2">Author Image (Optional)</p>
                                    <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" variant="primary">{editingId ? 'Update Testimonial' : 'Add Testimonial'}</Button>
                                    {editingId && <Button variant="secondary" onClick={cancelEdit}>Cancel Edit</Button>}
                                </div>
                            </form>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="font-bold mb-4">Existing Testimonials</h3>
                            <div className="grid gap-4">
                                {testimonials.map(item => (
                                    <div key={item._id} className="flex justify-between items-start border-b pb-4">
                                        <div className="flex gap-4">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">
                                                    {item.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold">{item.name} <span className="text-sm text-gray-500 font-normal">({item.role})</span></p>
                                                <p className="text-gray-700 italic">"{item.text}"</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEditTestimonial(item)} className="text-blue-500 hover:text-blue-700">
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => requestDelete('testimonial', item._id)} className="text-red-500 hover:text-red-700">
                                                <Trash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm Delete"
                footer={
                    <>
                        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                    </>
                }
            >
                <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default AdminContentPage;
