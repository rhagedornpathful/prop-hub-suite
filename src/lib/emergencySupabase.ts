import { supabase } from '@/integrations/supabase/client';

// Create an emergency supabase client wrapper
export const createEmergencySupabaseWrapper = () => {
  const isEmergencyMode = () => {
    return sessionStorage.getItem('emergencyAdmin') === 'true' || 
           (window as any).__EMERGENCY_ADMIN_MODE__;
  };

  // Create a wrapper for supabase queries that provides mock data in emergency mode
  const emergencySupabase = {
    from: (table: string) => ({
      select: (columns = '*') => {
        console.log(`🚨 Emergency Supabase: Querying ${table} with columns: ${columns}`);
        
        // Return mock data for common tables
        const mockData: any = {
          user_profiles: [
            {
              id: '1c376b70-c535-4ee4-8275-5d017704b3db',
              email: 'rmh1122@hotmail.com',
              first_name: 'Emergency',
              last_name: 'Admin',
              role: 'admin',
              user_created_at: new Date().toISOString(),
              role_created_at: new Date().toISOString()
            }
          ],
          user_roles: [
            {
              id: 'emergency-role-1',
              user_id: '1c376b70-c535-4ee4-8275-5d017704b3db',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          properties: [
            {
              id: 'emergency-property-1',
              user_id: '1c376b70-c535-4ee4-8275-5d017704b3db',
              address: '123 Emergency Admin Street',
              city: 'Emergency City',
              state: 'CA',
              zip_code: '90210',
              status: 'active',
              monthly_rent: 2500,
              created_at: new Date().toISOString()
            }
          ],
          tenants: [
            {
              id: 'emergency-tenant-1',
              user_id: '1c376b70-c535-4ee4-8275-5d017704b3db',
              first_name: 'Emergency',
              last_name: 'Tenant',
              email: 'tenant@emergency.com',
              property_id: 'emergency-property-1',
              created_at: new Date().toISOString()
            }
          ]
        };

        return {
          order: () => ({
            then: (callback: any) => {
              const data = mockData[table] || [];
              return Promise.resolve({ data, error: null }).then(callback);
            }
          }),
          eq: () => ({
            then: (callback: any) => {
              const data = mockData[table] || [];
              return Promise.resolve({ data, error: null }).then(callback);
            }
          }),
          single: () => ({
            then: (callback: any) => {
              const data = mockData[table]?.[0] || null;
              return Promise.resolve({ data, error: null }).then(callback);
            }
          }),
          then: (callback: any) => {
            const data = mockData[table] || [];
            return Promise.resolve({ data, error: null }).then(callback);
          }
        };
      }
    }),
    
    rpc: (functionName: string, params?: any) => {
      console.log(`🚨 Emergency Supabase: Calling RPC ${functionName} with params:`, params);
      
      // Handle specific RPC calls
      if (functionName === 'has_role') {
        return Promise.resolve({ data: true, error: null });
      }
      
      if (functionName === 'seed_test_users') {
        return Promise.resolve({ 
          data: 'Emergency mode: Test users seeded successfully (mock)', 
          error: null 
        });
      }
      
      return Promise.resolve({ data: true, error: null });
    },
    
    auth: {
      getSession: () => {
        const mockUser = {
          id: '1c376b70-c535-4ee4-8275-5d017704b3db',
          email: 'rmh1122@hotmail.com',
          app_metadata: { provider: 'emergency' },
          user_metadata: { emergency_access: true },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_anonymous: false
        };

        const mockSession = {
          access_token: 'emergency_token',
          refresh_token: 'emergency_refresh',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: mockUser
        };

        return Promise.resolve({ data: { session: mockSession }, error: null });
      },
      
      signOut: () => {
        sessionStorage.removeItem('emergencyAdmin');
        sessionStorage.removeItem('emergencyAdminUser');
        delete (window as any).__EMERGENCY_ADMIN_MODE__;
        return Promise.resolve({ error: null });
      }
    }
  };

  // Return either the emergency wrapper or the real supabase client
  return isEmergencyMode() ? emergencySupabase : supabase;
};

// Export the emergency-aware supabase client
export const emergencySupabase = createEmergencySupabaseWrapper();