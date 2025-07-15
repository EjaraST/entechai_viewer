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
      call_analysis: {
        Row: {
          active_listening_comment: string | null
          active_listening_score: number | null
          answer_completeness_comment: string | null
          answer_completeness_score: number | null
          audio_url: string | null
          burnout_signs: string | null
          call_goal: string | null
          client_nps_category: string | null
          closing_correct: boolean | null
          communication_issues: string | null
          conflict_moments: string | null
          conflict_risk_level: string | null
          conversation_duration_total: string | null
          conversation_stage_closing: string | null
          conversation_stage_greeting: string | null
          conversation_stage_request: string | null
          conversation_stage_solution: string | null
          date_created: string | null
          date_updated: string | null
          final_conclusion: string | null
          goal_achieved: boolean | null
          greeting_correct: boolean | null
          id: string
          operator_said_name: boolean | null
          operator_strength: string | null
          operator_thanked: boolean | null
          operator_tonality: string | null
          operator_weakness: string | null
          overall_score: number | null
          transcript: string | null
        }
        Insert: {
          active_listening_comment?: string | null
          active_listening_score?: number | null
          answer_completeness_comment?: string | null
          answer_completeness_score?: number | null
          audio_url?: string | null
          burnout_signs?: string | null
          call_goal?: string | null
          client_nps_category?: string | null
          closing_correct?: boolean | null
          communication_issues?: string | null
          conflict_moments?: string | null
          conflict_risk_level?: string | null
          conversation_duration_total?: string | null
          conversation_stage_closing?: string | null
          conversation_stage_greeting?: string | null
          conversation_stage_request?: string | null
          conversation_stage_solution?: string | null
          date_created?: string | null
          date_updated?: string | null
          final_conclusion?: string | null
          goal_achieved?: boolean | null
          greeting_correct?: boolean | null
          id?: string
          operator_said_name?: boolean | null
          operator_strength?: string | null
          operator_thanked?: boolean | null
          operator_tonality?: string | null
          operator_weakness?: string | null
          overall_score?: number | null
          transcript?: string | null
        }
        Update: {
          active_listening_comment?: string | null
          active_listening_score?: number | null
          answer_completeness_comment?: string | null
          answer_completeness_score?: number | null
          audio_url?: string | null
          burnout_signs?: string | null
          call_goal?: string | null
          client_nps_category?: string | null
          closing_correct?: boolean | null
          communication_issues?: string | null
          conflict_moments?: string | null
          conflict_risk_level?: string | null
          conversation_duration_total?: string | null
          conversation_stage_closing?: string | null
          conversation_stage_greeting?: string | null
          conversation_stage_request?: string | null
          conversation_stage_solution?: string | null
          date_created?: string | null
          date_updated?: string | null
          final_conclusion?: string | null
          goal_achieved?: boolean | null
          greeting_correct?: boolean | null
          id?: string
          operator_said_name?: boolean | null
          operator_strength?: string | null
          operator_thanked?: boolean | null
          operator_tonality?: string | null
          operator_weakness?: string | null
          overall_score?: number | null
          transcript?: string | null
        }
        Relationships: []
      }
      sales_calls_analysis: {
        Row: {
          audio_url: string | null
          call_date: string | null
          client_tonality: string | null
          construction_count: number | null
          date_created: string | null
          date_updated: string | null
          desired_installation_time: string | null
          emotion_score: number | null
          id: string
          is_measuring_appointment: boolean | null
          lead_temperature: string | null
          manager_name: string | null
          measure_score: number | null
          next_contact_date: string | null
          next_contact_method: string | null
          object_score: number | null
          object_type: string | null
          special_requirements: string | null
          summary_text: string | null
          timing_score: number | null
          total_score: number | null
          transcript: string | null
          volume_score: number | null
        }
        Insert: {
          audio_url?: string | null
          call_date?: string | null
          client_tonality?: string | null
          construction_count?: number | null
          date_created?: string | null
          date_updated?: string | null
          desired_installation_time?: string | null
          emotion_score?: number | null
          id?: string
          is_measuring_appointment?: boolean | null
          lead_temperature?: string | null
          manager_name?: string | null
          measure_score?: number | null
          next_contact_date?: string | null
          next_contact_method?: string | null
          object_score?: number | null
          object_type?: string | null
          special_requirements?: string | null
          summary_text?: string | null
          timing_score?: number | null
          total_score?: number | null
          transcript?: string | null
          volume_score?: number | null
        }
        Update: {
          audio_url?: string | null
          call_date?: string | null
          client_tonality?: string | null
          construction_count?: number | null
          date_created?: string | null
          date_updated?: string | null
          desired_installation_time?: string | null
          emotion_score?: number | null
          id?: string
          is_measuring_appointment?: boolean | null
          lead_temperature?: string | null
          manager_name?: string | null
          measure_score?: number | null
          next_contact_date?: string | null
          next_contact_method?: string | null
          object_score?: number | null
          object_type?: string | null
          special_requirements?: string | null
          summary_text?: string | null
          timing_score?: number | null
          total_score?: number | null
          transcript?: string | null
          volume_score?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
