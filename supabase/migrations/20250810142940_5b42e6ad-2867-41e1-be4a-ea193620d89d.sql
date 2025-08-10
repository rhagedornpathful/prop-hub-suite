-- First, let's check what triggers exist on the messages table
SELECT tgname, tgrelid::regclass, tgfoid::regproc 
FROM pg_trigger 
WHERE tgrelid = 'messages'::regclass;