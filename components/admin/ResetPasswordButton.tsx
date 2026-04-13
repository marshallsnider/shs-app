'use client';

import { useState } from 'react';
import { adminResetTechPassword } from '@/app/actions';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';

export function ResetPasswordButton({ techId, techName, hasPassword }: { techId: string; techName: string; hasPassword: boolean }) {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    if (!hasPassword) {
        return (
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                No password set
            </span>
        );
    }

    if (done) {
        return (
            <span className="text-[10px] text-success flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Password reset
            </span>
        );
    }

    const handleReset = async () => {
        if (!confirm(`Reset password for ${techName}? They will need to create a new one on their next login.`)) return;
        setLoading(true);
        try {
            await adminResetTechPassword(techId);
            setDone(true);
        } catch {
            alert('Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleReset}
            disabled={loading}
            className="text-[10px] text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
            Reset Password
        </button>
    );
}
