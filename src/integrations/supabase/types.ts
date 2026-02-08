export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_audit_log: {
        Row: {
          attempted_email: string | null
          created_at: string
          details: Json | null
          device_fingerprint: string | null
          event_type: string
          id: string
          investor_id: string | null
          ip_address: string | null
          original_email: string | null
          token_id: string | null
          user_agent: string | null
        }
        Insert: {
          attempted_email?: string | null
          created_at?: string
          details?: Json | null
          device_fingerprint?: string | null
          event_type: string
          id?: string
          investor_id?: string | null
          ip_address?: string | null
          original_email?: string | null
          token_id?: string | null
          user_agent?: string | null
        }
        Update: {
          attempted_email?: string | null
          created_at?: string
          details?: Json | null
          device_fingerprint?: string | null
          event_type?: string
          id?: string
          investor_id?: string | null
          ip_address?: string | null
          original_email?: string | null
          token_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_audit_log_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_audit_log_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "access_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      access_tokens: {
        Row: {
          access_count: number
          created_at: string
          device_fingerprint: string | null
          expires_at: string
          first_accessed_at: string | null
          id: string
          investor_id: string
          ip_address: string | null
          is_revoked: boolean
          last_accessed_at: string | null
          token: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          access_count?: number
          created_at?: string
          device_fingerprint?: string | null
          expires_at: string
          first_accessed_at?: string | null
          id?: string
          investor_id: string
          ip_address?: string | null
          is_revoked?: boolean
          last_accessed_at?: string | null
          token: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          access_count?: number
          created_at?: string
          device_fingerprint?: string | null
          expires_at?: string
          first_accessed_at?: string | null
          id?: string
          investor_id?: string
          ip_address?: string | null
          is_revoked?: boolean
          last_accessed_at?: string | null
          token?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_tokens_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      google_sheets_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_synced_at: string | null
          sheet_id: string
          sheet_name: string | null
          sheet_url: string
          sync_error: string | null
          sync_status: string | null
          total_contacts_synced: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          sheet_id: string
          sheet_name?: string | null
          sheet_url: string
          sync_error?: string | null
          sync_status?: string | null
          total_contacts_synced?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          sheet_id?: string
          sheet_name?: string | null
          sheet_url?: string
          sync_error?: string | null
          sync_status?: string | null
          total_contacts_synced?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      investor_registrations: {
        Row: {
          access_token_id: string | null
          approval_source: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          company_domain: string | null
          company_name: string | null
          created_at: string
          email: string
          email_reputation_score: number | null
          email_verified: boolean
          full_name: string
          id: string
          investment_capacity: Database["public"]["Enums"]["investment_capacity"]
          investor_type: Database["public"]["Enums"]["investor_type"]
          is_disposable_email: boolean | null
          last_login_at: string | null
          nda_accepted_at: string
          nda_document_url: string | null
          phone_number: string | null
          referral_source: string | null
          rejection_reason: string | null
          updated_at: string
          verification_token: string | null
          verification_token_expires_at: string | null
        }
        Insert: {
          access_token_id?: string | null
          approval_source?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          company_domain?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          email_reputation_score?: number | null
          email_verified?: boolean
          full_name: string
          id?: string
          investment_capacity: Database["public"]["Enums"]["investment_capacity"]
          investor_type: Database["public"]["Enums"]["investor_type"]
          is_disposable_email?: boolean | null
          last_login_at?: string | null
          nda_accepted_at?: string
          nda_document_url?: string | null
          phone_number?: string | null
          referral_source?: string | null
          rejection_reason?: string | null
          updated_at?: string
          verification_token?: string | null
          verification_token_expires_at?: string | null
        }
        Update: {
          access_token_id?: string | null
          approval_source?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          company_domain?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          email_reputation_score?: number | null
          email_verified?: boolean
          full_name?: string
          id?: string
          investment_capacity?: Database["public"]["Enums"]["investment_capacity"]
          investor_type?: Database["public"]["Enums"]["investor_type"]
          is_disposable_email?: boolean | null
          last_login_at?: string | null
          nda_accepted_at?: string
          nda_document_url?: string | null
          phone_number?: string | null
          referral_source?: string | null
          rejection_reason?: string | null
          updated_at?: string
          verification_token?: string | null
          verification_token_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_access_token"
            columns: ["access_token_id"]
            isOneToOne: false
            referencedRelation: "access_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_approved_contacts: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          notes: string | null
          phone: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_investor: { Args: { _email: string }; Returns: boolean }
      update_investor_last_login: {
        Args: { _email: string }
        Returns: undefined
      }
      validate_access_token: {
        Args: {
          current_fingerprint?: string
          current_ip?: string
          current_user_agent?: string
          token_str: string
        }
        Returns: {
          device_match: boolean
          error_message: string
          investor_id: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      approval_status: "pending" | "approved" | "rejected"
      investment_capacity:
        | "under_5m"
        | "5m_to_10m"
        | "10m_to_25m"
        | "25m_to_50m"
        | "over_50m"
      investor_type:
        | "family_office"
        | "institutional"
        | "private_investor"
        | "operator"
        | "other"
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
      app_role: ["admin", "user"],
      approval_status: ["pending", "approved", "rejected"],
      investment_capacity: [
        "under_5m",
        "5m_to_10m",
        "10m_to_25m",
        "25m_to_50m",
        "over_50m",
      ],
      investor_type: [
        "family_office",
        "institutional",
        "private_investor",
        "operator",
        "other",
      ],
    },
  },
} as const
