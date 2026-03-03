'use client';

import { useState } from 'react';
import { ShieldAlert, Trash2, UserPlus, Shield } from 'lucide-react';
import { createAdmin, deleteAdmin } from './actions';

type Admin = {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
};

export default function AdminUsersClient({ initialAdmins, currentAdminId }: { initialAdmins: Admin[], currentAdminId: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleCreate(formData: FormData) {
        setLoading(true);
        setError('');
        try {
            await createAdmin(formData);
            // Form is reset automatically via uncontrolled inputs or we can manually reset here
            (document.getElementById('create-admin-form') as HTMLFormElement).reset();
        } catch (err: any) {
            setError(err.message || "Failed to create admin");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this admin account?")) return;
        setLoading(true);
        setError('');
        try {
            await deleteAdmin(id);
        } catch (err: any) {
            setError(err.message || "Failed to delete admin");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="p-4 font-medium text-slate-300">Name</th>
                                <th className="p-4 font-medium text-slate-300">Email</th>
                                <th className="p-4 font-medium text-slate-300">Role</th>
                                <th className="p-4 font-medium text-slate-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {initialAdmins.map(admin => (
                                <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-white font-medium">{admin.name}</td>
                                    <td className="p-4 text-slate-400 text-sm">{admin.email}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${admin.role === 'SUPER_ADMIN' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-primary/10 text-primary-light border-primary/20'}`}>
                                            {admin.role === 'SUPER_ADMIN' ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                            {admin.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {admin.id !== currentAdminId && (
                                            <button
                                                onClick={() => handleDelete(admin.id)}
                                                disabled={loading}
                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary-light" />
                    Add New Admin
                </h3>

                {error && (
                    <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form id="create-admin-form" action={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                        <input type="text" name="name" required className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                        <input type="email" name="email" required className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                        <input type="password" name="password" required className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                        <select name="role" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary">
                            <option value="MANAGER">Manager</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-4 bg-primary hover:bg-primary-light text-white font-bold py-2 rounded-lg transition-all disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}
