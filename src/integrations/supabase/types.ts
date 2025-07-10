export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      documents: {
        Row: {
          category: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          tags: string[] | null
          updated_at: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          category?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          category?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      house_watching: {
        Row: {
          check_frequency: string | null
          created_at: string
          emergency_contact: string | null
          end_date: string | null
          id: string
          key_location: string | null
          last_check_date: string | null
          monthly_fee: number | null
          next_check_date: string | null
          notes: string | null
          owner_contact: string | null
          owner_name: string | null
          property_address: string
          special_instructions: string | null
          start_date: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          check_frequency?: string | null
          created_at?: string
          emergency_contact?: string | null
          end_date?: string | null
          id?: string
          key_location?: string | null
          last_check_date?: string | null
          monthly_fee?: number | null
          next_check_date?: string | null
          notes?: string | null
          owner_contact?: string | null
          owner_name?: string | null
          property_address: string
          special_instructions?: string | null
          start_date: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          check_frequency?: string | null
          created_at?: string
          emergency_contact?: string | null
          end_date?: string | null
          id?: string
          key_location?: string | null
          last_check_date?: string | null
          monthly_fee?: number | null
          next_check_date?: string | null
          notes?: string | null
          owner_contact?: string | null
          owner_name?: string | null
          property_address?: string
          special_instructions?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          contractor_contact: string | null
          contractor_name: string | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          id: string
          notes: string | null
          priority: string
          property_id: string
          scheduled_date: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contractor_contact?: string | null
          contractor_name?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          priority?: string
          property_id: string
          scheduled_date?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contractor_contact?: string | null
          contractor_name?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          priority?: string
          property_id?: string
          scheduled_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string
          description: string | null
          estimated_value: number | null
          gate_code: string | null
          id: string
          images: string[] | null
          lot_size: string | null
          monthly_rent: number | null
          property_type: string | null
          square_feet: number | null
          state: string | null
          status: string | null
          street_address: string | null
          updated_at: string
          user_id: string
          year_built: number | null
          zip_code: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          gate_code?: string | null
          id?: string
          images?: string[] | null
          lot_size?: string | null
          monthly_rent?: number | null
          property_type?: string | null
          square_feet?: number | null
          state?: string | null
          status?: string | null
          street_address?: string | null
          updated_at?: string
          user_id: string
          year_built?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          gate_code?: string | null
          id?: string
          images?: string[] | null
          lot_size?: string | null
          monthly_rent?: number | null
          property_type?: string | null
          square_feet?: number | null
          state?: string | null
          status?: string | null
          street_address?: string | null
          updated_at?: string
          user_id?: string
          year_built?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          id: string
          last_name: string
          lease_end_date: string | null
          lease_start_date: string | null
          monthly_rent: number | null
          notes: string | null
          phone: string | null
          property_id: string
          security_deposit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          id?: string
          last_name: string
          lease_end_date?: string | null
          lease_start_date?: string | null
          monthly_rent?: number | null
          notes?: string | null
          phone?: string | null
          property_id: string
          security_deposit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          id?: string
          last_name?: string
          lease_end_date?: string | null
          lease_start_date?: string | null
          monthly_rent?: number | null
          notes?: string | null
          phone?: string | null
          property_id?: string
          security_deposit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "property_manager"
        | "house_watcher"
        | "client"
        | "contractor"
        | "tenant"
        | "owner_investor"
        | "leasing_agent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "property_manager",
        "house_watcher",
        "client",
        "contractor",
        "tenant",
        "owner_investor",
        "leasing_agent",
      ],
    },
  },
} as const
