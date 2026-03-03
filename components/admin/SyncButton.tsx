'use client';

import { useState } from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';

export function SyncButton() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSync = async () => {
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/sync', { method: 'GET' });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(`Synced! ${data.syncedJobs || 0} jobs, ${data.syncedInvoices || 0} invoices processed.`);
            } else {
                setStatus('error');
                setMessage(data.error || 'Sync failed');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error');
        }

        setTimeout(() => {
            setStatus('idle');
            setMessage('');
        }, 5000);
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleSync}
                disabled={status === 'loading'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${status === 'loading'
                    ? 'bg-slate-700 text-slate-400 cursor-wait'
                    : status === 'success'
                        ? 'bg-success/20 text-success'
                        : status === 'error'
                            ? 'bg-danger/20 text-danger'
                            : 'bg-primary/20 text-primary-light hover:bg-primary/30'
                    }`}
            >
                {status === 'loading' && <RefreshCw className="w-4 h-4 animate-spin" />}
                {status === 'success' && <Check className="w-4 h-4" />}
                {status === 'error' && <AlertCircle className="w-4 h-4" />}
                {status === 'idle' && <RefreshCw className="w-4 h-4" />}

                {status === 'loading' ? 'Syncing...' : status === 'success' ? 'Done!' : status === 'error' ? 'Failed' : 'Sync Field Pulse'}
            </button>

            {message && (
                <span className={`text-xs ${status === 'error' ? 'text-danger' : 'text-success'}`}>
                    {message}
                </span>
            )}
        </div>
    );
}
