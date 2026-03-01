'use client';

import { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                // Redirect to admin or the page they came from
                const params = new URLSearchParams(window.location.search);
                window.location.href = params.get('from') || '/admin';
            } else {
                const data = await res.json();
                setError(data.error || 'Invalid password');
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-white/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="w-full max-w-sm relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-white/5 p-4 rounded-full border border-white/10 mb-4 relative">
                        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                        <ShieldCheck className="w-12 h-12 text-primary-light relative z-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                    <p className="text-slate-400 text-center mt-2">Enter the admin password to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="Admin Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center text-lg"
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-primary-light hover:to-primary text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Admin Dashboard'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <a href="/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                        ← Back to Technician Login
                    </a>
                </div>
            </div>
        </main>
    );
}
