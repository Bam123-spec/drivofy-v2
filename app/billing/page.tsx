import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import SubscribeButton from './SubscribeButton';

export default async function BillingPage({ searchParams }: { searchParams: { success?: string, canceled?: string } }) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() }
            }
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();

    const isActive = org?.billing_status === 'active' || org?.billing_status === 'trialing';
    const isCanceled = org?.billing_status === 'canceled';

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

            {searchParams.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Subscription successful! Your account is now active.
                </div>
            )}

            {searchParams.canceled && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Subscription checkout canceled.
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Subscription Status</CardTitle>
                    <CardDescription>Manage your Drivofy subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">Current Plan</p>
                            <p className="text-sm text-gray-500">Drivofy Pro</p>
                        </div>
                        <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {org?.billing_status ? org.billing_status.toUpperCase() : 'INACTIVE'}
                            </span>
                        </div>
                    </div>

                    {isActive ? (
                        <div>
                            <p className="text-sm text-gray-600">
                                Your subscription is active.
                                {org?.current_period_end && ` Next renewal: ${new Date(org.current_period_end).toLocaleDateString()}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                To manage or cancel your subscription, please contact support.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-600 mb-4">
                                Subscribe to unlock all features.
                            </p>
                            <SubscribeButton />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
