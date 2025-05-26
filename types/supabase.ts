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
      cosplay_gallery: {
        Row: {
          id: number
          image: string | null
        }
        Insert: {
          id: number
          image?: string | null
        }
        Update: {
          id?: number
          image?: string | null
        }
        Relationships: []
      }
      event_carousel: {
        Row: {
          aspectRatio: string | null
          date: string | null
          description: string | null
          id: number
          src: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          aspectRatio?: string | null
          date?: string | null
          description?: string | null
          id: number
          src?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          aspectRatio?: string | null
          date?: string | null
          description?: string | null
          id?: number
          src?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      featured_event: {
        Row: {
          bannerImage: string | null
          date: string | null
          description: string | null
          id: number
          images: string | null
          location: string | null
          prizePool: string | null
          teamCount: string | null
          ticketsUrl: string | null
          title: string | null
          watchUrl: string | null
        }
        Insert: {
          bannerImage?: string | null
          date?: string | null
          description?: string | null
          id?: number
          images?: string | null
          location?: string | null
          prizePool?: string | null
          teamCount?: string | null
          ticketsUrl?: string | null
          title?: string | null
          watchUrl?: string | null
        }
        Update: {
          bannerImage?: string | null
          date?: string | null
          description?: string | null
          id?: number
          images?: string | null
          location?: string | null
          prizePool?: string | null
          teamCount?: string | null
          ticketsUrl?: string | null
          title?: string | null
          watchUrl?: string | null
        }
        Relationships: []
      }
      northeast_cup: {
        Row: {
          description: string | null
          id: number
          image: string | null
          statColors: Json | null
          stats: Json | null
          title: string | null
        }
        Insert: {
          description?: string | null
          id?: number
          image?: string | null
          statColors?: Json | null
          stats?: Json | null
          title?: string | null
        }
        Update: {
          description?: string | null
          id?: number
          image?: string | null
          statColors?: Json | null
          stats?: Json | null
          title?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          city: string | null
          device: string | null
          email: string | null
          game_id: string
          id: string
          ign: string | null
          mobile: string | null
          name: string | null
          role: string
          server_id: string | null
          state: string | null
          student_id_url: string | null
          team_id: string
          university_id: string
        }
        Insert: {
          city?: string | null
          device?: string | null
          email?: string | null
          game_id: string
          id?: string
          ign?: string | null
          mobile?: string | null
          name?: string | null
          role: string
          server_id?: string | null
          state?: string | null
          student_id_url?: string | null
          team_id: string
          university_id: string
        }
        Update: {
          city?: string | null
          device?: string | null
          email?: string | null
          game_id?: string
          id?: string
          ign?: string | null
          mobile?: string | null
          name?: string | null
          role?: string
          server_id?: string | null
          state?: string | null
          student_id_url?: string | null
          team_id?: string
          university_id?: string
        }
        Relationships: [
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
          city: string | null
          fullName: string
          game_id: string
          ign: string
          is_volunteer: boolean
          roles: string[] | null
          server_id: string
          state: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          fullName: string
          game_id: string
          ign: string
          is_volunteer?: boolean
          roles?: string[] | null
          server_id: string
          state?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          fullName?: string
          game_id?: string
          ign?: string
          is_volunteer?: boolean
          roles?: string[] | null
          server_id?: string
          state?: string | null
          user_id?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          referral_code: string | null
          team_status: string | null
          university_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          referral_code?: string | null
          team_status?: string | null
          university_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          referral_code?: string | null
          team_status?: string | null
          university_id?: string | null
          user_id?: string | null
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
      tournaments: {
        Row: {
          champions: string | null
          champions_logo: string | null
          description: string | null
          enddate: string | null
          id: string
          image: string | null
          livestreamlink: string | null
          name: string
          prizemoney: string | null
          registration_end_date: string | null
          registration_start_date: string | null
          registrationlink: string | null
          startdate: string | null
          status: string | null
          teamslots: number | null
          total_participants: string | null
          video: string | null
        }
        Insert: {
          champions?: string | null
          champions_logo?: string | null
          description?: string | null
          enddate?: string | null
          id?: string
          image?: string | null
          livestreamlink?: string | null
          name: string
          prizemoney?: string | null
          registration_end_date?: string | null
          registration_start_date?: string | null
          registrationlink?: string | null
          startdate?: string | null
          status?: string | null
          teamslots?: number | null
          total_participants?: string | null
          video?: string | null
        }
        Update: {
          champions?: string | null
          champions_logo?: string | null
          description?: string | null
          enddate?: string | null
          id?: string
          image?: string | null
          livestreamlink?: string | null
          name?: string
          prizemoney?: string | null
          registration_end_date?: string | null
          registration_start_date?: string | null
          registrationlink?: string | null
          startdate?: string | null
          status?: string | null
          teamslots?: number | null
          total_participants?: string | null
          video?: string | null
        }
        Relationships: []
      }
      universities: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          state: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          state?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          state?: string | null
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          approved_teams: string | null
          email: string
          joined_at: string
          phone: string | null
          profile_id: string
          referral_code: string
          reward_points: string | null
          teams_referred: string | null
          total_teams: string | null
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          approved_teams?: string | null
          email: string
          joined_at?: string
          phone?: string | null
          profile_id: string
          referral_code?: string
          reward_points?: string | null
          teams_referred?: string | null
          total_teams?: string | null
          updated_at?: string
          volunteer_id?: string
        }
        Update: {
          approved_teams?: string | null
          email?: string
          joined_at?: string
          phone?: string | null
          profile_id?: string
          referral_code?: string
          reward_points?: string | null
          teams_referred?: string | null
          total_teams?: string | null
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
