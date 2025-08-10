import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Plus, 
  Calendar as CalendarIcon,
  Download,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle,
  DollarSign,
  User,
  Home,
  Send
} from 'lucide-react';
import { format } from 'date-fns';

const LeaseManagement = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [leaseFilter, setLeaseFilter] = useState('all');

  // Mock lease data
  const leases = [
    {
      id: '1',
      tenantName: 'John Smith',
      tenantEmail: 'john.smith@email.com',
      propertyAddress: '123 Maple Street, Unit 2A',
      rentAmount: 1850,
      securityDeposit: 3700,
      leaseStart: '2024-01-01',
      leaseEnd: '2024-12-31',
      status: 'active',
      autoRenew: true,
      renewalNotice: 60,
      nextRentDue: '2024-12-01',
      daysUntilExpiry: 45,
    },
    {
      id: '2',
      tenantName: 'Sarah Johnson',
      tenantEmail: 'sarah.j@email.com',
      propertyAddress: '456 Oak Avenue, Unit 1B',
      rentAmount: 2100,
      securityDeposit: 4200,
      leaseStart: '2024-03-15',
      leaseEnd: '2025-03-14',
      status: 'active',
      autoRenew: false,
      renewalNotice: 30,
      nextRentDue: '2024-12-15',
      daysUntilExpiry: 105,
    },
    {
      id: '3',
      tenantName: 'Michael Brown',
      tenantEmail: 'mike.brown@email.com',
      propertyAddress: '789 Pine Street, Unit 3C',
      rentAmount: 1650,
      securityDeposit: 3300,
      leaseStart: '2023-06-01',
      leaseEnd: '2024-11-30',
      status: 'expiring_soon',
      autoRenew: true,
      renewalNotice: 60,
      nextRentDue: '2024-11-01',
      daysUntilExpiry: 15,
    },
    {
      id: '4',
      tenantName: 'Emily Davis',
      tenantEmail: 'emily.davis@email.com',
      propertyAddress: '321 Birch Lane, Unit 4A',
      rentAmount: 1950,
      securityDeposit: 3900,
      leaseStart: '2024-02-01',
      leaseEnd: '2025-01-31',
      status: 'pending_signature',
      autoRenew: false,
      renewalNotice: 45,
      nextRentDue: '2024-12-01',
      daysUntilExpiry: 75,
    },
  ];

  const leaseTemplates = [
    { id: '1', name: 'Standard Residential Lease', type: 'residential', duration: '12 months' },
    { id: '2', name: 'Month-to-Month Agreement', type: 'residential', duration: 'monthly' },
    { id: '3', name: 'Commercial Lease', type: 'commercial', duration: '36 months' },
    { id: '4', name: 'Student Housing Lease', type: 'student', duration: '9 months' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expiring_soon':
        return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
      case 'pending_signature':
        return <Badge className="bg-blue-100 text-blue-800">Pending Signature</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUrgencyColor = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 30) return 'text-red-600';
    if (daysUntilExpiry <= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredLeases = leases.filter(lease => {
    if (leaseFilter === 'all') return true;
    if (leaseFilter === 'expiring') return lease.daysUntilExpiry <= 60;
    if (leaseFilter === 'renewable') return lease.autoRenew;
    return lease.status === leaseFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lease Management</h1>
          <p className="text-muted-foreground">Manage lease agreements, renewals, and terminations</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={leaseFilter} onValueChange={setLeaseFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter leases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leases</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="pending_signature">Pending Signature</SelectItem>
              <SelectItem value="renewable">Auto-Renewable</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Lease
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Lease Agreement</DialogTitle>
                <DialogDescription>
                  Generate a new lease agreement with customizable terms and conditions
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Lease Details</TabsTrigger>
                  <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
                  <TabsTrigger value="review">Review & Generate</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Lease Template</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaseTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} ({template.duration})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Property</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prop1">123 Maple Street, Unit 2A</SelectItem>
                          <SelectItem value="prop2">456 Oak Avenue, Unit 1B</SelectItem>
                          <SelectItem value="prop3">789 Pine Street, Unit 3C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tenant Name</Label>
                      <Input placeholder="Full name" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tenant Email</Label>
                      <Input type="email" placeholder="tenant@email.com" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Monthly Rent</Label>
                      <Input type="number" placeholder="1850.00" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Security Deposit</Label>
                      <Input type="number" placeholder="3700.00" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Pet Deposit (Optional)</Label>
                      <Input type="number" placeholder="500.00" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Lease Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Lease Duration</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 Months</SelectItem>
                          <SelectItem value="12">12 Months</SelectItem>
                          <SelectItem value="18">18 Months</SelectItem>
                          <SelectItem value="24">24 Months</SelectItem>
                          <SelectItem value="month-to-month">Month-to-Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="terms" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Renewal Notice Period (Days)</Label>
                      <Input type="number" defaultValue="60" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Late Fee Amount</Label>
                      <Input type="number" placeholder="75.00" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Pet Policy</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pet policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-pets">No Pets Allowed</SelectItem>
                        <SelectItem value="cats-only">Cats Only</SelectItem>
                        <SelectItem value="small-pets">Small Pets Only</SelectItem>
                        <SelectItem value="all-pets">All Pets Allowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Utilities Included</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Water', 'Electric', 'Gas', 'Internet', 'Cable', 'Trash'].map(utility => (
                        <label key={utility} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm">{utility}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Special Terms</Label>
                    <Textarea 
                      placeholder="Any additional terms or conditions..."
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="review" className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Lease Agreement Summary</h3>
                    <div className="grid gap-3 text-sm">
                      <div className="flex justify-between">
                        <span>Template:</span>
                        <span>Standard Residential Lease</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Property:</span>
                        <span>123 Maple Street, Unit 2A</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tenant:</span>
                        <span>John Smith</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Rent:</span>
                        <span>$1,850.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>12 Months</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Lease Document
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      Send for E-Signature
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leases.filter(l => l.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {leases.filter(l => l.autoRenew).length} with auto-renewal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {leases.filter(l => l.daysUntilExpiry <= 60).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Within 60 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signature</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leases.filter(l => l.status === 'pending_signature').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting e-signature
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rent Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${leases.reduce((sum, lease) => sum + lease.rentAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly rental income
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lease Agreements</CardTitle>
          <CardDescription>
            Manage all lease agreements and track important dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeases.map((lease) => (
              <div key={lease.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">{lease.tenantName}</h3>
                      <p className="text-sm text-muted-foreground">{lease.tenantEmail}</p>
                    </div>
                    {getStatusBadge(lease.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Property</div>
                    <div className="font-medium">{lease.propertyAddress}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Monthly Rent</div>
                    <div className="font-medium">${lease.rentAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Lease Period</div>
                    <div className="font-medium">
                      {format(new Date(lease.leaseStart), 'MMM dd, yyyy')} - {format(new Date(lease.leaseEnd), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Days Until Expiry</div>
                    <div className={`font-medium ${getUrgencyColor(lease.daysUntilExpiry)}`}>
                      {lease.daysUntilExpiry} days
                    </div>
                  </div>
                </div>

                {lease.daysUntilExpiry <= 60 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Renewal Action Required</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline">
                        Send Renewal Notice
                      </Button>
                      <Button size="sm" variant="outline">
                        Schedule Renewal Meeting
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaseManagement;