import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { usePayments } from '@/hooks/usePayments';
import { useSMSNotifications } from '@/hooks/useSMSNotifications';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { 
  Mail, 
  MessageSquare, 
  CreditCard, 
  Bell, 
  DollarSign, 
  Users, 
  AlertCircle, 
  Send,
  Smartphone,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

const IntegratedNotificationCenter = () => {
  const { 
    createOneTimePayment, 
    createSubscription, 
    createRentPayment, 
    createApplicationFee 
  } = usePayments();
  
  const { 
    sendSMS, 
    sendUrgentMaintenanceSMS, 
    sendPaymentOverdueSMS 
  } = useSMSNotifications();
  
  const { 
    notifications, 
    unreadCount, 
    onlineUsers, 
    markAsRead, 
    markAllAsRead, 
    broadcastNotification,
    trackPresence 
  } = useRealTimeNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    type: 'rent',
    propertyId: '',
    tenantId: '',
    description: '',
    paymentMode: 'one-time'
  });
  const [smsForm, setSmsForm] = useState({
    template: 'urgent_maintenance',
    phoneNumbers: '',
    message: '',
    propertyAddress: '',
    tenantName: '',
    amount: ''
  });

  // Track user presence on mount
  useEffect(() => {
    trackPresence('online');
    
    // Update presence when page visibility changes
    const handleVisibilityChange = () => {
      trackPresence(document.hidden ? 'away' : 'online');
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [trackPresence]);

  const handlePaymentSubmit = async () => {
    if (!paymentForm.amount) return;
    
    setIsLoading(true);
    try {
      const amount = parseFloat(paymentForm.amount);
      
      if (paymentForm.paymentMode === 'subscription') {
        await createSubscription({
          amount,
          interval: 'month',
          planName: `${paymentForm.type} Subscription`,
          propertyId: paymentForm.propertyId,
          tenantId: paymentForm.tenantId,
        });
      } else {
        await createOneTimePayment({
          amount,
          paymentType: paymentForm.type as any,
          description: paymentForm.description,
          propertyId: paymentForm.propertyId,
          tenantId: paymentForm.tenantId,
        });
      }
      
      // Reset form
      setPaymentForm({
        amount: '',
        type: 'rent',
        propertyId: '',
        tenantId: '',
        description: '',
        paymentMode: 'one-time'
      });
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSMSSubmit = async () => {
    if (!smsForm.phoneNumbers) return;
    
    setIsLoading(true);
    try {
      const phoneNumbers = smsForm.phoneNumbers.split(',').map(num => num.trim());
      
      await sendSMS(smsForm.template as any, phoneNumbers, {
        tenant_name: smsForm.tenantName,
        property_address: smsForm.propertyAddress,
        maintenance_description: smsForm.message,
        amount: smsForm.amount ? parseFloat(smsForm.amount) : undefined,
        custom_message: smsForm.message,
      });
      
      // Reset form
      setSmsForm({
        template: 'urgent_maintenance',
        phoneNumbers: '',
        message: '',
        propertyAddress: '',
        tenantName: '',
        amount: ''
      });
    } catch (error) {
      console.error('SMS failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcastNotification = async () => {
    await broadcastNotification({
      type: 'system',
      title: 'System Announcement',
      message: 'Property management system updated with new features!',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Phase 6: API Integration Center</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {onlineUsers.length} Online
              </Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} New</Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Complete API integration: Email notifications, SMS alerts, Stripe payments, and real-time updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="realtime" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Real-time
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Stripe Payments (One-time & Subscriptions)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Payment Mode</Label>
                      <Select 
                        value={paymentForm.paymentMode} 
                        onValueChange={(value) => setPaymentForm(prev => ({...prev, paymentMode: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">One-time Payment</SelectItem>
                          <SelectItem value="subscription">Monthly Subscription</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Payment Type</Label>
                      <Select 
                        value={paymentForm.type} 
                        onValueChange={(value) => setPaymentForm(prev => ({...prev, type: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rent">Rent</SelectItem>
                          <SelectItem value="deposit">Security Deposit</SelectItem>
                          <SelectItem value="application_fee">Application Fee</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Amount ($)</Label>
                      <Input
                        type="number"
                        placeholder="1500.00"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm(prev => ({...prev, amount: e.target.value}))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Property ID</Label>
                      <Input
                        placeholder="prop-123"
                        value={paymentForm.propertyId}
                        onChange={(e) => setPaymentForm(prev => ({...prev, propertyId: e.target.value}))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tenant ID</Label>
                      <Input
                        placeholder="tenant-456"
                        value={paymentForm.tenantId}
                        onChange={(e) => setPaymentForm(prev => ({...prev, tenantId: e.target.value}))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Monthly rent payment for December 2024"
                      value={paymentForm.description}
                      onChange={(e) => setPaymentForm(prev => ({...prev, description: e.target.value}))}
                    />
                  </div>

                  <Button 
                    onClick={handlePaymentSubmit} 
                    disabled={!paymentForm.amount || isLoading}
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isLoading ? 'Processing...' : `Create ${paymentForm.paymentMode === 'subscription' ? 'Subscription' : 'Payment'}`}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SMS Tab */}
            <TabsContent value="sms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Twilio SMS Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>SMS Template</Label>
                    <Select 
                      value={smsForm.template} 
                      onValueChange={(value) => setSmsForm(prev => ({...prev, template: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent_maintenance">Urgent Maintenance</SelectItem>
                        <SelectItem value="payment_overdue">Payment Overdue</SelectItem>
                        <SelectItem value="emergency_alert">Emergency Alert</SelectItem>
                        <SelectItem value="lease_expiration">Lease Expiration</SelectItem>
                        <SelectItem value="inspection_reminder">Inspection Reminder</SelectItem>
                        <SelectItem value="custom">Custom Message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Numbers</Label>
                    <Input
                      placeholder="+1234567890, +0987654321"
                      value={smsForm.phoneNumbers}
                      onChange={(e) => setSmsForm(prev => ({...prev, phoneNumbers: e.target.value}))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Separate multiple numbers with commas
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Property Address</Label>
                      <Input
                        placeholder="123 Main St, City, State"
                        value={smsForm.propertyAddress}
                        onChange={(e) => setSmsForm(prev => ({...prev, propertyAddress: e.target.value}))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tenant Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={smsForm.tenantName}
                        onChange={(e) => setSmsForm(prev => ({...prev, tenantName: e.target.value}))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Custom message or additional details..."
                      value={smsForm.message}
                      onChange={(e) => setSmsForm(prev => ({...prev, message: e.target.value}))}
                    />
                  </div>

                  <Button 
                    onClick={handleSMSSubmit} 
                    disabled={!smsForm.phoneNumbers || isLoading}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? 'Sending...' : 'Send SMS'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Real-time Tab */}
            <TabsContent value="realtime" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Live Notifications
                      {unreadCount > 0 && (
                        <Badge variant="destructive">{unreadCount}</Badge>
                      )}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={markAllAsRead}>
                        Mark All Read
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleBroadcastNotification}>
                        Test Broadcast
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No notifications</p>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border ${
                            notification.read ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {notification.type === 'maintenance_request' && <AlertCircle className="h-4 w-4" />}
                                {notification.type === 'payment_update' && <DollarSign className="h-4 w-4" />}
                                {notification.type === 'message' && <MessageSquare className="h-4 w-4" />}
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {notification.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="ml-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Online Users ({onlineUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {onlineUsers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No users online</p>
                    ) : (
                      onlineUsers.map((user) => (
                        <div key={user.user_id} className="flex items-center justify-between p-2 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              user.status === 'online' ? 'bg-green-500' :
                              user.status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                            <span className="text-sm font-medium">{user.user_id}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {user.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Notifications (Already Implemented)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Email System Active</h3>
                    <p className="text-muted-foreground mb-4">
                      Email notifications are already configured and working with 6 professional templates:
                    </p>
                    <div className="grid gap-2 text-sm">
                      <Badge variant="outline">Maintenance Requests</Badge>
                      <Badge variant="outline">Welcome Tenant</Badge>
                      <Badge variant="outline">Payment Reminders</Badge>
                      <Badge variant="outline">Maintenance Updates</Badge>
                      <Badge variant="outline">Lease Renewals</Badge>
                      <Badge variant="outline">Property Inspections</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegratedNotificationCenter;