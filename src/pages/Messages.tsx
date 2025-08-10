import React from 'react';
import { InboxLayout } from '@/components/inbox/InboxLayout';

const Messages = () => {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Messages</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Professional business messaging system - Gmail-style interface
          </p>
        </div>
      </div>

      <InboxLayout />
    </div>
  );
};

export default Messages;