'use client';

import { useState } from 'react';
import { loginTechnician } from '../actions';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [employeeId, setEmployeeId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await loginTechnician(employeeId);
            if (result.success) {
                window.location.href = '/';
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
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
                        <img src="/logo.png" alt="SHS Logo" className="w-16 h-16 object-contain relative z-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Technician Login</h1>
                    <p className="text-slate-400 text-center mt-2">Enter your Employee ID to access your dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Employee ID (e.g. MS-001)"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center uppercase tracking-widest text-lg"
                            required
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
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access Dashboard'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-600">Don't have an ID? Contact your Admin.</p>
                </div>
            </div>
        </main>
    );
}
