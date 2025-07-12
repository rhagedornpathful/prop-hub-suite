import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { ViewAsProvider } from "@/contexts/ViewAsContext";
import { DevAdminProvider } from "@/contexts/DevAdminContext";
import { ViewAsBanner } from "@/components/ViewAsBanner";
import { AdminDashboard } from "@/pages/dashboards/AdminDashboard";
import { DashboardHeader } from "@/components/DashboardHeader";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building, 
  Users, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  Shield
} from "lucide-react";

// Emergency admin context provider that bypasses all auth
const EmergencyAdminContext = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('🚨 EMERGENCY ADMIN ACCESS ACTIVATED');
    console.log('⚠️ WARNING: This bypasses all authentication and security checks');
    
    // Set emergency admin flag in sessionStorage
    sessionStorage.setItem('emergencyAdmin', 'true');
    sessionStorage.setItem('emergencyAdminUser', JSON.stringify({
      id: '1c376b70-c535-4ee4-8275-5d017704b3db',
      email: 'rmh1122@hotmail.com',
      role: 'admin'
    }));
    
    // Set global emergency flag
    (window as any).__EMERGENCY_ADMIN_MODE__ = true;
    
    // Show warning toast
    toast({
      title: "🚨 Emergency Admin Access",
      description: "WARNING: Authentication bypassed - This is a temporary emergency measure",
      variant: "destructive",
    });

    // Set ready state
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">🚨 Activating Emergency Admin Access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Simple admin dashboard without external dependencies
const EmergencyAdminDashboard = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Properties Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+2</span> from last month
          </p>
        </CardContent>
      </Card>

      {/* Tenants Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+1</span> from last month
          </p>
        </CardContent>
      </Card>

      {/* Revenue Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$24,500</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+5.2%</span> from last month
          </p>
        </CardContent>
      </Card>

      {/* Maintenance Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-red-600">+1</span> from yesterday
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default function AdminEmergency() {
  const { isMobile } = useMobileDetection();

  useEffect(() => {
    console.log('🚨 EMERGENCY ADMIN PAGE LOADED');
    console.log('⚠️ This page bypasses ALL authentication and security checks');
    console.log('🔧 Use this only for emergency administrative access');
  }, []);

  return (
    <EmergencyAdminContext>
      <DevAdminProvider>
        <ViewAsProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            {/* Emergency Warning Banner */}
            <div className="bg-red-500 text-white p-2 text-center text-sm font-medium">
              🚨 EMERGENCY ADMIN ACCESS - Authentication Bypassed - Use Caution
            </div>
            
            <ViewAsBanner />
            
            <SidebarProvider 
              defaultOpen={!isMobile}
              style={{
                "--sidebar-width": isMobile ? "100vw" : "18rem",
                "--sidebar-width-icon": "3rem",
              } as React.CSSProperties}
            >
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <main className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
                  <DashboardHeader />
                  <div className="container mx-auto p-6">
                    {/* Emergency Access Notice */}
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/50 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-amber-600" />
                        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                          🚨 Emergency Administrative Access
                        </h2>
                      </div>
                      <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
                        You are currently using emergency admin access that bypasses all authentication.
                        This should only be used for critical administrative tasks when normal login is unavailable.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            // Clear emergency mode and redirect
                            sessionStorage.removeItem('emergencyAdmin');
                            sessionStorage.removeItem('emergencyAdminUser');
                            delete (window as any).__EMERGENCY_ADMIN_MODE__;
                            window.location.href = '/auth';
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                          size="sm"
                        >
                          Return to Normal Login
                        </Button>
                        <Button
                          onClick={() => {
                            // Navigate but keep emergency mode
                            window.location.href = '/';
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Go to Regular Dashboard
                        </Button>
                      </div>
                    </div>

                    {/* Emergency Status */}
                    <div className="mb-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-red-500" />
                            Emergency Admin Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <Badge variant="destructive" className="mb-2">BYPASSED</Badge>
                              <p className="text-sm">Authentication</p>
                            </div>
                            <div className="text-center">
                              <Badge variant="secondary" className="mb-2">ACTIVE</Badge>
                              <p className="text-sm">Admin Role</p>
                            </div>
                            <div className="text-center">
                              <Badge variant="outline" className="mb-2">EMERGENCY</Badge>
                              <p className="text-sm">Access Mode</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Emergency Admin Dashboard */}
                    <EmergencyAdminDashboard />

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Emergency Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Button
                            onClick={() => window.location.href = '/user-management'}
                            className="w-full"
                            variant="outline"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            User Management
                          </Button>
                          <Button
                            onClick={() => window.location.href = '/properties'}
                            className="w-full"
                            variant="outline"
                          >
                            <Building className="mr-2 h-4 w-4" />
                            Properties
                          </Button>
                          <Button
                            onClick={() => window.location.href = '/finances'}
                            className="w-full"
                            variant="outline"
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Finances
                          </Button>
                          <Button
                            onClick={() => window.location.href = '/dev-tools'}
                            className="w-full"
                            variant="outline"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Dev Tools
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </main>
              </div>
            </SidebarProvider>
          </div>
        </ViewAsProvider>
      </DevAdminProvider>
    </EmergencyAdminContext>
  );
}