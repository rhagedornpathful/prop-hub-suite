import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Vendor {
  id: string;
  user_id?: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  category: string;
  specialties: string[];
  hourly_rate?: number;
  service_areas: string[];
  license_number?: string;
  insurance_expiry?: string;
  availability_status: 'available' | 'busy' | 'unavailable';
  rating: number;
  total_jobs: number;
  completed_jobs: number;
  average_response_time_hours: number;
  joined_date: string;
  last_active_at: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorWorkOrder {
  id: string;
  vendor_id: string;
  property_id?: string;
  maintenance_request_id?: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  estimated_cost?: number;
  actual_cost?: number;
  materials_cost?: number;
  labor_cost?: number;
  notes?: string;
  completion_notes?: string;
  assigned_by?: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface VendorReview {
  id: string;
  vendor_id: string;
  work_order_id?: string;
  reviewer_id: string;
  rating: number;
  title?: string;
  comment?: string;
  quality_rating?: number;
  timeliness_rating?: number;
  communication_rating?: number;
  would_recommend: boolean;
  created_at: string;
  updated_at: string;
}

export const useVendors = () => {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      console.log("📋 Fetching vendors from database...");
      
      const { data: vendors, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });

      if (error) {
        console.error("❌ Error fetching vendors:", error);
        throw error;
      }

      console.log("✅ Vendors fetched successfully:", vendors);
      return vendors as Vendor[];
    },
  });
};

export const useVendorsByCategory = (category?: string) => {
  return useQuery({
    queryKey: ["vendors", "category", category],
    queryFn: async () => {
      console.log("📋 Fetching vendors by category:", category);
      
      let query = supabase
        .from("vendors")
        .select("*")
        .eq("is_active", true);

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data: vendors, error } = await query
        .order("rating", { ascending: false });

      if (error) {
        console.error("❌ Error fetching vendors by category:", error);
        throw error;
      }

      console.log("✅ Vendors by category fetched successfully:", vendors);
      return vendors as Vendor[];
    },
    enabled: !!category || category === "all",
  });
};

export const useVendorWorkOrders = (vendorId?: string) => {
  return useQuery({
    queryKey: ["vendor-work-orders", vendorId],
    queryFn: async () => {
      console.log("📋 Fetching vendor work orders...");
      
      let query = supabase
        .from("vendor_work_orders")
        .select(`
          *,
          vendor:vendors(business_name, contact_name),
          property:properties(address, city, state)
        `);

      if (vendorId) {
        query = query.eq("vendor_id", vendorId);
      }

      const { data: workOrders, error } = await query
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching vendor work orders:", error);
        throw error;
      }

      console.log("✅ Vendor work orders fetched successfully:", workOrders);
      return workOrders as VendorWorkOrder[];
    },
  });
};

export const useVendorReviews = (vendorId?: string) => {
  return useQuery({
    queryKey: ["vendor-reviews", vendorId],
    queryFn: async () => {
      console.log("📋 Fetching vendor reviews...");
      
      let query = supabase
        .from("vendor_reviews")
        .select("*");

      if (vendorId) {
        query = query.eq("vendor_id", vendorId);
      }

      const { data: reviews, error } = await query
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching vendor reviews:", error);
        throw error;
      }

      console.log("✅ Vendor reviews fetched successfully:", reviews);
      return reviews as VendorReview[];
    },
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
      console.log("➕ Creating vendor:", vendorData);
      
      const { data, error } = await supabase
        .from("vendors")
        .insert(vendorData)
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating vendor:", error);
        throw error;
      }

      console.log("✅ Vendor created successfully:", data);
      return data as Vendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
    },
    onError: (error) => {
      console.error("❌ Error creating vendor:", error);
      toast({
        title: "Error",
        description: "Failed to create vendor",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Vendor> & { id: string }) => {
      console.log("✏️ Updating vendor:", id, updateData);
      
      const { data, error } = await supabase
        .from("vendors")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating vendor:", error);
        throw error;
      }

      console.log("✅ Vendor updated successfully:", data);
      return data as Vendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
    },
    onError: (error) => {
      console.error("❌ Error updating vendor:", error);
      toast({
        title: "Error",
        description: "Failed to update vendor",
        variant: "destructive",
      });
    },
  });
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workOrderData: Omit<VendorWorkOrder, 'id' | 'created_at' | 'updated_at' | 'assigned_at'>) => {
      console.log("➕ Creating work order:", workOrderData);
      
      const { data, error } = await supabase
        .from("vendor_work_orders")
        .insert(workOrderData)
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating work order:", error);
        throw error;
      }

      console.log("✅ Work order created successfully:", data);
      return data as VendorWorkOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-work-orders"] });
      toast({
        title: "Success",
        description: "Work order created successfully",
      });
    },
    onError: (error) => {
      console.error("❌ Error creating work order:", error);
      toast({
        title: "Error",
        description: "Failed to create work order",
        variant: "destructive",
      });
    },
  });
};

export const useCreateVendorReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reviewData: Omit<VendorReview, 'id' | 'created_at' | 'updated_at'>) => {
      console.log("➕ Creating vendor review:", reviewData);
      
      const { data, error } = await supabase
        .from("vendor_reviews")
        .insert(reviewData)
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating vendor review:", error);
        throw error;
      }

      console.log("✅ Vendor review created successfully:", data);
      return data as VendorReview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
    },
    onError: (error) => {
      console.error("❌ Error creating vendor review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    },
  });
};