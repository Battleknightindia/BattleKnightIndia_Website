export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      players: {
        Row: {
          city: string | null
          created_at: string | null
          device: string | null
          email: string | null
          game_id: string | null
          id: string
          ign: string
          mobile: string | null
          name: string
          picture_url: string | null
          profile_id: string | null
          role: string
          server_id: string | null
          state: string | null
          student_id_url: string | null
          team_id: string | null
          university_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          device?: string | null
          email?: string | null
          game_id?: string | null
          id?: string
          ign: string
          mobile?: string | null
          name: string
          picture_url?: string | null
          profile_id?: string | null
          role: string
          server_id?: string | null
          state?: string | null
          student_id_url?: string | null
          team_id?: string | null
          university_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          device?: string | null
          email?: string | null
          game_id?: string | null
          id?: string
          ign?: string
          mobile?: string | null
          name?: string
          picture_url?: string | null
          profile_id?: string | null
          role?: string
          server_id?: string | null
          state?: string | null
          student_id_url?: string | null
          team_id?: string | null
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string
          fullName: string
          game_id: string
          ign: string
          is_volunteer: boolean
          phone: string | null
          roles: string
          server_id: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          email: string
          fullName: string
          game_id: string
          ign: string
          is_volunteer?: boolean
          phone?: string | null
          roles: string
          server_id: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          email?: string
          fullName?: string
          game_id?: string
          ign?: string
          is_volunteer?: boolean
          phone?: string | null
          roles?: string
          server_id?: string
          user_id?: string
        }
        Relationships: []
      }
      registration: {
        Row: {
          confirmed_at: string | null
          error_message: string | null
          id: string
          status: string
          submitted_at: string | null
          team_id: string | null
        }
        Insert: {
          confirmed_at?: string | null
          error_message?: string | null
          id?: string
          status: string
          submitted_at?: string | null
          team_id?: string | null
        }
        Update: {
          confirmed_at?: string | null
          error_message?: string | null
          id?: string
          status?: string
          submitted_at?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_images: {
        Row: {
          id: string
          image_url: string
          registration_id: string | null
          type: string
          uploaded_at: string | null
        }
        Insert: {
          id?: string
          image_url: string
          registration_id?: string | null
          type: string
          uploaded_at?: string | null
        }
        Update: {
          id?: string
          image_url?: string
          registration_id?: string | null
          type?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_images_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registration"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          university_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          university_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_player_profile: {
        Args: { p_player_id: string }
        Returns: boolean
      }
      check_user_profile: {
        Args: { p_user_id: string; p_table: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
