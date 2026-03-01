'use client';

import { useState } from 'react';
import { X, Save, UserCheck, UserX } from 'lucide-react';

interface EditTechModalProps {
    tech: {
        id: string;
        name: string;
        employeeId: string | null;
        isActive: boolean;
    };
}

export function EditTechButton({ tech }: EditTechModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(tech.name);
    const [employeeId, setEmployeeId] = useState(tech.employeeId || '');
    const [isActive, setIsActive] = useState(tech.isActive);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/technicians/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: tech.id,
                    name: name.trim(),
                    employeeId: employeeId.trim(),
                    isActive,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Saved!');
                setTimeout(() => {
                    setIsOpen(false);
                    setMessage('');
                    window.location.reload();
                }, 800);
            } else {
                setMessage(data.error || 'Failed to save');
            }
        } catch {
            setMessage('Network error');
        }

        setSaving(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-slate-400 hover:text-white text-sm transition-colors"
            >
                Edit
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
                >
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Edit Technician</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Employee ID (Login)</label>
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Active Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsActive(true)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${isActive
                                                ? 'bg-success/20 text-success border border-success/30'
                                                : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                                            }`}
                                    >
                                        <UserCheck className="w-4 h-4" />
                                        Active
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsActive(false)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${!isActive
                                                ? 'bg-danger/20 text-danger border border-danger/30'
                                                : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                                            }`}
                                    >
                                        <UserX className="w-4 h-4" />
                                        Inactive
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 flex items-center justify-between">
                            {message && (
                                <span className={`text-sm ${message === 'Saved!' ? 'text-success' : 'text-danger'}`}>
                                    {message}
                                </span>
                            )}
                            <div className="flex gap-2 ml-auto">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !name.trim()}
                                    className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-light text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
