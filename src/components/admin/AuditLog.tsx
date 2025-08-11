import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@/components/ui/enhanced-icon';
import { 
  FileText, 
  LogIn, 
  LogOut, 
  Plus, 
  Edit, 
  Trash, 
  UserCheck, 
  XCircle, 
  Download, 
  Activity 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  severity: 'info' | 'warning' | 'error';
}

export const AuditLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', searchTerm, actionFilter, severityFilter],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      // Simulate audit log data - in production, this would come from your audit system
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          action: 'USER_LOGIN',
          entityType: 'user',
          entityId: 'user-123',
          userId: 'admin-456',
          userEmail: 'admin@example.com',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { method: 'email_password' },
          severity: 'info',
        },
        {
          id: '2',
          action: 'PROPERTY_CREATE',
          entityType: 'property',
          entityId: 'prop-789',
          userId: 'admin-456',
          userEmail: 'admin@example.com',
          timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { address: '123 Main St', type: 'residential' },
          severity: 'info',
        },
        {
          id: '3',
          action: 'ROLE_ASSIGNED',
          entityType: 'user',
          entityId: 'user-999',
          userId: 'admin-456',
          userEmail: 'admin@example.com',
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { role: 'property_manager', previousRole: 'tenant' },
          severity: 'warning',
        },
        {
          id: '4',
          action: 'LOGIN_FAILED',
          entityType: 'user',
          entityId: 'user-111',
          userId: 'user-111',
          userEmail: 'failed@example.com',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          ipAddress: '10.0.0.50',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          details: { reason: 'invalid_password', attempts: 3 },
          severity: 'error',
        },
        {
          id: '5',
          action: 'DATA_EXPORT',
          entityType: 'system',
          entityId: 'export-001',
          userId: 'admin-456',
          userEmail: 'admin@example.com',
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: { table: 'tenants', recordCount: 150 },
          severity: 'warning',
        },
      ];

      // Apply filters
      let filteredLogs = mockLogs;

      if (searchTerm) {
        filteredLogs = filteredLogs.filter(log =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.entityType.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (actionFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action === actionFilter);
      }

      if (severityFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.severity === severityFilter);
      }

      return filteredLogs;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'USER_LOGIN':
        return LogIn;
      case 'USER_LOGOUT':
        return LogOut;
      case 'PROPERTY_CREATE':
        return Plus;
      case 'PROPERTY_UPDATE':
        return Edit;
      case 'PROPERTY_DELETE':
        return Trash;
      case 'ROLE_ASSIGNED':
        return UserCheck;
      case 'LOGIN_FAILED':
        return XCircle;
      case 'DATA_EXPORT':
        return Download;
      default:
        return Activity;
    }
  };

  const getSeverityVariant = (severity: AuditLogEntry['severity']) => {
    switch (severity) {
      case 'info':
        return 'secondary';
      case 'warning':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon={FileText} size="sm" />
          Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="USER_LOGIN">User Login</SelectItem>
              <SelectItem value="PROPERTY_CREATE">Property Create</SelectItem>
              <SelectItem value="ROLE_ASSIGNED">Role Assigned</SelectItem>
              <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
              <SelectItem value="DATA_EXPORT">Data Export</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon 
                        icon={getActionIcon(log.action)} 
                        size="sm" 
                        className="text-muted-foreground"
                      />
                      {formatAction(log.action)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.userEmail}</p>
                      <p className="text-xs text-muted-foreground">{log.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.entityType}</p>
                      <p className="text-xs text-muted-foreground">{log.entityId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityVariant(log.severity)}>
                      {log.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-mono text-xs">{log.ipAddress}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {!auditLogs?.length && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon icon={FileText} size="xl" className="mx-auto mb-2" />
            <p>No audit logs found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};