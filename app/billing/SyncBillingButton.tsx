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
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isLoading}
            className="flex items-center gap-2"
        >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' : 'Sync Status'}
        </Button>
    );
}
