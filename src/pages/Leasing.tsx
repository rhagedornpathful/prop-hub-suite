import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadManagementDashboard } from '@/components/LeadManagementDashboard';
import { PropertyListingManager } from '@/components/PropertyListingManager';
import { RentalApplicationManager } from '@/components/RentalApplicationManager';
import { TourSchedulingManager } from '@/components/TourSchedulingManager';
import { MarketingCampaignManager } from '@/components/MarketingCampaignManager';

export default function Leasing() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing & Leasing</h1>
          <p className="text-muted-foreground">
            Manage leads, listings, applications, and marketing campaigns
          </p>
        </div>
      </div>

      <Tabs defaultValue="leads" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="tours">Tours</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-6">
          <LeadManagementDashboard />
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          <PropertyListingManager />
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <RentalApplicationManager />
        </TabsContent>

        <TabsContent value="tours" className="space-y-6">
          <TourSchedulingManager />
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <MarketingCampaignManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}