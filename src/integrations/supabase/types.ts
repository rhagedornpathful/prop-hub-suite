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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          left_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          last_message_at: string | null
          maintenance_request_id: string | null
          property_id: string | null
          status: string
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          last_message_at?: string | null
          maintenance_request_id?: string | null
          property_id?: string | null
          status?: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          last_message_at?: string | null
          maintenance_request_id?: string | null
          property_id?: string | null
          status?: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          maintenance_request_id: string | null
          property_id: string | null
          property_owner_id: string | null
          tags: string[] | null
          tenant_id: string | null
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
          maintenance_request_id?: string | null
          property_id?: string | null
          property_owner_id?: string | null
          tags?: string[] | null
          tenant_id?: string | null
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
          maintenance_request_id?: string | null
          property_id?: string | null
          property_owner_id?: string | null
          tags?: string[] | null
          tenant_id?: string | null
          updated_at?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_owner_id_fkey"
            columns: ["property_owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      home_check_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      home_check_sessions: {
        Row: {
          checklist_data: Json | null
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          general_notes: string | null
          id: string
          next_visit_date: string | null
          overall_condition: string | null
          photos_taken: number | null
          property_id: string
          scheduled_by: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          started_at: string | null
          status: string
          total_issues_found: number | null
          updated_at: string
          user_id: string
          weather: string | null
          weather_impact: string | null
        }
        Insert: {
          checklist_data?: Json | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          general_notes?: string | null
          id?: string
          next_visit_date?: string | null
          overall_condition?: string | null
          photos_taken?: number | null
          property_id: string
          scheduled_by?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: string
          total_issues_found?: number | null
          updated_at?: string
          user_id: string
          weather?: string | null
          weather_impact?: string | null
        }
        Update: {
          checklist_data?: Json | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          general_notes?: string | null
          id?: string
          next_visit_date?: string | null
          overall_condition?: string | null
          photos_taken?: number | null
          property_id?: string
          scheduled_by?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: string
          total_issues_found?: number | null
          updated_at?: string
          user_id?: string
          weather?: string | null
          weather_impact?: string | null
        }
        Relationships: []
      }
      house_watcher_properties: {
        Row: {
          assigned_date: string
          house_watcher_id: string
          id: string
          notes: string | null
          property_id: string
        }
        Insert: {
          assigned_date?: string
          house_watcher_id: string
          id?: string
          notes?: string | null
          property_id: string
        }
        Update: {
          assigned_date?: string
          house_watcher_id?: string
          id?: string
          notes?: string | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "house_watcher_properties_house_watcher_id_fkey"
            columns: ["house_watcher_id"]
            isOneToOne: false
            referencedRelation: "house_watchers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "house_watcher_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      house_watchers: {
        Row: {
          assigned_by: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_by: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_by?: string
          created_at?: string
          id?: string
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
          actual_cost: number | null
          assigned_at: string | null
          assigned_to: string | null
          cancelled_at: string | null
          completed_at: string | null
          completion_notes: string | null
          contractor_contact: string | null
          contractor_name: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_cost: number | null
          id: string
          is_recurring: boolean | null
          notes: string | null
          parent_request_id: string | null
          priority: string
          property_id: string
          recurrence_interval: string | null
          scheduled_date: string | null
          started_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          assigned_at?: string | null
          assigned_to?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          contractor_contact?: string | null
          contractor_name?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          parent_request_id?: string | null
          priority?: string
          property_id: string
          recurrence_interval?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          assigned_at?: string | null
          assigned_to?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          contractor_contact?: string | null
          contractor_name?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          parent_request_id?: string | null
          priority?: string
          property_id?: string
          recurrence_interval?: string | null
          scheduled_date?: string | null
          started_at?: string | null
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
      maintenance_status_history: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          maintenance_request_id: string
          new_status: string
          notes: string | null
          old_status: string | null
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          maintenance_request_id: string
          new_status: string
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          maintenance_request_id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Relationships: []
      }
      message_deliveries: {
        Row: {
          delivered_at: string | null
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          delivered_at?: string | null
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          delivered_at?: string | null
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_deliveries_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          message_type: string
          reply_to_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string
          reply_to_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string
          reply_to_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_distributions: {
        Row: {
          amount: number
          created_at: string
          distribution_date: string
          id: string
          notes: string | null
          owner_id: string
          payment_method: string | null
          property_id: string
          reference_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          distribution_date: string
          id?: string
          notes?: string | null
          owner_id: string
          payment_method?: string | null
          property_id: string
          reference_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          distribution_date?: string
          id?: string
          notes?: string | null
          owner_id?: string
          payment_method?: string | null
          property_id?: string
          reference_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_distributions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_distributions_property_id_fkey"
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
          home_value_estimate: number | null
          id: string
          images: string[] | null
          lot_size: string | null
          monthly_rent: number | null
          owner_id: string | null
          property_type: string | null
          rent_estimate: number | null
          service_type: string | null
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
          home_value_estimate?: number | null
          id?: string
          images?: string[] | null
          lot_size?: string | null
          monthly_rent?: number | null
          owner_id?: string | null
          property_type?: string | null
          rent_estimate?: number | null
          service_type?: string | null
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
          home_value_estimate?: number | null
          id?: string
          images?: string[] | null
          lot_size?: string | null
          monthly_rent?: number | null
          owner_id?: string | null
          property_type?: string | null
          rent_estimate?: number | null
          service_type?: string | null
          square_feet?: number | null
          state?: string | null
          status?: string | null
          street_address?: string | null
          updated_at?: string
          user_id?: string
          year_built?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      property_check_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_check_activities_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "property_check_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      property_check_sessions: {
        Row: {
          checklist_data: Json | null
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          general_notes: string | null
          id: string
          location_verified: boolean | null
          property_id: string
          scheduled_by: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checklist_data?: Json | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          general_notes?: string | null
          id?: string
          location_verified?: boolean | null
          property_id: string
          scheduled_by?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checklist_data?: Json | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          general_notes?: string | null
          id?: string
          location_verified?: boolean | null
          property_id?: string
          scheduled_by?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_owner_associations: {
        Row: {
          created_at: string
          id: string
          is_primary_owner: boolean
          ownership_percentage: number | null
          property_id: string
          property_owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary_owner?: boolean
          ownership_percentage?: number | null
          property_id: string
          property_owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary_owner?: boolean
          ownership_percentage?: number | null
          property_id?: string
          property_owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_owner_associations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_owner_associations_property_owner_id_fkey"
            columns: ["property_owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      property_owners: {
        Row: {
          address: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_routing_number: string | null
          city: string | null
          company_name: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_self: boolean
          last_name: string
          notes: string | null
          phone: string
          preferred_payment_method: string | null
          spouse_partner_name: string | null
          state: string | null
          tax_id_number: string | null
          updated_at: string
          user_account_id: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_routing_number?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_self?: boolean
          last_name: string
          notes?: string | null
          phone: string
          preferred_payment_method?: string | null
          spouse_partner_name?: string | null
          state?: string | null
          tax_id_number?: string | null
          updated_at?: string
          user_account_id?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_routing_number?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_self?: boolean
          last_name?: string
          notes?: string | null
          phone?: string
          preferred_payment_method?: string | null
          spouse_partner_name?: string | null
          state?: string | null
          tax_id_number?: string | null
          updated_at?: string
          user_account_id?: string | null
          user_id?: string
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
          user_account_id: string | null
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
          user_account_id?: string | null
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
          user_account_id?: string | null
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
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      force_make_me_admin: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
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
      make_me_admin: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      seed_test_users: {
        Args: Record<PropertyKey, never>
        Returns: string
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
