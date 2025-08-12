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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      check_template_items: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          item_text: string
          section_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          item_text: string
          section_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          item_text?: string
          section_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_template_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "check_template_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      check_template_sections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_template_sections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "check_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      check_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversation_labels: {
        Row: {
          color: string | null
          conversation_id: string
          created_at: string
          id: string
          label: string
          user_id: string
        }
        Insert: {
          color?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          label: string
          user_id: string
        }
        Update: {
          color?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          label?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_labels_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
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
          auto_delete_after_days: number | null
          created_at: string
          created_by: string
          encryption_enabled: boolean | null
          id: string
          is_archived: boolean | null
          is_starred: boolean | null
          labels: string[] | null
          last_message_at: string | null
          maintenance_request_id: string | null
          muted_until: string | null
          priority: string | null
          property_id: string | null
          recipient_names: string[] | null
          retention_policy_id: string | null
          sender_name: string | null
          status: string
          thread_count: number | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          auto_delete_after_days?: number | null
          created_at?: string
          created_by: string
          encryption_enabled?: boolean | null
          id?: string
          is_archived?: boolean | null
          is_starred?: boolean | null
          labels?: string[] | null
          last_message_at?: string | null
          maintenance_request_id?: string | null
          muted_until?: string | null
          priority?: string | null
          property_id?: string | null
          recipient_names?: string[] | null
          retention_policy_id?: string | null
          sender_name?: string | null
          status?: string
          thread_count?: number | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          auto_delete_after_days?: number | null
          created_at?: string
          created_by?: string
          encryption_enabled?: boolean | null
          id?: string
          is_archived?: boolean | null
          is_starred?: boolean | null
          labels?: string[] | null
          last_message_at?: string | null
          maintenance_request_id?: string | null
          muted_until?: string | null
          priority?: string | null
          property_id?: string | null
          recipient_names?: string[] | null
          retention_policy_id?: string | null
          sender_name?: string | null
          status?: string
          thread_count?: number | null
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
          {
            foreignKeyName: "conversations_retention_policy_id_fkey"
            columns: ["retention_policy_id"]
            isOneToOne: false
            referencedRelation: "message_retention_policies"
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
      house_watcher_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          home_check_notifications: boolean
          id: string
          preferred_contact_method: string | null
          preferred_contact_time: string | null
          push_notifications: boolean
          reminder_notifications: boolean
          schedule_change_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          home_check_notifications?: boolean
          id?: string
          preferred_contact_method?: string | null
          preferred_contact_time?: string | null
          push_notifications?: boolean
          reminder_notifications?: boolean
          schedule_change_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          home_check_notifications?: boolean
          id?: string
          preferred_contact_method?: string | null
          preferred_contact_time?: string | null
          push_notifications?: boolean
          reminder_notifications?: boolean
          schedule_change_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      leads: {
        Row: {
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_contacted_at: string | null
          last_name: string
          move_in_date: string | null
          notes: string | null
          phone: string | null
          preferred_contact_method: string | null
          priority: string | null
          property_id: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_contacted_at?: string | null
          last_name: string
          move_in_date?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          priority?: string | null
          property_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_contacted_at?: string | null
          last_name?: string
          move_in_date?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          priority?: string | null
          property_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
      marketing_campaigns: {
        Row: {
          budget: number | null
          campaign_type: string
          created_at: string
          created_by: string | null
          creative_assets: Json | null
          description: string | null
          end_date: string | null
          id: string
          metrics: Json | null
          name: string
          platforms: string[] | null
          property_id: string | null
          start_date: string | null
          status: string | null
          target_audience: Json | null
          tracking_links: Json | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          campaign_type: string
          created_at?: string
          created_by?: string | null
          creative_assets?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name: string
          platforms?: string[] | null
          property_id?: string | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          tracking_links?: Json | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          creative_assets?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          platforms?: string[] | null
          property_id?: string | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          tracking_links?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      message_analytics: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          event_type: string
          id: string
          message_id: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          message_id?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          message_id?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_analytics_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_analytics_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
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
      message_encryption_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_fingerprint: string
          public_key: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_fingerprint: string
          public_key: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_fingerprint?: string
          public_key?: string
          user_id?: string
        }
        Relationships: []
      }
      message_mentions: {
        Row: {
          created_at: string | null
          id: string
          mentioned_user_id: string
          message_id: string
          read_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentioned_user_id: string
          message_id: string
          read_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mentioned_user_id?: string
          message_id?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_mentions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_retention_policies: {
        Row: {
          auto_delete_enabled: boolean | null
          conversation_type: string
          created_at: string | null
          id: string
          retention_days: number
          updated_at: string | null
        }
        Insert: {
          auto_delete_enabled?: boolean | null
          conversation_type: string
          created_at?: string | null
          id?: string
          retention_days: number
          updated_at?: string | null
        }
        Update: {
          auto_delete_enabled?: boolean | null
          conversation_type?: string
          created_at?: string | null
          id?: string
          retention_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_shared: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_shared?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_shared?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          bcc_recipients: string[] | null
          cc_recipients: string[] | null
          content: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          encrypted_content: string | null
          encryption_key_id: string | null
          expires_at: string | null
          forwarded_from_id: string | null
          id: string
          importance: string | null
          is_draft: boolean | null
          message_type: string
          reply_to_id: string | null
          scheduled_at: string | null
          sender_id: string
          subject: string | null
          thread_id: string | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          bcc_recipients?: string[] | null
          cc_recipients?: string[] | null
          content: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          encrypted_content?: string | null
          encryption_key_id?: string | null
          expires_at?: string | null
          forwarded_from_id?: string | null
          id?: string
          importance?: string | null
          is_draft?: boolean | null
          message_type?: string
          reply_to_id?: string | null
          scheduled_at?: string | null
          sender_id: string
          subject?: string | null
          thread_id?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          bcc_recipients?: string[] | null
          cc_recipients?: string[] | null
          content?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          encrypted_content?: string | null
          encryption_key_id?: string | null
          expires_at?: string | null
          forwarded_from_id?: string | null
          id?: string
          importance?: string | null
          is_draft?: boolean | null
          message_type?: string
          reply_to_id?: string | null
          scheduled_at?: string | null
          sender_id?: string
          subject?: string | null
          thread_id?: string | null
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
            foreignKeyName: "messages_encryption_key_id_fkey"
            columns: ["encryption_key_id"]
            isOneToOne: false
            referencedRelation: "message_encryption_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_forwarded_from_id_fkey"
            columns: ["forwarded_from_id"]
            isOneToOne: false
            referencedRelation: "messages"
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
      notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          mention_notifications: boolean | null
          message_notifications: boolean | null
          push_notifications: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          mention_notifications?: boolean | null
          message_notifications?: boolean | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          mention_notifications?: boolean | null
          message_notifications?: boolean | null
          push_notifications?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      owner_statements: {
        Row: {
          created_at: string
          generated_at: string | null
          id: string
          management_fees: number | null
          net_amount: number | null
          owner_id: string
          paid_at: string | null
          property_id: string | null
          sent_at: string | null
          statement_data: Json | null
          statement_period_end: string
          statement_period_start: string
          status: string | null
          total_expenses: number | null
          total_rent_collected: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          generated_at?: string | null
          id?: string
          management_fees?: number | null
          net_amount?: number | null
          owner_id: string
          paid_at?: string | null
          property_id?: string | null
          sent_at?: string | null
          statement_data?: Json | null
          statement_period_end: string
          statement_period_start: string
          status?: string | null
          total_expenses?: number | null
          total_rent_collected?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          generated_at?: string | null
          id?: string
          management_fees?: number | null
          net_amount?: number | null
          owner_id?: string
          paid_at?: string | null
          property_id?: string | null
          sent_at?: string | null
          statement_data?: Json | null
          statement_period_end?: string
          statement_period_start?: string
          status?: string | null
          total_expenses?: number | null
          total_rent_collected?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string
          expires_month: number | null
          expires_year: number | null
          id: string
          is_default: boolean | null
          last_four: string | null
          stripe_payment_method_id: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string
          expires_month?: number | null
          expires_year?: number | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          stripe_payment_method_id: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string
          expires_month?: number | null
          expires_year?: number | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          stripe_payment_method_id?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          payment_type: string
          property_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_type: string
          property_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_type?: string
          property_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
          username: string | null
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
          username?: string | null
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
          username?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          appreciation_rate: number | null
          assessed_value: number | null
          bathrooms: number | null
          bedrooms: number | null
          cap_rate: number | null
          cash_flow: number | null
          city: string | null
          created_at: string
          crime_score: number | null
          data_sources: Json | null
          days_on_market: number | null
          description: string | null
          energy_efficiency_rating: string | null
          estimated_value: number | null
          gate_code: string | null
          hoa_fees: number | null
          home_value_estimate: number | null
          id: string
          images: string[] | null
          insurance_cost: number | null
          investment_metrics: Json | null
          last_inspection_date: string | null
          last_zillow_sync: string | null
          lease_expiry_date: string | null
          listing_status: string | null
          lot_size: string | null
          market_value: number | null
          marketing_description: string | null
          monthly_rent: number | null
          nearby_attractions: Json | null
          neighborhood_score: number | null
          next_inspection_date: string | null
          occupancy_rate: number | null
          owner_id: string | null
          property_class: string | null
          property_taxes: number | null
          property_type: string | null
          purchase_date: string | null
          purchase_price: number | null
          renovation_cost: number | null
          rent_estimate: number | null
          school_rating: number | null
          service_type: string | null
          square_feet: number | null
          state: string | null
          status: string | null
          street_address: string | null
          updated_at: string
          user_id: string
          walkability_score: number | null
          year_built: number | null
          zillow_data: Json | null
          zip_code: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          appreciation_rate?: number | null
          assessed_value?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cap_rate?: number | null
          cash_flow?: number | null
          city?: string | null
          created_at?: string
          crime_score?: number | null
          data_sources?: Json | null
          days_on_market?: number | null
          description?: string | null
          energy_efficiency_rating?: string | null
          estimated_value?: number | null
          gate_code?: string | null
          hoa_fees?: number | null
          home_value_estimate?: number | null
          id?: string
          images?: string[] | null
          insurance_cost?: number | null
          investment_metrics?: Json | null
          last_inspection_date?: string | null
          last_zillow_sync?: string | null
          lease_expiry_date?: string | null
          listing_status?: string | null
          lot_size?: string | null
          market_value?: number | null
          marketing_description?: string | null
          monthly_rent?: number | null
          nearby_attractions?: Json | null
          neighborhood_score?: number | null
          next_inspection_date?: string | null
          occupancy_rate?: number | null
          owner_id?: string | null
          property_class?: string | null
          property_taxes?: number | null
          property_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          renovation_cost?: number | null
          rent_estimate?: number | null
          school_rating?: number | null
          service_type?: string | null
          square_feet?: number | null
          state?: string | null
          status?: string | null
          street_address?: string | null
          updated_at?: string
          user_id: string
          walkability_score?: number | null
          year_built?: number | null
          zillow_data?: Json | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          appreciation_rate?: number | null
          assessed_value?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cap_rate?: number | null
          cash_flow?: number | null
          city?: string | null
          created_at?: string
          crime_score?: number | null
          data_sources?: Json | null
          days_on_market?: number | null
          description?: string | null
          energy_efficiency_rating?: string | null
          estimated_value?: number | null
          gate_code?: string | null
          hoa_fees?: number | null
          home_value_estimate?: number | null
          id?: string
          images?: string[] | null
          insurance_cost?: number | null
          investment_metrics?: Json | null
          last_inspection_date?: string | null
          last_zillow_sync?: string | null
          lease_expiry_date?: string | null
          listing_status?: string | null
          lot_size?: string | null
          market_value?: number | null
          marketing_description?: string | null
          monthly_rent?: number | null
          nearby_attractions?: Json | null
          neighborhood_score?: number | null
          next_inspection_date?: string | null
          occupancy_rate?: number | null
          owner_id?: string | null
          property_class?: string | null
          property_taxes?: number | null
          property_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          renovation_cost?: number | null
          rent_estimate?: number | null
          school_rating?: number | null
          service_type?: string | null
          square_feet?: number | null
          state?: string | null
          status?: string | null
          street_address?: string | null
          updated_at?: string
          user_id?: string
          walkability_score?: number | null
          year_built?: number | null
          zillow_data?: Json | null
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
      property_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          is_acknowledged: boolean | null
          is_active: boolean | null
          priority: string
          property_id: string
          resolved_at: string | null
          threshold_value: number | null
          title: string
          triggered_at: string | null
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_acknowledged?: boolean | null
          is_active?: boolean | null
          priority?: string
          property_id: string
          resolved_at?: string | null
          threshold_value?: number | null
          title: string
          triggered_at?: string | null
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_acknowledged?: boolean | null
          is_active?: boolean | null
          priority?: string
          property_id?: string
          resolved_at?: string | null
          threshold_value?: number | null
          title?: string
          triggered_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_alerts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_analytics: {
        Row: {
          benchmark_value: number | null
          change_percentage: number | null
          comparison_period: string | null
          created_at: string
          id: string
          metric_date: string
          metric_type: string
          metric_value: number
          notes: string | null
          property_id: string
          updated_at: string
        }
        Insert: {
          benchmark_value?: number | null
          change_percentage?: number | null
          comparison_period?: string | null
          created_at?: string
          id?: string
          metric_date?: string
          metric_type: string
          metric_value: number
          notes?: string | null
          property_id: string
          updated_at?: string
        }
        Update: {
          benchmark_value?: number | null
          change_percentage?: number | null
          comparison_period?: string | null
          created_at?: string
          id?: string
          metric_date?: string
          metric_type?: string
          metric_value?: number
          notes?: string | null
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_analytics_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      property_listings: {
        Row: {
          amenities: string[] | null
          application_count: number | null
          application_fee: number | null
          available_date: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          lead_count: number | null
          lease_term_months: number | null
          listed_by: string | null
          listing_platforms: string[] | null
          parking_available: boolean | null
          pet_policy: string | null
          property_id: string
          rent_amount: number
          security_deposit: number | null
          seo_description: string | null
          seo_title: string | null
          title: string
          updated_at: string
          utilities_included: string[] | null
          view_count: number | null
          virtual_tour_url: string | null
        }
        Insert: {
          amenities?: string[] | null
          application_count?: number | null
          application_fee?: number | null
          available_date: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          lead_count?: number | null
          lease_term_months?: number | null
          listed_by?: string | null
          listing_platforms?: string[] | null
          parking_available?: boolean | null
          pet_policy?: string | null
          property_id: string
          rent_amount: number
          security_deposit?: number | null
          seo_description?: string | null
          seo_title?: string | null
          title: string
          updated_at?: string
          utilities_included?: string[] | null
          view_count?: number | null
          virtual_tour_url?: string | null
        }
        Update: {
          amenities?: string[] | null
          application_count?: number | null
          application_fee?: number | null
          available_date?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          lead_count?: number | null
          lease_term_months?: number | null
          listed_by?: string | null
          listing_platforms?: string[] | null
          parking_available?: boolean | null
          pet_policy?: string | null
          property_id?: string
          rent_amount?: number
          security_deposit?: number | null
          seo_description?: string | null
          seo_title?: string | null
          title?: string
          updated_at?: string
          utilities_included?: string[] | null
          view_count?: number | null
          virtual_tour_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_manager_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          manager_user_id: string
          property_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          manager_user_id: string
          property_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          manager_user_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_manager_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "property_manager_assignments_manager_user_id_fkey"
            columns: ["manager_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "property_manager_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_market_comparisons: {
        Row: {
          comparable_address: string
          comparable_bed_bath: string | null
          comparable_price: number | null
          comparable_sqft: number | null
          comparison_score: number | null
          created_at: string
          data_source: string | null
          days_on_market: number | null
          distance_miles: number | null
          id: string
          price_per_sqft: number | null
          property_id: string
          sold_date: string | null
        }
        Insert: {
          comparable_address: string
          comparable_bed_bath?: string | null
          comparable_price?: number | null
          comparable_sqft?: number | null
          comparison_score?: number | null
          created_at?: string
          data_source?: string | null
          days_on_market?: number | null
          distance_miles?: number | null
          id?: string
          price_per_sqft?: number | null
          property_id: string
          sold_date?: string | null
        }
        Update: {
          comparable_address?: string
          comparable_bed_bath?: string | null
          comparable_price?: number | null
          comparable_sqft?: number | null
          comparison_score?: number | null
          created_at?: string
          data_source?: string | null
          days_on_market?: number | null
          distance_miles?: number | null
          id?: string
          price_per_sqft?: number | null
          property_id?: string
          sold_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_market_comparisons_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
          status: string
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
          status?: string
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
          status?: string
          tax_id_number?: string | null
          updated_at?: string
          user_account_id?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      property_service_assignments: {
        Row: {
          assigned_by: string
          billing_end_date: string | null
          billing_start_date: string
          created_at: string
          id: string
          monthly_fee: number
          property_id: string
          rent_percentage: number
          service_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_by: string
          billing_end_date?: string | null
          billing_start_date: string
          created_at?: string
          id?: string
          monthly_fee?: number
          property_id: string
          rent_percentage?: number
          service_id: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          billing_end_date?: string | null
          billing_start_date?: string
          created_at?: string
          id?: string
          monthly_fee?: number
          property_id?: string
          rent_percentage?: number
          service_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_service_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_service_assignments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      property_tours: {
        Row: {
          confirmation_sent: boolean | null
          created_at: string
          duration_minutes: number | null
          feedback: string | null
          follow_up_notes: string | null
          id: string
          lead_id: string | null
          listing_id: string | null
          property_id: string
          rating: number | null
          reminder_sent: boolean | null
          scheduled_by: string | null
          scheduled_date: string
          scheduled_time: string
          special_requests: string | null
          status: string | null
          tour_guide_id: string | null
          tour_type: string | null
          updated_at: string
          visitor_count: number | null
          visitor_email: string
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          confirmation_sent?: boolean | null
          created_at?: string
          duration_minutes?: number | null
          feedback?: string | null
          follow_up_notes?: string | null
          id?: string
          lead_id?: string | null
          listing_id?: string | null
          property_id: string
          rating?: number | null
          reminder_sent?: boolean | null
          scheduled_by?: string | null
          scheduled_date: string
          scheduled_time: string
          special_requests?: string | null
          status?: string | null
          tour_guide_id?: string | null
          tour_type?: string | null
          updated_at?: string
          visitor_count?: number | null
          visitor_email: string
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          confirmation_sent?: boolean | null
          created_at?: string
          duration_minutes?: number | null
          feedback?: string | null
          follow_up_notes?: string | null
          id?: string
          lead_id?: string | null
          listing_id?: string | null
          property_id?: string
          rating?: number | null
          reminder_sent?: boolean | null
          scheduled_by?: string | null
          scheduled_date?: string
          scheduled_time?: string
          special_requests?: string | null
          status?: string | null
          tour_guide_id?: string | null
          tour_type?: string | null
          updated_at?: string
          visitor_count?: number | null
          visitor_email?: string
          visitor_name?: string
          visitor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_tours_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_tours_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_tours_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_rolls: {
        Row: {
          amount_collected: number | null
          created_at: string
          due_date: string | null
          id: string
          late_fees: number | null
          month_year: string
          other_charges: number | null
          paid_date: string | null
          property_id: string
          rent_amount: number
          status: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          amount_collected?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          late_fees?: number | null
          month_year: string
          other_charges?: number | null
          paid_date?: string | null
          property_id: string
          rent_amount: number
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_collected?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          late_fees?: number | null
          month_year?: string
          other_charges?: number | null
          paid_date?: string | null
          property_id?: string
          rent_amount?: number
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rental_applications: {
        Row: {
          additional_occupants: Json | null
          applicant_email: string
          applicant_first_name: string
          applicant_last_name: string
          applicant_phone: string | null
          application_fee_amount: number | null
          application_fee_paid: boolean | null
          background_check_status: string | null
          created_at: string
          credit_check_status: string | null
          current_address: string | null
          date_of_birth: string | null
          desired_move_in_date: string | null
          documents: Json | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employer_name: string | null
          employment_status: string | null
          id: string
          lead_id: string | null
          listing_id: string | null
          monthly_income: number | null
          notes: string | null
          personal_references: Json | null
          pets: Json | null
          previous_landlord_name: string | null
          previous_landlord_phone: string | null
          property_id: string
          rental_history: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_security_number: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          additional_occupants?: Json | null
          applicant_email: string
          applicant_first_name: string
          applicant_last_name: string
          applicant_phone?: string | null
          application_fee_amount?: number | null
          application_fee_paid?: boolean | null
          background_check_status?: string | null
          created_at?: string
          credit_check_status?: string | null
          current_address?: string | null
          date_of_birth?: string | null
          desired_move_in_date?: string | null
          documents?: Json | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer_name?: string | null
          employment_status?: string | null
          id?: string
          lead_id?: string | null
          listing_id?: string | null
          monthly_income?: number | null
          notes?: string | null
          personal_references?: Json | null
          pets?: Json | null
          previous_landlord_name?: string | null
          previous_landlord_phone?: string | null
          property_id: string
          rental_history?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_security_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          additional_occupants?: Json | null
          applicant_email?: string
          applicant_first_name?: string
          applicant_last_name?: string
          applicant_phone?: string | null
          application_fee_amount?: number | null
          application_fee_paid?: boolean | null
          background_check_status?: string | null
          created_at?: string
          credit_check_status?: string | null
          current_address?: string | null
          date_of_birth?: string | null
          desired_move_in_date?: string | null
          documents?: Json | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer_name?: string | null
          employment_status?: string | null
          id?: string
          lead_id?: string | null
          listing_id?: string | null
          monthly_income?: number | null
          notes?: string | null
          personal_references?: Json | null
          pets?: Json | null
          previous_landlord_name?: string | null
          previous_landlord_phone?: string | null
          property_id?: string
          rental_history?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_security_number?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_applications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "property_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number
          billing_type: string
          category: string
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          name: string
          package_tier: string | null
          rent_percentage: number | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          base_price?: number
          billing_type?: string
          category: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          package_tier?: string | null
          rent_percentage?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          billing_type?: string
          category?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          package_tier?: string | null
          rent_percentage?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          cancelled_at: string | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          interval_type: string
          metadata: Json | null
          plan_type: string
          property_id: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          tenant_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          cancelled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval_type?: string
          metadata?: Json | null
          plan_type: string
          property_id?: string | null
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          tenant_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval_type?: string
          metadata?: Json | null
          plan_type?: string
          property_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          tenant_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
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
      user_inbox_settings: {
        Row: {
          auto_archive_days: number | null
          auto_respond_enabled: boolean | null
          auto_respond_message: string | null
          created_at: string
          id: string
          signature: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_archive_days?: number | null
          auto_respond_enabled?: boolean | null
          auto_respond_message?: string | null
          created_at?: string
          id?: string
          signature?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_archive_days?: number | null
          auto_respond_enabled?: boolean | null
          auto_respond_message?: string | null
          created_at?: string
          id?: string
          signature?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      vendor_invoices: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          line_items: Json | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          vendor_id: string
          work_order_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          line_items?: Json | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          vendor_id: string
          work_order_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          line_items?: Json | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_invoices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_invoices_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "vendor_work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_reviews: {
        Row: {
          comment: string | null
          communication_rating: number | null
          created_at: string | null
          id: string
          quality_rating: number | null
          rating: number
          reviewer_id: string
          timeliness_rating: number | null
          title: string | null
          updated_at: string | null
          vendor_id: string
          work_order_id: string | null
          would_recommend: boolean | null
        }
        Insert: {
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          quality_rating?: number | null
          rating: number
          reviewer_id: string
          timeliness_rating?: number | null
          title?: string | null
          updated_at?: string | null
          vendor_id: string
          work_order_id?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          id?: string
          quality_rating?: number | null
          rating?: number
          reviewer_id?: string
          timeliness_rating?: number | null
          title?: string | null
          updated_at?: string | null
          vendor_id?: string
          work_order_id?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_reviews_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "vendor_work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_work_orders: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          assigned_at: string | null
          assigned_by: string | null
          category: string
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          estimated_hours: number | null
          id: string
          labor_cost: number | null
          maintenance_request_id: string | null
          materials_cost: number | null
          notes: string | null
          priority: string | null
          property_id: string | null
          scheduled_date: string | null
          started_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_at?: string | null
          assigned_by?: string | null
          category: string
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          labor_cost?: number | null
          maintenance_request_id?: string | null
          materials_cost?: number | null
          notes?: string | null
          priority?: string | null
          property_id?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          assigned_at?: string | null
          assigned_by?: string | null
          category?: string
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          labor_cost?: number | null
          maintenance_request_id?: string | null
          materials_cost?: number | null
          notes?: string | null
          priority?: string | null
          property_id?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_work_orders_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_work_orders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_work_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          availability_status: string | null
          average_response_time_hours: number | null
          business_name: string
          category: string
          city: string | null
          completed_jobs: number | null
          contact_name: string
          created_at: string | null
          email: string
          hourly_rate: number | null
          id: string
          insurance_expiry: string | null
          is_active: boolean | null
          joined_date: string | null
          last_active_at: string | null
          license_number: string | null
          notes: string | null
          phone: string
          rating: number | null
          service_areas: Json | null
          specialties: Json | null
          state: string | null
          total_jobs: number | null
          updated_at: string | null
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          availability_status?: string | null
          average_response_time_hours?: number | null
          business_name: string
          category: string
          city?: string | null
          completed_jobs?: number | null
          contact_name: string
          created_at?: string | null
          email: string
          hourly_rate?: number | null
          id?: string
          insurance_expiry?: string | null
          is_active?: boolean | null
          joined_date?: string | null
          last_active_at?: string | null
          license_number?: string | null
          notes?: string | null
          phone: string
          rating?: number | null
          service_areas?: Json | null
          specialties?: Json | null
          state?: string | null
          total_jobs?: number | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          availability_status?: string | null
          average_response_time_hours?: number | null
          business_name?: string
          category?: string
          city?: string | null
          completed_jobs?: number | null
          contact_name?: string
          created_at?: string | null
          email?: string
          hourly_rate?: number | null
          id?: string
          insurance_expiry?: string | null
          is_active?: boolean | null
          joined_date?: string | null
          last_active_at?: string | null
          license_number?: string | null
          notes?: string | null
          phone?: string
          rating?: number | null
          service_areas?: Json | null
          specialties?: Json | null
          state?: string | null
          total_jobs?: number | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      force_make_me_admin: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      log_message_analytics: {
        Args: {
          conv_id: string
          msg_id: string
          event_type: string
          user_id?: string
          metadata?: Json
        }
        Returns: undefined
      }
      make_me_admin: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      search_messages: {
        Args: {
          search_query: string
          user_id_param: string
          conversation_id_param?: string
          limit_param?: number
          offset_param?: number
        }
        Returns: {
          message_id: string
          conversation_id: string
          content: string
          sender_id: string
          created_at: string
          rank: number
        }[]
      }
      seed_test_users: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      user_can_access_conversation: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      user_created_conversation: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      validate_conversation_participants: {
        Args: {
          conversation_id_param: string
          sender_id_param: string
          recipient_ids_param: string[]
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
