'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SyncBillingButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/billing/sync', {
                method: 'POST',
            });

            const data = await response.json();

            if (data.error) {
                toast.error(data.error);
            } else {
                toast.success(`Status synced: ${data.status}`);
                router.refresh();
            }
        } catch (error) {
            toast.error('Failed to sync billing status');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={isLoading}
            className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl px-4 transition-all active:scale-95"
        >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold uppercase tracking-widest">
                {isLoading ? 'Syncing...' : 'Sync Status'}
            </span>
        </Button>
    );
}
