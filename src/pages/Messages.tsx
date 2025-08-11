import React from 'react';
import { InboxLayout } from '@/components/inbox/InboxLayout';

const Messages = () => {
  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 md:p-6 bg-gradient-subtle min-h-screen">
      {/* Header Section */}
      <div className="text-center space-y-3 py-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-2xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Messages
          </h1>
        </div>
        <p className="text-muted-foreground text-sm md:text-lg font-medium">
          Professional business messaging center with advanced organization
        </p>
      </div>

      <InboxLayout />
    </div>
  );
};

export default Messages;