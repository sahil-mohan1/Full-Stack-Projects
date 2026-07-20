import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Plus, Trash2, Edit, X, Calendar, User } from 'lucide-react';

const ANN_COLORS = [
    { border: 'border-indigo-200', bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', pin: 'bg-indigo-500' },
    { border: 'border-purple-200', bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', pin: 'bg-purple-500' },
    { border: 'border-rose-200', bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', pin: 'bg-rose-500' },
    { border: 'border-amber-200', bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', pin: 'bg-amber-500' },
    { border: 'border-cyan-200', bg: 'bg-cyan-50', icon: 'bg-cyan-100 text-cyan-600', pin: 'bg-cyan-500' },
];

export const Announcements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, title: '', content: '' });
    const [saving, setSaving] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get('/announcements');
            if (response.data.success) setAnnouncements(response.data.data);
        } catch { /* silently fail */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const openNew = () => {
        setFormData({ id: null, title: '', content: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (formData.id) {
                await api.put(`/announcements/${formData.id}`, formData);
            } else {
                await api.post('/announcements', formData);
            }
            setShowModal(false);
            fetchAnnouncements();
        } catch {
            alert('Failed to save announcement');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            await api.delete(`/announcements/${id}`);
            fetchAnnouncements();
        } catch { /* silently fail */ }
    };

    const isAdmin = ['Super Admin', 'HR', 'HR Admin'].includes(user?.role);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{announcements.length} announcements</p>
                {isAdmin && (
                    <button
                        onClick={openNew}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-semibold text-sm"
                    >
                        <Plus size={18} />
                        New Announcement
                    </button>
                )}
            </div>

            {/* Announcements list */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-36 skeleton rounded-2xl" />)}
                </div>
            ) : announcements.length === 0 ? (
                <div className="bg-white rounded-2xl p-14 text-center shadow-sm border border-slate-100">
                    <Megaphone size={48} className="mx-auto mb-4 text-slate-200" />
                    <p className="text-slate-500 font-medium">No announcements yet</p>
                    {isAdmin && (
                        <button onClick={openNew} className="mt-4 text-indigo-600 font-semibold text-sm hover:text-indigo-800">
                            Post the first one →
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((ann, i) => {
                        const color = ANN_COLORS[i % ANN_COLORS.length];
                        return (
                            <div key={ann.id} className={`bg-white rounded-2xl shadow-sm border ${color.border} overflow-hidden group hover:shadow-md transition-all duration-200`}>
                                <div className={`h-1.5 w-full ${color.pin}`} />
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className={`p-2.5 rounded-xl flex-shrink-0 ${color.icon}`}>
                                                <Megaphone size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-slate-800 mb-2">{ann.title}</h3>
                                                <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                                                <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <User size={12} />
                                                        {ann.creator_email || 'Admin'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <button
                                                    onClick={() => { setFormData({ id: ann.id, title: ann.title, content: ann.content }); setShowModal(true); }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ann.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">
                                {formData.id ? 'Edit Announcement' : 'New Announcement'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                                <input
                                    type="text" required
                                    placeholder="Announcement title..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Content</label>
                                <textarea
                                    required rows="5"
                                    placeholder="Write your announcement here..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm disabled:opacity-60">
                                    {saving ? 'Saving...' : (formData.id ? 'Update' : 'Post Announcement')}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
