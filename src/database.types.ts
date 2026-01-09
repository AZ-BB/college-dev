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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      communities: {
        Row: {
          about: string | null
          amount_one_time: number | null
          amount_per_month: number | null
          amount_per_year: number | null
          audience_size: Database["public"]["Enums"]["audience_size_enum"]
          avatar: string | null
          billing_cycle:
            | Database["public"]["Enums"]["community_billing_cycle_enum"]
            | null
          cover_image: string | null
          created_at: string
          created_by: string
          description: string
          free_trial: boolean
          id: number
          is_active: boolean
          is_deleted: boolean
          is_free: boolean
          is_public: boolean
          member_count: number
          name: string
          price: number
          pricing: Database["public"]["Enums"]["community_pricing_enum"]
          slug: string
          support_email: string | null
          updated_at: string
        }
        Insert: {
          about?: string | null
          amount_one_time?: number | null
          amount_per_month?: number | null
          amount_per_year?: number | null
          audience_size?: Database["public"]["Enums"]["audience_size_enum"]
          avatar?: string | null
          billing_cycle?:
            | Database["public"]["Enums"]["community_billing_cycle_enum"]
            | null
          cover_image?: string | null
          created_at?: string
          created_by: string
          description: string
          free_trial?: boolean
          id?: number
          is_active?: boolean
          is_deleted?: boolean
          is_free?: boolean
          is_public?: boolean
          member_count?: number
          name: string
          price?: number
          pricing?: Database["public"]["Enums"]["community_pricing_enum"]
          slug: string
          support_email?: string | null
          updated_at?: string
        }
        Update: {
          about?: string | null
          amount_one_time?: number | null
          amount_per_month?: number | null
          amount_per_year?: number | null
          audience_size?: Database["public"]["Enums"]["audience_size_enum"]
          avatar?: string | null
          billing_cycle?:
            | Database["public"]["Enums"]["community_billing_cycle_enum"]
            | null
          cover_image?: string | null
          created_at?: string
          created_by?: string
          description?: string
          free_trial?: boolean
          id?: number
          is_active?: boolean
          is_deleted?: boolean
          is_free?: boolean
          is_public?: boolean
          member_count?: number
          name?: string
          price?: number
          pricing?: Database["public"]["Enums"]["community_pricing_enum"]
          slug?: string
          support_email?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_cta_links: {
        Row: {
          community_id: number
          created_at: string
          id: number
          text: string
          updated_at: string
          url: string
        }
        Insert: {
          community_id: number
          created_at?: string
          id?: number
          text: string
          updated_at?: string
          url: string
        }
        Update: {
          community_id?: number
          created_at?: string
          id?: number
          text?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_cta_links_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_gallery_media: {
        Row: {
          community_id: number
          created_at: string
          id: number
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          community_id: number
          created_at?: string
          id?: number
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          community_id?: number
          created_at?: string
          id?: number
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_gallery_media_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: number
          id: number
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          member_status: Database["public"]["Enums"]["community_member_status_enum"]
          role: Database["public"]["Enums"]["community_role_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          community_id: number
          id?: number
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          member_status?: Database["public"]["Enums"]["community_member_status_enum"]
          role?: Database["public"]["Enums"]["community_role_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          community_id?: number
          id?: number
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          member_status?: Database["public"]["Enums"]["community_member_status_enum"]
          role?: Database["public"]["Enums"]["community_role_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_categories: {
        Row: {
          community_id: number
          created_at: string
          description: string | null
          icon: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          community_id: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          community_id?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_categories_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_text_blocks: {
        Row: {
          community_id: number
          created_at: string
          description: string
          id: number
          index: number
          title: string
          updated_at: string
        }
        Insert: {
          community_id: number
          created_at?: string
          description: string
          id?: number
          index: number
          title: string
          updated_at?: string
        }
        Update: {
          community_id?: number
          created_at?: string
          description?: string
          id?: number
          index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_text_blocks_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          category_id: number | null
          comments_count: number
          community_id: number
          content: string
          created_at: string
          id: number
          likes_count: number
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category_id?: number | null
          comments_count?: number
          community_id: number
          content: string
          created_at?: string
          id?: number
          likes_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category_id?: number | null
          comments_count?: number
          community_id?: number
          content?: string
          created_at?: string
          id?: number
          likes_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_post_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          comments_count: number
          contributions_count: number
          created_at: string
          email: string
          facebook_url: string | null
          first_name: string
          followers_count: number
          following_count: number
          id: string
          instagram_url: string | null
          is_active: boolean
          is_name_changed: boolean | null
          is_online: boolean
          last_name: string
          likes_count: number
          linkedin_url: string | null
          location: string | null
          poll_votes_count: number
          posts_count: number
          updated_at: string
          username: string
          website_url: string | null
          x_url: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          comments_count?: number
          contributions_count?: number
          created_at?: string
          email: string
          facebook_url?: string | null
          first_name: string
          followers_count?: number
          following_count?: number
          id: string
          instagram_url?: string | null
          is_active?: boolean
          is_name_changed?: boolean | null
          is_online?: boolean
          last_name: string
          likes_count?: number
          linkedin_url?: string | null
          location?: string | null
          poll_votes_count?: number
          posts_count?: number
          updated_at?: string
          username: string
          website_url?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          comments_count?: number
          contributions_count?: number
          created_at?: string
          email?: string
          facebook_url?: string | null
          first_name?: string
          followers_count?: number
          following_count?: number
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          is_name_changed?: boolean | null
          is_online?: boolean
          last_name?: string
          likes_count?: number
          linkedin_url?: string | null
          location?: string | null
          poll_votes_count?: number
          posts_count?: number
          updated_at?: string
          username?: string
          website_url?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_community_id_from_storage_path: {
        Args: { storage_path: string }
        Returns: number
      }
      get_community_members: {
        Args: {
          p_community_id: number
          p_limit?: number
          p_page?: number
          p_role?: Database["public"]["Enums"]["community_role_enum"]
          p_search?: string
          p_sort_by?: string
          p_sort_order?: string
          p_status?: Database["public"]["Enums"]["community_member_status_enum"]
        }
        Returns: Json
      }
      is_community_active_member: {
        Args: { comm_id: number }
        Returns: boolean
      }
      is_community_admin_or_owner: {
        Args: { comm_id: number }
        Returns: boolean
      }
      is_community_owner: { Args: { comm_id: number }; Returns: boolean }
    }
    Enums: {
      audience_size_enum: "UNDER_10K" | "10K_TO_100K" | "100K_TO_1M" | "OVER_1M"
      community_billing_cycle_enum: "MONTHLY" | "YEARLY" | "MONTHLY_YEARLY"
      community_member_status_enum:
        | "PENDING"
        | "BANNED"
        | "ACTIVE"
        | "CHURNED"
        | "LEAVING_SOON"
      community_pricing_enum: "FREE" | "SUB" | "ONE_TIME"
      community_role_enum: "OWNER" | "MEMBER" | "ADMIN"
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
      audience_size_enum: ["UNDER_10K", "10K_TO_100K", "100K_TO_1M", "OVER_1M"],
      community_billing_cycle_enum: ["MONTHLY", "YEARLY", "MONTHLY_YEARLY"],
      community_member_status_enum: [
        "PENDING",
        "BANNED",
        "ACTIVE",
        "CHURNED",
        "LEAVING_SOON",
      ],
      community_pricing_enum: ["FREE", "SUB", "ONE_TIME"],
      community_role_enum: ["OWNER", "MEMBER", "ADMIN"],
    },
  },
} as const
