import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Activity, Search } from 'lucide-react';

const actionColors = {
    CREATE: 'bg-emerald-100 text-emerald-700',
    INSERT: 'bg-emerald-100 text-emerald-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-indigo-100 text-indigo-700',
    LOGOUT: 'bg-slate-100 text-slate-600',
};

const getActionColor = (action) => {
    const key = (action || '').toUpperCase().split(' ')[0];
    return actionColors[key] || 'bg-slate-100 text-slate-600';
};

export const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/audit-logs');
                if (response.data.success) setLogs(response.data.data);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filtered = logs.filter(log =>
        (log.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.table_name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{filtered.length} log entries</p>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white w-64 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1,2,3,4,5].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Table</th>
                                <th className="px-6 py-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <Activity size={40} className="mx-auto mb-3 text-slate-200" />
                                        <p className="text-slate-500">No audit logs found.</p>
                                    </td>
                                </tr>
                            ) : filtered.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                                        <p className="font-medium text-slate-700">{new Date(log.created_at).toLocaleDateString()}</p>
                                        <p>{new Date(log.created_at).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{log.email || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                            {log.role_name || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{log.table_name || '—'}</td>
                                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">{log.ip_address || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
