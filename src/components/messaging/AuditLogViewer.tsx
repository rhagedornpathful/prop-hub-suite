import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { format } from 'date-fns';
import { FileText, User, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AuditLogViewerProps {
  tableName?: string;
  recordId?: string;
}

export const AuditLogViewer = ({ tableName, recordId }: AuditLogViewerProps) => {
  const { data: logs, isLoading } = useAuditLogs({
    tableName: tableName || 'messages',
    recordId,
    limit: 50
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {logs && logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium">{log.table_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.user_email || 'System'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.created_at), 'PPp')}
                      </div>
                    </div>

                    {log.changed_fields && log.changed_fields.length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Changed fields: </span>
                        {log.changed_fields.join(', ')}
                      </div>
                    )}

                    {log.ip_address && (
                      <div className="text-xs text-muted-foreground">
                        IP: {log.ip_address}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
