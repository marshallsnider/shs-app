'use client';

import { useState } from 'react';
import { loginTechnician, setupTechPassword } from '../actions';
import { Loader2, Eye, EyeOff, Lock, KeyRound } from 'lucide-react';

type Step = 'login' | 'setup';

export default function LoginPage() {
    const [step, setStep] = useState<Step>('login');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [setupTechId, setSetupTechId] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await loginTechnician(name, password);
            if (result.success) {
                window.location.href = '/';
            } else if (result.needsSetup && result.techId) {
                setSetupTechId(result.techId);
                setStep('setup');
                setPassword('');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const result = await setupTechPassword(setupTechId, password);
            if (result.success) {
                window.location.href = '/';
            } else {
                setError(result.error || 'Setup failed');
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

                    {step === 'login' ? (
                        <>
                            <h1 className="text-2xl font-bold text-white">Technician Login</h1>
                            <p className="text-slate-400 text-center mt-2">Enter your name and password.</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-white">Create Your Password</h1>
                            <p className="text-slate-400 text-center mt-2">
                                Welcome, {name}! Set up a password for your account.
                            </p>
                        </>
                    )}
                </div>

                {step === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="First and Last Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center text-lg"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center text-lg"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSetup} className="space-y-4">
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center text-lg"
                                required
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center text-lg"
                                required
                            />
                        </div>

                        {password && password.length < 4 && (
                            <p className="text-xs text-slate-500 text-center">Must be at least 4 characters</p>
                        )}

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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <KeyRound className="w-4 h-4" />
                                    Set Password & Sign In
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep('login'); setError(''); setPassword(''); setConfirmPassword(''); }}
                            className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            ← Back to login
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-600">Forgot your password? Contact your Admin.</p>
                </div>
            </div>
        </main>
    );
}
