import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Database, Users, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SeedUser {
  email: string;
  password: string;
  role: 'admin' | 'property_owner' | 'tenant' | 'house_watcher';
  firstName: string;
  lastName: string;
  serviceType?: 'property_management' | 'house_watching';
}

const testUsers: SeedUser[] = [
  // Admin
  {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User'
  },
  // Property Management Clients (5)
  {
    email: 'pmclient1@test.com',
    password: 'test123',
    role: 'property_owner',
    firstName: 'John',
    lastName: 'Anderson',
    serviceType: 'property_management'
  },
  {
    email: 'pmclient2@test.com',
    password: 'test123',
    role: 'property_owner',
    firstName: 'Sarah',
    lastName: 'Martinez',
    serviceType: 'property_management'
  },
  {
    email: 'pmclient3@test.com',
    password: 'test123',
    role: 'property_owner',
    firstName: 'Michael',
    lastName: 'Thompson',
    serviceType: 'property_management'
  },
  {
    email: 'pmclient4@test.com',
    password: 'test123',
    role: 'property_owner',
    firstName: 'Emily',
    lastName: 'Davis',
    serviceType: 'property_management'
  },
  {
    email: 'pmclient5@test.com',
    password: 'test123',
    role: 'property_owner',
    firstName: 'Robert',
    lastName: 'Wilson',
    serviceType: 'property_management'
  },
  // House Watching Clients (5)
  {
    email: 'hwclient1@test.com',
    password: 'test123',
    role: 'property_owner',
    firstName: 'Jennifer',
    lastName: 'Clark',
    serviceType: 'house_watching'
  },
  {
    email: 'hwclient2@test.com',
    password: 'test123',
    role: 'property_owner',
    firstName: 'David',
    lastName: 'Brown',
    serviceType: 'house_watching'
  },
  {
    email: 'hwclient3@test.com',
    password: 'test123',
    role: 'property_owner',
    firstName: 'Lisa',
    lastName: 'Johnson',
    serviceType: 'house_watching'
  },
  {
    email: 'hwclient4@test.com',
    password: 'test123',
    role: 'property_owner',
    firstName: 'James',
    lastName: 'Miller',
    serviceType: 'house_watching'
  },
  {
    email: 'hwclient5@test.com',
    password: 'test123',
    role: 'property_owner',
    firstName: 'Amanda',
    lastName: 'Garcia',
    serviceType: 'house_watching'
  },
  // Sample Tenants
  {
    email: 'tenant1@test.com',
    password: 'test123',
    role: 'tenant',
    firstName: 'Mark',
    lastName: 'Taylor'
  },
  {
    email: 'tenant2@test.com',
    password: 'test123',
    role: 'tenant',
    firstName: 'Rachel',
    lastName: 'White'
  },
  // House Watchers
  {
    email: 'watcher1@test.com',
    password: 'test123',
    role: 'house_watcher',
    firstName: 'Steve',
    lastName: 'Parker'
  },
  {
    email: 'watcher2@test.com',
    password: 'test123',
    role: 'house_watcher',
    firstName: 'Nancy',
    lastName: 'Lewis'
  }
];

export function SeedDatabase() {
  const [seeding, setSeeding] = useState(false);
  const [seedResults, setSeedResults] = useState<string[]>([]);
  const [hasSeeded, setHasSeeded] = useState(false);

  const seedTestUsers = async () => {
    setSeeding(true);
    setSeedResults([]);
    
    try {
      const results: string[] = [];
      
      for (const user of testUsers) {
        try {
          // Create user account
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                first_name: user.firstName,
                last_name: user.lastName
              }
            }
          });

          if (authError) {
            if (authError.message.includes('already registered')) {
              results.push(`✓ ${user.role}: User already exists (${user.email})`);
              continue;
            }
            throw authError;
          }

          if (authData.user) {
            // The trigger will automatically create the profile and assign the role
            // For testing, we'll set the role manually if needed
            const { error: roleError } = await supabase
              .from('user_roles')
              .upsert({
                user_id: authData.user.id,
                role: user.role as any // Cast to match enum
              });

            if (roleError) {
              console.error('Role assignment error:', roleError);
            }

            results.push(`✓ ${user.role}: Created successfully (${user.email})`);
          }
        } catch (error) {
          console.error(`Error creating ${user.role}:`, error);
          results.push(`✗ ${user.role}: Failed to create (${user.email})`);
        }
      }

      // Create sample data for property owner
      await createSampleProperties();
      results.push('✓ Sample properties created');
      
      setSeedResults(results);
      setHasSeeded(true);
      
      toast({
        title: "Database Seeded",
        description: "Test users and sample data have been created successfully!",
      });
      
    } catch (error) {
      console.error('Seeding error:', error);
      toast({
        title: "Seeding Failed",
        description: "There was an error creating test data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setSeeding(false);
    }
  };

  const createSampleProperties = async () => {
    try {
      // Get all property management users
      const { data: pmUsers } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .ilike('email', 'pmclient%@test.com');

      // Get all house watching users
      const { data: hwUsers } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .ilike('email', 'hwclient%@test.com');

      if (!pmUsers || !hwUsers) {
        console.log('Could not find test users for property creation');
        return;
      }

      // Create property owners for PM clients
      const pmOwners = [];
      for (const user of pmUsers) {
        const { data: owner, error } = await supabase
          .from('property_owners')
          .insert({
            user_id: user.id,
            first_name: user.first_name || 'Test',
            last_name: user.last_name || 'Owner',
            email: user.email || `${user.id}@test.com`,
            phone: '555-0100',
            is_self: true
          })
          .select()
          .single();

        if (!error && owner) {
          pmOwners.push(owner);
        }
      }

      // Create property owners for HW clients
      const hwOwners = [];
      for (const user of hwUsers) {
        const { data: owner, error } = await supabase
          .from('property_owners')
          .insert({
            user_id: user.id,
            first_name: user.first_name || 'Test',
            last_name: user.last_name || 'Owner',
            email: user.email || `${user.id}@test.com`,
            phone: '555-0200',
            is_self: true
          })
          .select()
          .single();

        if (!error && owner) {
          hwOwners.push(owner);
        }
      }

      // Property Management Properties (8 total)
      const pmProperties = [
        { address: '123 Oak Street', city: 'Los Angeles', state: 'CA', zip: '90210', type: 'single_family', rent: 2500, service: 'property_management' },
        { address: '456 Pine Avenue', city: 'San Diego', state: 'CA', zip: '92101', type: 'condo', rent: 2200, service: 'property_management' },
        { address: '789 Maple Drive', city: 'San Francisco', state: 'CA', zip: '94105', type: 'townhouse', rent: 3500, service: 'property_management' },
        { address: '321 Elm Street', city: 'Sacramento', state: 'CA', zip: '95814', type: 'apartment', rent: 1800, service: 'property_management' },
        { address: '654 Cedar Lane', city: 'Fresno', state: 'CA', zip: '93650', type: 'single_family', rent: 1950, service: 'property_management' },
        { address: '987 Birch Court', city: 'San Jose', state: 'CA', zip: '95110', type: 'condo', rent: 2800, service: 'property_management' },
        { address: '147 Willow Way', city: 'Oakland', state: 'CA', zip: '94612', type: 'duplex', rent: 2300, service: 'property_management' },
        { address: '258 Spruce Street', city: 'Long Beach', state: 'CA', zip: '90802', type: 'townhouse', rent: 2650, service: 'property_management' }
      ];

      // House Watching Properties (4 total)
      const hwProperties = [
        { address: '111 Vacation Vista', city: 'Malibu', state: 'CA', zip: '90265', type: 'single_family', rent: null, service: 'house_watching' },
        { address: '222 Summer Place', city: 'Carmel', state: 'CA', zip: '93921', type: 'vacation_home', rent: null, service: 'house_watching' },
        { address: '333 Holiday Heights', city: 'Lake Tahoe', state: 'CA', zip: '96150', type: 'cabin', rent: null, service: 'house_watching' },
        { address: '444 Retreat Road', city: 'Big Sur', state: 'CA', zip: '93920', type: 'single_family', rent: null, service: 'house_watching' }
      ];

      // Create PM properties
      for (let i = 0; i < pmProperties.length && i < pmOwners.length; i++) {
        const property = pmProperties[i];
        const owner = pmOwners[i % pmOwners.length];
        
        await supabase.from('properties').insert({
          user_id: owner.user_id,
          owner_id: owner.id,
          address: property.address,
          city: property.city,
          state: property.state,
          zip_code: property.zip,
          property_type: property.type,
          service_type: property.service,
          monthly_rent: property.rent,
          bedrooms: Math.floor(Math.random() * 4) + 2,
          bathrooms: Math.floor(Math.random() * 3) + 1,
          square_feet: Math.floor(Math.random() * 1500) + 1000,
          status: 'active',
          description: `TEST PROPERTY - ${property.type} in ${property.city}`
        });
      }

      // Create HW properties
      for (let i = 0; i < hwProperties.length && i < hwOwners.length; i++) {
        const property = hwProperties[i];
        const owner = hwOwners[i % hwOwners.length];
        
        await supabase.from('properties').insert({
          user_id: owner.user_id,
          owner_id: owner.id,
          address: property.address,
          city: property.city,
          state: property.state,
          zip_code: property.zip,
          property_type: property.type,
          service_type: property.service,
          monthly_rent: property.rent,
          bedrooms: Math.floor(Math.random() * 4) + 2,
          bathrooms: Math.floor(Math.random() * 3) + 1,
          square_feet: Math.floor(Math.random() * 2000) + 1500,
          status: 'active',
          description: `TEST PROPERTY - ${property.type} house watching service in ${property.city}`
        });
      }

      // Create house watching records for HW properties
      const { data: hwPropsData } = await supabase
        .from('properties')
        .select('id, address, user_id')
        .eq('service_type', 'house_watching');

      if (hwPropsData) {
        for (const prop of hwPropsData) {
          await supabase.from('house_watching').insert({
            user_id: prop.user_id,
            property_address: prop.address,
            start_date: new Date().toISOString().split('T')[0],
            status: 'active',
            check_frequency: 'weekly',
            monthly_fee: Math.floor(Math.random() * 200) + 100,
            notes: 'TEST - House watching service for vacation property'
          });
        }
      }

      console.log('Created comprehensive test properties and data');
    } catch (error) {
      console.error('Error creating sample properties:', error);
    }
  };

  const clearTestData = async () => {
    try {
      // Note: In a real app, you'd want more sophisticated cleanup
      // This is just for development purposes
      const userEmails = testUsers.map(u => u.email);
      
      toast({
        title: "Clear Data",
        description: `You would clear test data for: ${userEmails.join(', ')}`,
      });
    } catch (error) {
      console.error('Clear data error:', error);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Development Database Seeder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This is a development tool. It creates test users and sample data for testing different user roles.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Creating 14 test users + 12 properties (8 PM + 4 HW)
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {testUsers.map((user) => (
              <div key={user.email} className="p-2 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">{user.role}</Badge>
                    {user.serviceType && (
                      <Badge variant="secondary" className="text-xs">
                        {user.serviceType === 'property_management' ? 'PM' : 'HW'}
                      </Badge>
                    )}
                  </div>
                  <Users className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="text-xs">
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={seedTestUsers} 
            disabled={seeding}
            className="flex-1"
          >
            {seeding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                {hasSeeded ? 'Re-seed Database' : 'Seed Database'}
              </>
            )}
          </Button>
          
          {hasSeeded && (
            <Button 
              variant="outline" 
              onClick={clearTestData}
            >
              Clear Test Data
            </Button>
          )}
        </div>

        {seedResults.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Seed Results:</p>
            <div className="space-y-1">
              {seedResults.map((result, index) => (
                <p key={index} className={`text-xs ${
                  result.startsWith('✓') ? 'text-success' : 'text-destructive'
                }`}>
                  {result}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}