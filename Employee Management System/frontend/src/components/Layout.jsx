import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-y-auto">
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
