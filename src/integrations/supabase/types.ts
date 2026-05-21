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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attestations: {
        Row: {
          aptos_tx_hash: string | null
          blob_id: string
          created_at: string
          fee_amount: number | null
          fee_asset: string | null
          fee_message: string | null
          fee_signature: string | null
          fee_status: string | null
          fee_tx_hash: string | null
          id: string
          message: string
          public_key: string
          signature: string
          status: string
          unverified_reason: string | null
          uploader: string
        }
        Insert: {
          aptos_tx_hash?: string | null
          blob_id: string
          created_at?: string
          fee_amount?: number | null
          fee_asset?: string | null
          fee_message?: string | null
          fee_signature?: string | null
          fee_status?: string | null
          fee_tx_hash?: string | null
          id?: string
          message: string
          public_key: string
          signature: string
          status?: string
          unverified_reason?: string | null
          uploader: string
        }
        Update: {
          aptos_tx_hash?: string | null
          blob_id?: string
          created_at?: string
          fee_amount?: number | null
          fee_asset?: string | null
          fee_message?: string | null
          fee_signature?: string | null
          fee_status?: string | null
          fee_tx_hash?: string | null
          id?: string
          message?: string
          public_key?: string
          signature?: string
          status?: string
          unverified_reason?: string | null
          uploader?: string
        }
        Relationships: [
          {
            foreignKeyName: "attestations_blob_id_fkey"
            columns: ["blob_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["blob_id"]
          },
        ]
      }
      datasets: {
        Row: {
          blob_id: string
          created_at: string
          file_name: string
          id: string
          license: string | null
          mime_type: string
          size_bytes: number
          storage_path: string
          uploader: string
        }
        Insert: {
          blob_id: string
          created_at?: string
          file_name: string
          id?: string
          license?: string | null
          mime_type: string
          size_bytes: number
          storage_path: string
          uploader: string
        }
        Update: {
          blob_id?: string
          created_at?: string
          file_name?: string
          id?: string
          license?: string | null
          mime_type?: string
          size_bytes?: number
          storage_path?: string
          uploader?: string
        }
        Relationships: [
          {
            foreignKeyName: "datasets_uploader_fkey"
            columns: ["uploader"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["address"]
          },
        ]
      }
      dev_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          owner: string
          revoked_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          owner: string
          revoked_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          owner?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dev_keys_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["address"]
          },
        ]
      }
      lineage: {
        Row: {
          child_blob_id: string
          created_at: string
          id: string
          parent_blob_id: string
        }
        Insert: {
          child_blob_id: string
          created_at?: string
          id?: string
          parent_blob_id: string
        }
        Update: {
          child_blob_id?: string
          created_at?: string
          id?: string
          parent_blob_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lineage_child_blob_id_fkey"
            columns: ["child_blob_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["blob_id"]
          },
          {
            foreignKeyName: "lineage_parent_blob_id_fkey"
            columns: ["parent_blob_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["blob_id"]
          },
        ]
      }
      ticker_events: {
        Row: {
          blob_id: string
          created_at: string
          event_type: string
          id: number
          uploader: string
        }
        Insert: {
          blob_id: string
          created_at?: string
          event_type?: string
          id?: number
          uploader: string
        }
        Update: {
          blob_id?: string
          created_at?: string
          event_type?: string
          id?: number
          uploader?: string
        }
        Relationships: []
      }
      verified_models: {
        Row: {
          created_at: string
          description: string | null
          developer: string
          id: string
          name: string
          training_corpus_blob_id: string | null
          weights_blob_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          developer: string
          id?: string
          name: string
          training_corpus_blob_id?: string | null
          weights_blob_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          developer?: string
          id?: string
          name?: string
          training_corpus_blob_id?: string | null
          weights_blob_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verified_models_developer_fkey"
            columns: ["developer"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["address"]
          },
          {
            foreignKeyName: "verified_models_training_corpus_blob_id_fkey"
            columns: ["training_corpus_blob_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["blob_id"]
          },
          {
            foreignKeyName: "verified_models_weights_blob_id_fkey"
            columns: ["weights_blob_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["blob_id"]
          },
        ]
      }
      wallets: {
        Row: {
          address: string
          display_name: string | null
          first_seen_at: string
          last_seen_at: string
        }
        Insert: {
          address: string
          display_name?: string | null
          first_seen_at?: string
          last_seen_at?: string
        }
        Update: {
          address?: string
          display_name?: string | null
          first_seen_at?: string
          last_seen_at?: string
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
