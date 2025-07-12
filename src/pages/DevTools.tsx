import { SeedDatabase } from '@/components/dev/SeedDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code, AlertTriangle } from 'lucide-react';

const DevTools = () => {
  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Development tools are not available in production mode.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Code className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Development Tools</h1>
          <p className="text-muted-foreground">
            Tools for testing and development. Only available in development mode.
          </p>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          These tools are for development and testing purposes only. They create test data and allow role switching for easier testing of different user permissions.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SeedDatabase />
        
        <Card>
          <CardHeader>
            <CardTitle>Role Switcher</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The role switcher is available in the top navigation bar. It allows you to quickly switch between different test user accounts to test various role permissions.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Admin:</strong> Full system access, can manage everything</p>
              <p><strong>Property Owner:</strong> Can manage their own properties and tenants</p>
              <p><strong>Tenant:</strong> Can view their lease info and submit maintenance requests</p>
              <p><strong>House Watcher:</strong> Can monitor assigned properties and submit reports</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test User Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Admin Account</h4>
              <p>Email: admin@test.com</p>
              <p>Password: admin123</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Property Owner Account</h4>
              <p>Email: owner@test.com</p>
              <p>Password: owner123</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Tenant Account</h4>
              <p>Email: tenant@test.com</p>
              <p>Password: tenant123</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">House Watcher Account</h4>
              <p>Email: watcher@test.com</p>
              <p>Password: watcher123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevTools;