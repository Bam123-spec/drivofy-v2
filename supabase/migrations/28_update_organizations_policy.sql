-- Allow owners to update their own organization
CREATE POLICY "Owners can update their own organization" 
ON organizations 
FOR UPDATE
USING (auth.uid() = owner_user_id);
