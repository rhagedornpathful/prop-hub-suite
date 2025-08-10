-- Allow conversation creators to manage participants in their conversations
CREATE POLICY "Creators can manage participants for their conversations"
ON public.conversation_participants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND c.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND c.created_by = auth.uid()
  )
);
