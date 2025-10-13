/**
 * Intelligent caching strategy for messaging
 * Implements conversation-level caching with smart invalidation
 */

import { QueryClient } from '@tanstack/react-query';

export const MESSAGE_CACHE_TIMES = {
  // Active conversation - very fresh (1 minute)
  ACTIVE_CONVERSATION: 1 * 60 * 1000,
  
  // Conversation list - moderate (2 minutes)
  CONVERSATION_LIST: 2 * 60 * 1000,
  
  // Archived conversations - stable (10 minutes)
  ARCHIVED: 10 * 60 * 1000,
  
  // Message search results - short (30 seconds)
  SEARCH: 30 * 1000,
} as const;

export const MESSAGE_CACHE_KEYS = {
  CONVERSATIONS: 'inbox-conversations',
  MESSAGES: 'inbox-messages',
  MESSAGES_INFINITE: 'inbox-messages-infinite',
  DRAFTS: 'message-drafts',
  SEARCH: 'message-search',
  LABELS: 'conversation-labels',
  TEMPLATES: 'message-templates',
} as const;

/**
 * Prefetch conversation messages when hovering over conversation
 */
export const prefetchConversationMessages = async (
  queryClient: QueryClient,
  conversationId: string,
  userId: string
) => {
  await queryClient.prefetchQuery({
    queryKey: [MESSAGE_CACHE_KEYS.MESSAGES, conversationId, userId],
    staleTime: MESSAGE_CACHE_TIMES.ACTIVE_CONVERSATION,
  });
};

/**
 * Invalidate message-related caches
 */
export const invalidateMessageQueries = (
  queryClient: QueryClient,
  conversationId?: string
) => {
  if (conversationId) {
    // Invalidate specific conversation
    queryClient.invalidateQueries({ 
      queryKey: [MESSAGE_CACHE_KEYS.MESSAGES, conversationId] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [MESSAGE_CACHE_KEYS.MESSAGES_INFINITE, conversationId] 
    });
  }
  
  // Always invalidate conversation list
  queryClient.invalidateQueries({ 
    queryKey: [MESSAGE_CACHE_KEYS.CONVERSATIONS] 
  });
};

/**
 * Optimistically add message to cache
 */
export const addOptimisticMessage = <T extends { id: string; conversation_id: string }>(
  queryClient: QueryClient,
  message: T,
  userId: string
) => {
  const queryKey = [MESSAGE_CACHE_KEYS.MESSAGES, message.conversation_id, userId];
  
  queryClient.setQueryData<T[]>(queryKey, (old) => {
    if (!old) return [message];
    return [...old, message];
  });
};

/**
 * Remove optimistic message from cache
 */
export const removeOptimisticMessage = (
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  userId: string
) => {
  const queryKey = [MESSAGE_CACHE_KEYS.MESSAGES, conversationId, userId];
  
  queryClient.setQueryData<any[]>(queryKey, (old) => {
    if (!old) return [];
    return old.filter(msg => msg.id !== messageId);
  });
};
