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
      candidate_profiles: {
        Row: {
          additional_requirements: Json | null
          created_at: string
          id: string
          profile_name: string
          requirements: Json
          source_data: Json
          source_type: string
          updated_at: string
          user_modifications: Json | null
        }
        Insert: {
          additional_requirements?: Json | null
          created_at?: string
          id?: string
          profile_name: string
          requirements: Json
          source_data: Json
          source_type: string
          updated_at?: string
          user_modifications?: Json | null
        }
        Update: {
          additional_requirements?: Json | null
          created_at?: string
          id?: string
          profile_name?: string
          requirements?: Json
          source_data?: Json
          source_type?: string
          updated_at?: string
          user_modifications?: Json | null
        }
        Relationships: []
      }
      cv_client_base: {
        Row: {
          client_status: boolean | null
          created_at: string
          gd_folder: string | null
          id: string
          tg_id: number | null
          tg_name: string | null
          vector_store_id: string | null
          vector_store_name: string | null
        }
        Insert: {
          client_status?: boolean | null
          created_at?: string
          gd_folder?: string | null
          id?: string
          tg_id?: number | null
          tg_name?: string | null
          vector_store_id?: string | null
          vector_store_name?: string | null
        }
        Update: {
          client_status?: boolean | null
          created_at?: string
          gd_folder?: string | null
          id?: string
          tg_id?: number | null
          tg_name?: string | null
          vector_store_id?: string | null
          vector_store_name?: string | null
        }
        Relationships: []
      }
      cvlist: {
        Row: {
          created_at: string
          file_id: string | null
          file_name: string | null
          id: string
          isvectorized: boolean | null
        }
        Insert: {
          created_at?: string
          file_id?: string | null
          file_name?: string | null
          id?: string
          isvectorized?: boolean | null
        }
        Update: {
          created_at?: string
          file_id?: string | null
          file_name?: string | null
          id?: string
          isvectorized?: boolean | null
        }
        Relationships: []
      }
      incom_actual_vacancyes: {
        Row: {
          created_at: string
          id: number
          lead_comment: string | null
          lead_count: number
          lead_dept: string
          lead_end_date: string | null
          lead_id: number
          lead_post: string
          lead_status: string
          lead_sum: number
          lead_target_date: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          lead_comment?: string | null
          lead_count: number
          lead_dept: string
          lead_end_date?: string | null
          lead_id: number
          lead_post: string
          lead_status: string
          lead_sum: number
          lead_target_date?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          lead_comment?: string | null
          lead_count?: number
          lead_dept?: string
          lead_end_date?: string | null
          lead_id?: number
          lead_post?: string
          lead_status?: string
          lead_sum?: number
          lead_target_date?: number | null
        }
        Relationships: []
      }
      inkom_leads_from_bot: {
        Row: {
          amo_contact_id: number | null
          amo_leads_id: number | null
          amo_note_id: number | null
          chat_id: number
          conversation_history: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          language_code: string | null
          last_name: string | null
          phone: string | null
          profession: string | null
          source: string | null
          tg_first_name: string | null
          tg_last_name: string | null
          tg_phone: string | null
          tg_username: string | null
          time_lost_message: string | null
        }
        Insert: {
          amo_contact_id?: number | null
          amo_leads_id?: number | null
          amo_note_id?: number | null
          chat_id: number
          conversation_history?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          language_code?: string | null
          last_name?: string | null
          phone?: string | null
          profession?: string | null
          source?: string | null
          tg_first_name?: string | null
          tg_last_name?: string | null
          tg_phone?: string | null
          tg_username?: string | null
          time_lost_message?: string | null
        }
        Update: {
          amo_contact_id?: number | null
          amo_leads_id?: number | null
          amo_note_id?: number | null
          chat_id?: number
          conversation_history?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          language_code?: string | null
          last_name?: string | null
          phone?: string | null
          profession?: string | null
          source?: string | null
          tg_first_name?: string | null
          tg_last_name?: string | null
          tg_phone?: string | null
          tg_username?: string | null
          time_lost_message?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_vectors: {
        Row: {
          embedding: string | null
          id: string
          metadata: Json | null
          text: string | null
        }
        Insert: {
          embedding?: string | null
          id?: string
          metadata?: Json | null
          text?: string | null
        }
        Update: {
          embedding?: string | null
          id?: string
          metadata?: Json | null
          text?: string | null
        }
        Relationships: []
      }
      resume_analysis: {
        Row: {
          analysis_result: Json
          created_at: string
          id: string
          match_score: number
          profile_id: string | null
          recommendations: string[] | null
          resume_data: Json
          resume_source: string
          strengths: string[] | null
          weaknesses: string[] | null
        }
        Insert: {
          analysis_result: Json
          created_at?: string
          id?: string
          match_score: number
          profile_id?: string | null
          recommendations?: string[] | null
          resume_data: Json
          resume_source: string
          strengths?: string[] | null
          weaknesses?: string[] | null
        }
        Update: {
          analysis_result?: Json
          created_at?: string
          id?: string
          match_score?: number
          profile_id?: string | null
          recommendations?: string[] | null
          resume_data?: Json
          resume_source?: string
          strengths?: string[] | null
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_analysis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transcriptions: {
        Row: {
          audio_id: string | null
          created_at: string
          goal_achieved: boolean
          id: string
          source: string | null
          steno: string
          summary_full: string
          summary_short: string
          title: string
          updated_at: string
        }
        Insert: {
          audio_id?: string | null
          created_at?: string
          goal_achieved: boolean
          id?: string
          source?: string | null
          steno: string
          summary_full: string
          summary_short: string
          title: string
          updated_at?: string
        }
        Update: {
          audio_id?: string | null
          created_at?: string
          goal_achieved?: boolean
          id?: string
          source?: string | null
          steno?: string
          summary_full?: string
          summary_short?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { filter: Json; match_count: number; query_embedding: string }
        Returns: {
          id: number
          title: string
          content: string
          url: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
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
