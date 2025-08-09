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
      
      // Create test data directly in the database without relying on auth.signUp
      // This bypasses email confirmation and rate limiting issues
      
      // Step 1: Get current user (admin) to create test data under
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Must be logged in to seed data');
      }
      
      // Step 2: Create property owners directly
      const owners = [
        { firstName: 'John', lastName: 'Anderson', email: 'john.anderson@test.com' },
        { firstName: 'Sarah', lastName: 'Martinez', email: 'sarah.martinez@test.com' },
        { firstName: 'Michael', lastName: 'Thompson', email: 'michael.thompson@test.com' },
        { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@test.com' },
        { firstName: 'Robert', lastName: 'Wilson', email: 'robert.wilson@test.com' }
      ];
      
      const createdOwners = [];
      for (const owner of owners) {
        const { data, error } = await supabase
          .from('property_owners')
          .insert({
            user_id: user.id,
            first_name: owner.firstName,
            last_name: owner.lastName,
            email: owner.email,
            phone: '555-0123',
            is_self: false
          })
          .select()
          .single();
          
        if (error) {
          console.error('Owner creation error:', error);
          results.push(`✗ Failed to create owner: ${owner.firstName} ${owner.lastName}`);
        } else {
          createdOwners.push(data);
          results.push(`✓ Created property owner: ${owner.firstName} ${owner.lastName}`);
        }
      }
      
      // Step 3: Create properties for each owner
      const propertyTemplates = [
        { address: '123 Oak Street', city: 'Los Angeles', state: 'CA', zip: '90210', type: 'single_family', rent: 2500 },
        { address: '456 Pine Avenue', city: 'San Diego', state: 'CA', zip: '92101', type: 'condo', rent: 2200 },
        { address: '789 Maple Drive', city: 'San Francisco', state: 'CA', zip: '94105', type: 'townhouse', rent: 3500 },
        { address: '321 Elm Street', city: 'Sacramento', state: 'CA', zip: '95814', type: 'apartment', rent: 1800 },
        { address: '654 Cedar Lane', city: 'Fresno', state: 'CA', zip: '93650', type: 'single_family', rent: 1950 },
        { address: '987 Birch Court', city: 'San Jose', state: 'CA', zip: '95110', type: 'condo', rent: 2800 },
        { address: '147 Willow Way', city: 'Oakland', state: 'CA', zip: '94612', type: 'duplex', rent: 2300 },
        { address: '258 Spruce Street', city: 'Long Beach', state: 'CA', zip: '90802', type: 'townhouse', rent: 2650 },
        { address: '369 Vacation Vista', city: 'Malibu', state: 'CA', zip: '90265', type: 'vacation_home', rent: null },
        { address: '741 Summer Place', city: 'Carmel', state: 'CA', zip: '93921', type: 'vacation_home', rent: null },
        { address: '852 Holiday Heights', city: 'Lake Tahoe', state: 'CA', zip: '96150', type: 'cabin', rent: null },
        { address: '963 Retreat Road', city: 'Big Sur', state: 'CA', zip: '93920', type: 'single_family', rent: null }
      ];
      
      let propertyCount = 0;
      for (let i = 0; i < Math.min(propertyTemplates.length, createdOwners.length * 3); i++) {
        const template = propertyTemplates[i];
        const owner = createdOwners[i % createdOwners.length];
        
        const { data, error } = await supabase
          .from('properties')
          .insert({
            user_id: user.id,
            owner_id: owner.id,
            address: template.address,
            city: template.city,
            state: template.state,
            zip_code: template.zip,
            property_type: template.type,
            service_type: template.rent ? 'property_management' : 'house_watching',
            monthly_rent: template.rent,
            bedrooms: Math.floor(Math.random() * 4) + 2,
            bathrooms: Math.floor(Math.random() * 3) + 1,
            square_feet: Math.floor(Math.random() * 1500) + 1000,
            status: 'active',
            description: `TEST PROPERTY - ${template.type} in ${template.city}`
          })
          .select()
          .single();
          
        if (error) {
          console.error('Property creation error:', error);
          results.push(`✗ Failed to create property: ${template.address}`);
        } else {
          propertyCount++;
          results.push(`✓ Created property: ${template.address}`);
        }
      }
      
      results.push(`✓ Created ${propertyCount} properties total`);
      
      setSeedResults(results);
      setHasSeeded(true);
      
      toast({
        title: "Database Seeded",
        description: `Successfully created ${propertyCount} test properties!`,
      });
      
    } catch (error) {
      console.error('Seeding error:', error);
      setSeedResults([`✗ Seeding failed: ${error.message}`]);
      toast({
        title: "Seeding Failed",
        description: error.message || "There was an error creating test data.",
        variant: "destructive",
      });
    } finally {
      setSeeding(false);
    }
  };

  const createSampleProperties = async () => {
    try {
      console.log('Starting property creation...');
      
      // Get all property management users from profiles table
      const { data: pmUsers, error: pmError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .limit(10); // Since we can't filter by email, get first 10

      // Get all house watching users from profiles table  
      const { data: hwUsers, error: hwError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .limit(10);

      console.log('PM Users found:', pmUsers?.length || 0, pmUsers);
      console.log('HW Users found:', hwUsers?.length || 0, hwUsers);
      
      if (pmError) console.error('PM Users error:', pmError);
      if (hwError) console.error('HW Users error:', hwError);

      if (!pmUsers?.length && !hwUsers?.length) {
        console.log('No test users found for property creation. Users in DB:');
        const { data: allUsers } = await supabase.from('profiles').select('first_name, last_name').limit(10);
        console.log(allUsers);
        return;
      }

      // Create property owners for PM clients
      const pmOwners = [];
      for (const user of pmUsers) {
        const { data: owner, error } = await supabase
          .from('property_owners')
          .insert({
            user_id: user.user_id,
            first_name: user.first_name || 'Test',
            last_name: user.last_name || 'Owner',
            email: 'test@example.com', // Default email since not available in profiles
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
            user_id: user.user_id,
            first_name: user.first_name || 'Test',
            last_name: user.last_name || 'Owner',
            email: 'test@example.com', // Default email since not available in profiles
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

      // Create tenant records for some PM properties
      const { data: pmPropsData } = await supabase
        .from('properties')
        .select('id, address, user_id')
        .eq('service_type', 'property_management')
        .limit(4);

      const { data: tenantUsers } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .limit(4);

      if (pmPropsData && tenantUsers) {
        for (let i = 0; i < Math.min(pmPropsData.length, tenantUsers.length); i++) {
          const property = pmPropsData[i];
          const tenant = tenantUsers[i];
          
          await supabase.from('tenants').insert({
            user_id: property.user_id,
            user_account_id: tenant.user_id,
            property_id: property.id,
            first_name: tenant.first_name || 'Test',
            last_name: tenant.last_name || 'Tenant',
            email: 'tenant@example.com',
            phone: '555-0300',
            lease_start_date: new Date().toISOString().split('T')[0],
            lease_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            monthly_rent: Math.floor(Math.random() * 1000) + 1500,
            security_deposit: Math.floor(Math.random() * 1000) + 1500,
            notes: 'TEST - Tenant record for property management'
          });
        }
      }

      // Create maintenance requests for properties
      const { data: allPropsForMaintenance } = await supabase
        .from('properties')
        .select('id, address, user_id')
        .limit(6);

      if (allPropsForMaintenance) {
        const maintenanceTypes = [
          { title: 'Leaky Faucet Repair', description: 'Kitchen sink faucet is dripping', priority: 'high' },
          { title: 'HVAC Filter Replacement', description: 'Annual filter replacement due', priority: 'medium' },
          { title: 'Exterior Paint Touch-up', description: 'Front door needs paint refresh', priority: 'low' },
          { title: 'Garage Door Service', description: 'Door making unusual noises', priority: 'medium' },
          { title: 'Gutter Cleaning', description: 'Seasonal gutter maintenance', priority: 'low' },
          { title: 'Smoke Detector Battery', description: 'Replace batteries in all units', priority: 'high' }
        ];

        for (let i = 0; i < allPropsForMaintenance.length; i++) {
          const property = allPropsForMaintenance[i];
          const maintenance = maintenanceTypes[i];
          
          await supabase.from('maintenance_requests').insert({
            user_id: property.user_id,
            property_id: property.id,
            title: maintenance.title,
            description: maintenance.description,
            priority: maintenance.priority,
            status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'in_progress' : 'pending',
            estimated_cost: Math.floor(Math.random() * 500) + 100,
            contractor_name: i % 2 === 0 ? 'TEST - ABC Repair Services' : 'TEST - Quick Fix Solutions',
            contractor_contact: '555-0400',
            notes: 'TEST - Sample maintenance request for testing'
          });
        }
      }

      // Create house watcher assignments
      const { data: houseWatchers } = await supabase
        .from('house_watchers')
        .select('id, user_id');

      if (houseWatchers && hwPropsData) {
        for (let i = 0; i < Math.min(houseWatchers.length, hwPropsData.length); i++) {
          const watcher = houseWatchers[i];
          const property = hwPropsData[i];
          
          await supabase.from('house_watcher_properties').insert({
            house_watcher_id: watcher.id,
            property_id: property.id,
            notes: 'TEST - House watcher assignment for monitoring'
          });
        }
      }

      console.log('Created comprehensive test data: properties, tenants, maintenance requests, and assignments');
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

  if (import.meta.env.PROD) {
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