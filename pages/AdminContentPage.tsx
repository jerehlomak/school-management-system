import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { Plus, Trash, Image as ImageIcon, Calendar, FileText } from 'lucide-react';
import {
    fetchNews, createNews, deleteNews,
    fetchEvents, createEvent, deleteEvent,
    fetchGallery, createGalleryItem, deleteGalleryItem
} from '../services/apiService';
import { NewsItem, EventItem, GalleryItem } from '../types';
import Table from '../components/Table';
import Button from '../components/Button';

const AdminContentPage: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [n, e, g] = await Promise.all([fetchNews(), fetchEvents(), fetchGallery()]);
            setNews(n);
            setEvents(e);
            setGallery(g);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---
    const handleDelete = async (type: 'news' | 'event' | 'gallery', id: string) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            if (type === 'news') { await deleteNews(id); setNews(p => p.filter(x => x._id !== id)); }
            if (type === 'event') { await deleteEvent(id); setEvents(p => p.filter(x => x._id !== id)); }
            if (type === 'gallery') { await deleteGalleryItem(id); setGallery(p => p.filter(x => x._id !== id)); }
        } catch (err) { alert('Failed to delete'); }
    };

    // --- Forms State ---
    const [newsForm, setNewsForm] = useState({ title: '', content: '', category: 'General', summary: '' });
    const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', time: '', location: '' });
    const [galleryForm, setGalleryForm] = useState({ title: '', category: 'General' });
    const [file, setFile] = useState<File | null>(null);

    const handleNewsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(newsForm).forEach(([k, v]) => fd.append(k, v as string));
        if (file) fd.append('image', file);
        await createNews(fd);
        setNewsForm({ title: '', content: '', category: 'General', summary: '' }); setFile(null); loadData();
    };

    const handleEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(eventForm).forEach(([k, v]) => fd.append(k, v as string));
        if (file) fd.append('image', file);
        await createEvent(fd);
        setEventForm({ title: '', description: '', date: '', time: '', location: '' }); setFile(null); loadData();
    };

    const handleGallerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert('Image is required');
        const fd = new FormData();
        Object.entries(galleryForm).forEach(([k, v]) => fd.append(k, v as string));
        fd.append('image', file);
        await createGalleryItem(fd);
        setGalleryForm({ title: '', category: 'General' }); setFile(null); loadData();
    };

    function classNames(...classes: string[]) {
        return classes.filter(Boolean).join(' ')
    }

    if (loading) return <div className="p-8">Loading content...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Content Management</h1>

            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
                    {['News', 'Events', 'Gallery'].map((category) => (
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
                            <h3 className="font-bold mb-4">Add News Article</h3>
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
                                <Button type="submit" variant="primary">Publish News</Button>
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
                                        <button onClick={() => handleDelete('news', item._id)} className="text-red-500 hover:text-red-700">
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Tab.Panel>

                    {/* EVENTS PANEL */}
                    <Tab.Panel>
                        <div className="bg-white p-6 rounded-lg shadow mb-8">
                            <h3 className="font-bold mb-4">Add Event</h3>
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
                                <Button type="submit" variant="primary">Create Event</Button>
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
                                    <button onClick={() => handleDelete('event', item._id)} className="text-red-500 hover:text-red-700">
                                        <Trash className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Tab.Panel>

                    {/* GALLERY PANEL */}
                    <Tab.Panel>
                        <div className="bg-white p-6 rounded-lg shadow mb-8">
                            <h3 className="font-bold mb-4">Upload to Gallery</h3>
                            <form onSubmit={handleGallerySubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Caption/Title" className="block w-full border p-2 rounded"
                                        value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} />
                                    <input type="text" placeholder="Category" className="block w-full border p-2 rounded"
                                        value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })} />
                                </div>
                                <div className="border-2 border-dashed p-8 text-center rounded">
                                    <input type="file" required accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                                </div>
                                <Button type="submit" variant="primary">Upload Photo</Button>
                            </form>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {gallery.map(item => (
                                <div key={item._id} className="relative group rounded overflow-hidden shadow">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
                                    <button onClick={() => handleDelete('gallery', item._id)}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                    <div className="p-2 text-xs bg-white">
                                        <p className="font-bold truncate">{item.title || 'Untitled'}</p>
                                        <p className="text-gray-500">{item.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default AdminContentPage;
