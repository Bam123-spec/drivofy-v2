-- Create organizations table for billing
CREATE TABLE IF NOT EXISTS organizations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    billing_status text DEFAULT 'inactive',
    current_period_end timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Owners can view their own organization
CREATE POLICY "Owners can view their own organization" 
ON organizations 
FOR SELECT 
USING (auth.uid() = owner_user_id);

-- 2. Service role has full access (for webhooks)
-- (Service role bypasses RLS by default, but explicit policies can be good for clarity if needed, 
-- though usually not required for service_role if using supabase-js service key)

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
