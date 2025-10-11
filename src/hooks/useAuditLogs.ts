import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: any;
  new_data: any;
  changed_fields: string[];
  user_id: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface UseAuditLogsOptions {
  tableName?: string;
  recordId?: string;
  userId?: string;
  action?: 'INSERT' | 'UPDATE' | 'DELETE';
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  return useQuery({
    queryKey: ['audit-logs', options],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(options.limit || 100);

      if (options.tableName) {
        query = query.eq('table_name', options.tableName);
      }

      if (options.recordId) {
        query = query.eq('record_id', options.recordId);
      }

      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options.action) {
        query = query.eq('action', options.action);
      }

      if (options.fromDate) {
        query = query.gte('created_at', options.fromDate.toISOString());
      }

      if (options.toDate) {
        query = query.lte('created_at', options.toDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as AuditLog[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useRecordAuditHistory(tableName: string, recordId: string) {
  return useAuditLogs({ tableName, recordId });
}