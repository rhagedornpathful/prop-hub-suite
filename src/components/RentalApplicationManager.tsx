import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRentalApplications } from '@/hooks/queries/useRentalApplications';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const getStatusColor = (status: string) => {
  const colors = {
    draft: 'bg-gray-500/10 text-gray-600',
    submitted: 'bg-blue-500/10 text-blue-600',
    under_review: 'bg-yellow-500/10 text-yellow-600',
    approved: 'bg-green-500/10 text-green-600',
    conditionally_approved: 'bg-orange-500/10 text-orange-600',
    rejected: 'bg-red-500/10 text-red-600',
    withdrawn: 'bg-gray-500/10 text-gray-600',
  };
  return colors[status as keyof typeof colors] || colors.submitted;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    case 'under_review':
      return <Clock className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const RentalApplicationManager = () => {
  const { data: applications, isLoading } = useRentalApplications();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredApplications = applications?.filter(app => {
    const matchesSearch = 
      app.applicant_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications?.length || 0,
    pending: applications?.filter(a => a.status === 'submitted' || a.status === 'under_review').length || 0,
    approved: applications?.filter(a => a.status === 'approved').length || 0,
    rejected: applications?.filter(a => a.status === 'rejected').length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Applications</CardTitle>
          <CardDescription>Review and manage rental applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="conditionally_approved">Conditionally Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="grid gap-4">
        {filteredApplications?.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(application.status)}
                    <h3 className="font-semibold text-lg">
                      {application.applicant_first_name} {application.applicant_last_name}
                    </h3>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{application.applicant_email}</span>
                    </div>
                    
                    {application.properties && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{application.properties.street_address}, {application.properties.city}</span>
                      </div>
                    )}
                    
                    {application.monthly_income && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>Income: ${application.monthly_income.toLocaleString()}/mo</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    {application.employer_name && (
                      <div>
                        <span className="text-muted-foreground">Employer:</span> {application.employer_name}
                      </div>
                    )}
                    
                    {application.desired_move_in_date && (
                      <div>
                        <span className="text-muted-foreground">Move-in:</span> {format(new Date(application.desired_move_in_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                    
                    <div>
                      <span className="text-muted-foreground">Applied:</span> {format(new Date(application.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  
                  {/* Background & Credit Check Status */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Background Check:</span>
                      <Badge variant="outline" className={
                        application.background_check_status === 'completed' ? 'text-green-600' :
                        application.background_check_status === 'failed' ? 'text-red-600' :
                        'text-yellow-600'
                      }>
                        {application.background_check_status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Credit Check:</span>
                      <Badge variant="outline" className={
                        application.credit_check_status === 'completed' ? 'text-green-600' :
                        application.credit_check_status === 'failed' ? 'text-red-600' :
                        'text-yellow-600'
                      }>
                        {application.credit_check_status}
                      </Badge>
                    </div>
                  </div>
                  
                  {application.application_fee_amount && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Application Fee:</span>
                      <span>${application.application_fee_amount}</span>
                      <Badge variant={application.application_fee_paid ? "default" : "secondary"}>
                        {application.application_fee_paid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-32">
                  <Button size="sm">
                    Review
                  </Button>
                  <Button variant="outline" size="sm">
                    Documents
                  </Button>
                  {application.status === 'submitted' && (
                    <>
                      <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No applications found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Applications will appear here when prospective tenants apply'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};