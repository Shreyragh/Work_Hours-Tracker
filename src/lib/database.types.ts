export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          calendar_token: string | null
          created_at: string
          currency: string | null
          default_wage: number | null
          first_name: string | null
          id: number
          last_name: string | null
          monthly_email: boolean | null
          onboarding_completed: boolean | null
          reminders: boolean | null
          time_format: string | null
          updated_at: string
          user_id: string | null
          weekly_email: boolean | null
          work_week: string | null
        }
        Insert: {
          calendar_token?: string | null
          created_at?: string
          currency?: string | null
          default_wage?: number | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          monthly_email?: boolean | null
          onboarding_completed?: boolean | null
          reminders?: boolean | null
          time_format?: string | null
          updated_at?: string
          user_id?: string | null
          weekly_email?: boolean | null
          work_week?: string | null
        }
        Update: {
          calendar_token?: string | null
          created_at?: string
          currency?: string | null
          default_wage?: number | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          monthly_email?: boolean | null
          onboarding_completed?: boolean | null
          reminders?: boolean | null
          time_format?: string | null
          updated_at?: string
          user_id?: string | null
          weekly_email?: boolean | null
          work_week?: string | null
        }
        Relationships: []
      }
      clock_sessions: {
        Row: {
          id: number
          user_id: string
          clock_in_time: string
          clock_out_time: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: number
          user_id: string
          clock_in_time: string
          clock_out_time?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: number
          user_id?: string
          clock_in_time?: string
          clock_out_time?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: []
      }
      work_logs: {
        Row: {
          created_at: string
          custom_rate: number | null
          date: string | null
          default_rate: boolean | null
          end_time: string | null
          id: number
          notes: string | null
          paid: boolean
          start_time: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom_rate?: number | null
          date?: string | null
          default_rate?: boolean | null
          end_time?: string | null
          id?: number
          notes?: string | null
          paid?: boolean
          start_time?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom_rate?: number | null
          date?: string | null
          default_rate?: boolean | null
          end_time?: string | null
          id?: number
          notes?: string | null
          paid?: boolean
          start_time?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_organization_admin: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
      is_organization_owner: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      organization_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
