"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function SubscribeButton() {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Failed to start checkout');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleSubscribe} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Subscribe Now
        </Button>
    );
}
