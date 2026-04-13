'use client';

import { useState } from 'react';
import { changeTechPassword } from '@/app/actions';
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle2, X } from 'lucide-react';

export function ChangePassword() {
    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 4) {
            setError('New password must be at least 4 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const result = await changeTechPassword(currentPassword, newPassword);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    setOpen(false);
                    reset();
                }, 1500);
            } else {
                setError(result.error || 'Failed to change password');
            }
        } catch {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => { setOpen(true); reset(); }}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
                <KeyRound className="w-3.5 h-3.5" />
                Change Password
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
                    onClick={() => { setOpen(false); reset(); }}
                >
                    <div
                        className="bg-background-paper border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Change Password</h3>
                            <button onClick={() => { setOpen(false); reset(); }} className="text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {success ? (
                            <div className="flex flex-col items-center py-6">
                                <CheckCircle2 className="w-12 h-12 text-success mb-3" />
                                <p className="text-white font-medium">Password changed!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                    required
                                    autoFocus
                                />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                    required
                                />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? 'Hide passwords' : 'Show passwords'}
                                </button>

                                {error && (
                                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-primary-light hover:to-primary text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
