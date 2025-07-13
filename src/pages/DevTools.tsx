import { useState } from 'react';
import { SeedDatabase } from '@/components/dev/SeedDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Code, AlertTriangle, Database, Loader2, RefreshCw, UserCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const DevTools = () => {
  const [cleaning, setCleaning] = useState(false);
  const [smartSeeding, setSmartSeeding] = useState(false);

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

  const cleanupDuplicateRoles = async () => {
    console.log('🧹 DevTools: Starting cleanup of duplicate roles...');
    try {
      setCleaning(true);
      
      toast({
        title: "Cleaning Duplicates",
        description: "Removing duplicate role entries...",
      });
      
      // Define correct roles for test users
      const correctRoles = {
        'admin@test.com': 'admin',
        'pmclient1@test.com': 'owner_investor',
        'pmclient2@test.com': 'owner_investor',
        'pmclient3@test.com': 'owner_investor',
        'pmclient4@test.com': 'owner_investor',
        'pmclient5@test.com': 'owner_investor',
        'hwclient1@test.com': 'owner_investor',
        'hwclient2@test.com': 'owner_investor',
        'hwclient3@test.com': 'owner_investor',
        'hwclient4@test.com': 'owner_investor',
        'hwclient5@test.com': 'owner_investor',
        'tenant1@test.com': 'tenant',
        'tenant2@test.com': 'tenant',
        'watcher@test.com': 'house_watcher'
      };
      
      // Get all user_roles entries
      const { data: allRoles, error: fetchError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (fetchError) {
        console.error('❌ DevTools: Error fetching roles for cleanup:', fetchError);
        throw fetchError;
      }
      
      console.log('📊 DevTools: Found', allRoles?.length || 0, 'total role entries');
      
      // Get user emails to map IDs
      const { data: userProfiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email');
      
      if (profileError) {
        console.error('❌ DevTools: Error fetching user profiles:', profileError);
        throw profileError;
      }
      
      // Create email to user ID mapping
      const emailToId = userProfiles?.reduce((acc, profile) => {
        if (profile.email) {
          acc[profile.email] = profile.id;
        }
        return acc;
      }, {} as Record<string, string>) || {};
      
      let deletedCount = 0;
      let updatedCount = 0;
      
      // For each test user, clean up their roles
      for (const [email, correctRole] of Object.entries(correctRoles)) {
        const userId = emailToId[email];
        if (!userId) {
          console.log(`⚠️ DevTools: User ${email} not found, skipping cleanup`);
          continue;
        }
        
        // Get all roles for this user
        const userRoles = allRoles?.filter(role => role.user_id === userId) || [];
        console.log(`🔍 DevTools: User ${email} has ${userRoles.length} role entries:`, userRoles.map(r => r.role));
        
        if (userRoles.length > 1) {
          // Delete all roles for this user
          const { error: deleteError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId);
          
          if (deleteError) {
            console.error(`❌ DevTools: Error deleting roles for ${email}:`, deleteError);
            continue;
          }
          
          deletedCount += userRoles.length;
          
          // Insert the correct role
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              role: correctRole as any,
              assigned_by: userId,
              assigned_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error(`❌ DevTools: Error inserting correct role for ${email}:`, insertError);
            continue;
          }
          
          updatedCount++;
          console.log(`✅ DevTools: Fixed ${email} role to ${correctRole}`);
        } else if (userRoles.length === 1 && userRoles[0].role !== correctRole) {
          // Update the existing role if it's wrong
          const { error: updateError } = await supabase
            .from('user_roles')
            .update({ 
              role: correctRole as any,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
          
          if (updateError) {
            console.error(`❌ DevTools: Error updating role for ${email}:`, updateError);
            continue;
          }
          
          updatedCount++;
          console.log(`✅ DevTools: Updated ${email} role from ${userRoles[0].role} to ${correctRole}`);
        }
      }
      
      console.log(`✅ DevTools: Cleanup complete - deleted ${deletedCount} entries, updated/created ${updatedCount} correct roles`);
      
      toast({
        title: "Cleanup Complete!",
        description: `Removed duplicates and fixed ${updatedCount} user roles`,
      });
      
    } catch (error: any) {
      console.error('❌ DevTools: Error during cleanup:', error);
      toast({
        title: "Cleanup Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setCleaning(false);
    }
  };

  const smartSeedUsers = async () => {
    console.log('🌱 DevTools: Starting smart seed process...');
    try {
      setSmartSeeding(true);
      
      const testEmails = ['admin@test.com', 'pmclient1@test.com', 'tenant1@test.com', 'watcher@test.com'];
      
      // Step 1: Check if test users exist in auth.users
      toast({
        title: "Step 1/3",
        description: "Checking for test users... 🔍",
      });
      
      const { data: existingUsers, error: checkError } = await supabase
        .from('user_profiles')
        .select('id, email')
        .in('email', testEmails);
      
      if (checkError) {
        console.error('❌ DevTools: Error checking existing users:', checkError);
        throw checkError;
      }
      
      const existingEmails = (existingUsers || []).map(u => u.email);
      const missingEmails = testEmails.filter(email => !existingEmails.includes(email));
      
      if (missingEmails.length > 0) {
        const instructionMessage = `Test users need to be created manually in Supabase:

1. Go to Supabase Dashboard → Authentication → Users
2. Create these missing users:
${missingEmails.map(email => `   • ${email} (password: testpass123)`).join('\n')}
3. Then click 'Smart Seed' again

Found: ${existingEmails.join(', ') || 'none'}
Missing: ${missingEmails.join(', ')}`;

        toast({
          title: "Missing Auth Users",
          description: `${missingEmails.length} test users need to be created in Supabase Auth first`,
          variant: "destructive"
        });
        
        console.warn('❌ DevTools: Missing users:', instructionMessage);
        return;
      }
      
      // Step 2: Create/update roles and profiles
      toast({
        title: "Step 2/3", 
        description: "Creating user roles and profiles... 👤",
      });
      
      const roles = ['admin', 'owner_investor', 'tenant', 'house_watcher'];
      const userRolePromises = existingUsers!.map((user, index) => {
        const role = roles[testEmails.indexOf(user.email!)];
        return supabase
          .from('user_roles')
          .upsert({
            user_id: user.id,
            role: role as any,
            assigned_by: user.id
          });
      });
      
      await Promise.allSettled(userRolePromises);
      
      // Step 3: Run comprehensive seeding
      toast({
        title: "Step 3/3",
        description: "Creating test properties and data... 🏠",
      });
      
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('seed_test_users');
        if (rpcError) {
          console.warn('⚠️ DevTools: RPC seeding partially failed:', rpcError);
        }
      } catch (rpcError) {
        console.warn('⚠️ DevTools: RPC seeding failed, but basic setup is complete:', rpcError);
      }
      
      toast({
        title: "Smart Seeding Complete!",
        description: `Successfully set up ${existingUsers!.length} test users with comprehensive test data`,
      });
      
    } catch (error: any) {
      console.error('❌ DevTools: Error in smart seeding:', error);
      toast({
        title: "Smart Seeding Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setSmartSeeding(false);
    }
  };

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
            <CardTitle>Smart Development Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Additional tools for development and testing workflows.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={smartSeedUsers}
                disabled={smartSeeding}
                variant="outline"
                className="w-full justify-start"
              >
                {smartSeeding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Smart Seeding...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Smart Seed Users
                  </>
                )}
              </Button>
              
              <Button 
                onClick={cleanupDuplicateRoles}
                disabled={cleaning}
                variant="outline"
                className="w-full justify-start"
              >
                {cleaning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clean Duplicate Roles
                  </>
                )}
              </Button>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Smart Seed: Checks for existing auth users first, then creates roles and data.
                Role Cleanup: Removes duplicate role entries and fixes incorrect roles.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        
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