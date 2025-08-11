import React from 'react';
import { InboxLayout } from '@/components/inbox/InboxLayout';

const Messages = () => {
  return (
    <div className="flex-1 h-screen bg-background">
      <InboxLayout />
    </div>
  );
};

export default Messages;