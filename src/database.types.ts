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
      classrooms: {
        Row: {
          amount_one_time: number | null
          community_id: number
          cover_url: string | null
          created_at: string
          description: string
          id: number
          is_draft: boolean
          name: string
          slug: string
          time_unlock_in_days: number | null
          type: Database["public"]["Enums"]["classroom_type_enum"]
          updated_at: string
        }
        Insert: {
          amount_one_time?: number | null
          community_id: number
          cover_url?: string | null
          created_at?: string
          description: string
          id?: number
          is_draft: boolean
          name: string
          slug: string
          time_unlock_in_days?: number | null
          type: Database["public"]["Enums"]["classroom_type_enum"]
          updated_at?: string
        }
        Update: {
          amount_one_time?: number | null
          community_id?: number
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: number
          is_draft?: boolean
          name?: string
          slug?: string
          time_unlock_in_days?: number | null
          type?: Database["public"]["Enums"]["classroom_type_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: number
          likes_count: number
          post_id: number
          reply_to_comment_id: number | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: number
          likes_count?: number
          post_id: number
          reply_to_comment_id?: number | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: number
          likes_count?: number
          post_id?: number
          reply_to_comment_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_reply_to_comment_id_fkey"
            columns: ["reply_to_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments_likes: {
        Row: {
          comment_id: number
          community_id: number
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          comment_id: number
          community_id: number
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          comment_id?: number
          community_id?: number
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_likes_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
      community_member_classrooms: {
        Row: {
          classroom_id: number
          community_id: number
          created_at: string
          id: number
          progress_lessons: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          classroom_id: number
          community_id: number
          created_at?: string
          id?: number
          progress_lessons?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          classroom_id?: number
          community_id?: number
          created_at?: string
          id?: number
          progress_lessons?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_member_classrooms_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_member_classrooms_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_member_classrooms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: number
          created_at: string
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
          created_at?: string
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
          created_at?: string
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
      community_questions: {
        Row: {
          community_id: number
          content: string
          created_at: string
          id: number
          index: number
          type: Database["public"]["Enums"]["community_question_type_enum"]
          updated_at: string
        }
        Insert: {
          community_id: number
          content: string
          created_at?: string
          id?: number
          index: number
          type: Database["public"]["Enums"]["community_question_type_enum"]
          updated_at?: string
        }
        Update: {
          community_id?: number
          content?: string
          created_at?: string
          id?: number
          index?: number
          type?: Database["public"]["Enums"]["community_question_type_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_questions_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_questions_answers: {
        Row: {
          answer: string
          community_member_id: number
          community_question_id: number
          created_at: string
          id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          answer: string
          community_member_id: number
          community_question_id: number
          created_at?: string
          id?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          community_member_id?: number
          community_question_id?: number
          created_at?: string
          id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_questions_answers_community_member_id_fkey"
            columns: ["community_member_id"]
            isOneToOne: false
            referencedRelation: "community_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_questions_answers_community_question_id_fkey"
            columns: ["community_question_id"]
            isOneToOne: false
            referencedRelation: "community_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_questions_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_rules: {
        Row: {
          community_id: number
          created_at: string
          id: number
          index: number
          rule: string
          updated_at: string
        }
        Insert: {
          community_id: number
          created_at?: string
          id?: number
          index: number
          rule: string
          updated_at?: string
        }
        Update: {
          community_id?: number
          created_at?: string
          id?: number
          index?: number
          rule?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_rules_community_id_fkey"
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
      lesson_resources: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          id: number
          lesson_id: number
          link_name: string | null
          type: Database["public"]["Enums"]["lesson_resource_type_enum"]
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: number
          lesson_id: number
          link_name?: string | null
          type: Database["public"]["Enums"]["lesson_resource_type_enum"]
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: number
          lesson_id?: number
          link_name?: string | null
          type?: Database["public"]["Enums"]["lesson_resource_type_enum"]
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          id: number
          index: number
          module_id: number
          name: string
          text_content: string | null
          updated_at: string
          video_type: Database["public"]["Enums"]["video_type_enum"] | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          index: number
          module_id: number
          name: string
          text_content?: string | null
          updated_at?: string
          video_type?: Database["public"]["Enums"]["video_type_enum"] | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          index?: number
          module_id?: number
          name?: string
          text_content?: string | null
          updated_at?: string
          video_type?: Database["public"]["Enums"]["video_type_enum"] | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          community_id: number
          created_at: string
          id: number
          post_id: number
          user_id: string
        }
        Insert: {
          community_id: number
          created_at?: string
          id?: number
          post_id: number
          user_id: string
        }
        Update: {
          community_id?: number
          created_at?: string
          id?: number
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          classroom_id: number
          created_at: string
          description: string
          id: number
          index: number
          name: string
          updated_at: string
        }
        Insert: {
          classroom_id: number
          created_at?: string
          description: string
          id?: number
          index: number
          name: string
          updated_at?: string
        }
        Update: {
          classroom_id?: number
          created_at?: string
          description?: string
          id?: number
          index?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          comm_id: number | null
          community_member_classrooms_id: number | null
          created_at: string
          id: number
          paid_at: string
          status: Database["public"]["Enums"]["payment_status_enum"]
          type: Database["public"]["Enums"]["payment_type_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          comm_id?: number | null
          community_member_classrooms_id?: number | null
          created_at?: string
          id?: number
          paid_at?: string
          status?: Database["public"]["Enums"]["payment_status_enum"]
          type: Database["public"]["Enums"]["payment_type_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          comm_id?: number | null
          community_member_classrooms_id?: number | null
          created_at?: string
          id?: number
          paid_at?: string
          status?: Database["public"]["Enums"]["payment_status_enum"]
          type?: Database["public"]["Enums"]["payment_type_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_comm_id_fkey"
            columns: ["comm_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_community_member_classrooms_id_fkey"
            columns: ["community_member_classrooms_id"]
            isOneToOne: false
            referencedRelation: "community_member_classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      poll: {
        Row: {
          created_at: string
          id: number
          post_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          post_id: number
        }
        Update: {
          created_at?: string
          id?: number
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string
          id: number
          poll_id: number
          text: string
        }
        Insert: {
          created_at?: string
          id?: number
          poll_id: number
          text: string
        }
        Update: {
          created_at?: string
          id?: number
          poll_id?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "poll"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: number
          poll_id: number
          poll_option_id: number
          post_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          poll_id: number
          poll_option_id: number
          post_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          poll_id?: number
          poll_option_id?: number
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "poll"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_option_id_fkey"
            columns: ["poll_option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          comments_disabled: boolean
          community_id: number
          content: string
          created_at: string
          id: number
          is_pinned: boolean
          likes_count: number
          poll_id: number | null
          title: string
          topic_id: number | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author_id: string
          comments_disabled?: boolean
          community_id: number
          content: string
          created_at?: string
          id?: number
          is_pinned?: boolean
          likes_count?: number
          poll_id?: number | null
          title: string
          topic_id?: number | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author_id?: string
          comments_disabled?: boolean
          community_id?: number
          content?: string
          created_at?: string
          id?: number
          is_pinned?: boolean
          likes_count?: number
          poll_id?: number | null
          title?: string
          topic_id?: number | null
          updated_at?: string
          video_url?: string | null
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
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "poll"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_attachments: {
        Row: {
          created_at: string
          id: number
          name: string
          post_id: number
          type: Database["public"]["Enums"]["posts_attachment_type_enum"]
          url: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          post_id: number
          type: Database["public"]["Enums"]["posts_attachment_type_enum"]
          url: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          post_id?: number
          type?: Database["public"]["Enums"]["posts_attachment_type_enum"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_attachments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_reports: {
        Row: {
          community_id: number
          created_at: string
          description: string | null
          id: number
          post_id: number
          rules_ids: string | null
          user_id: string
        }
        Insert: {
          community_id: number
          created_at?: string
          description?: string | null
          id?: number
          post_id: number
          rules_ids?: string | null
          user_id: string
        }
        Update: {
          community_id?: number
          created_at?: string
          description?: string | null
          id?: number
          post_id?: number
          rules_ids?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_reports_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          community_id: number
          created_at: string
          id: number
          index: number
          name: string
          updated_at: string
          write_permission_type: Database["public"]["Enums"]["topic_write_permission_type_enum"]
        }
        Insert: {
          community_id: number
          created_at?: string
          id?: number
          index?: number
          name: string
          updated_at?: string
          write_permission_type: Database["public"]["Enums"]["topic_write_permission_type_enum"]
        }
        Update: {
          community_id?: number
          created_at?: string
          id?: number
          index?: number
          name?: string
          updated_at?: string
          write_permission_type?: Database["public"]["Enums"]["topic_write_permission_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "topics_community_id_fkey"
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
      can_access_classroom_content: {
        Args: { comm_id: number }
        Returns: boolean
      }
      can_write_to_topic: {
        Args: { comm_id: number; topic_id_param: number }
        Returns: boolean
      }
      get_classroom_community_id: {
        Args: { classroom_id_param: number }
        Returns: number
      }
      get_classrooms_with_join_status: {
        Args: {
          p_community_id: number
          p_user_id?: string
          p_view_drafts?: boolean
        }
        Returns: {
          amount_one_time: number
          community_id: number
          cover_url: string
          created_at: string
          description: string
          id: number
          is_draft: boolean
          is_joined: boolean
          lessons_count: number
          modules_count: number
          name: string
          resources_count: number
          slug: string
          time_unlock_in_days: number
          type: Database["public"]["Enums"]["classroom_type_enum"]
          updated_at: string
        }[]
      }
      get_comments: {
        Args: {
          p_comments_limit?: number
          p_comments_offset?: number
          p_post_id: number
          p_replies_limit?: number
          p_user_id?: string
        }
        Returns: Json
      }
      get_community_id_from_question_id: {
        Args: { question_id: number }
        Returns: number
      }
      get_community_id_from_storage_path: {
        Args: { storage_path: string }
        Returns: number
      }
      get_community_members: {
        Args: {
          p_community_id: number
          p_limit?: number
          p_page?: number
          p_roles?: Database["public"]["Enums"]["community_role_enum"][]
          p_search?: string
          p_sort_by?: string
          p_sort_order?: string
          p_status?: Database["public"]["Enums"]["community_member_status_enum"]
        }
        Returns: Json
      }
      get_lesson_community_id: {
        Args: { lesson_id_param: number }
        Returns: number
      }
      get_module_community_id: {
        Args: { module_id_param: number }
        Returns: number
      }
      get_post_community_id: {
        Args: { post_id_param: number }
        Returns: number
      }
      get_posts:
        | {
            Args: {
              p_community_id: number
              p_limit?: number
              p_offset?: number
              p_sort_by?: string
              p_topic?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_community_id: number
              p_limit?: number
              p_offset?: number
              p_sort_by?: string
              p_topic_id?: number
              p_user_id?: string
            }
            Returns: Json
          }
      get_votes_result: { Args: { p_post_id: number }; Returns: Json }
      is_community_active_member: {
        Args: { comm_id: number }
        Returns: boolean
      }
      is_community_admin_or_owner: {
        Args: { comm_id: number }
        Returns: boolean
      }
      is_community_member_any_status: {
        Args: { comm_id: number }
        Returns: boolean
      }
      is_community_owner: { Args: { comm_id: number }; Returns: boolean }
      is_poll_post_author: { Args: { poll_id_param: number }; Returns: boolean }
      is_post_author: { Args: { post_id_param: number }; Returns: boolean }
    }
    Enums: {
      audience_size_enum: "UNDER_10K" | "10K_TO_100K" | "100K_TO_1M" | "OVER_1M"
      classroom_type_enum:
        | "PRIVATE"
        | "PUBLIC"
        | "ONE_TIME_PAYMENT"
        | "TIME_UNLOCK"
      community_billing_cycle_enum:
        | "MONTHLY"
        | "YEARLY"
        | "MONTHLY_YEARLY"
        | "ONE_TIME"
      community_member_status_enum:
        | "PENDING"
        | "BANNED"
        | "ACTIVE"
        | "CHURNED"
        | "LEAVING_SOON"
      community_pricing_enum: "FREE" | "SUB" | "ONE_TIME"
      community_question_type_enum: "TEXT" | "EMAIL" | "MULTIPLE_CHOICE"
      community_role_enum: "OWNER" | "MEMBER" | "ADMIN"
      lesson_resource_type_enum: "FILE" | "LINK"
      payment_status_enum: "PENDING" | "PAID" | "FAILED"
      payment_type_enum:
        | "SUBSCRIPTION_MONTHLY_FEE"
        | "SUBSCRIPTION_YEARLY_FEE"
        | "SUBSCRIPTION_ONE_TIME_PAYMENT"
        | "CLASSROOM_ONE_TIME_PAYMENT"
      posts_attachment_type_enum: "IMAGE" | "LINK"
      topic_write_permission_type_enum: "PUBLIC" | "ADMINS"
      video_type_enum: "YOUTUBE" | "LOOM" | "VIMEO"
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
      classroom_type_enum: [
        "PRIVATE",
        "PUBLIC",
        "ONE_TIME_PAYMENT",
        "TIME_UNLOCK",
      ],
      community_billing_cycle_enum: [
        "MONTHLY",
        "YEARLY",
        "MONTHLY_YEARLY",
        "ONE_TIME",
      ],
      community_member_status_enum: [
        "PENDING",
        "BANNED",
        "ACTIVE",
        "CHURNED",
        "LEAVING_SOON",
      ],
      community_pricing_enum: ["FREE", "SUB", "ONE_TIME"],
      community_question_type_enum: ["TEXT", "EMAIL", "MULTIPLE_CHOICE"],
      community_role_enum: ["OWNER", "MEMBER", "ADMIN"],
      lesson_resource_type_enum: ["FILE", "LINK"],
      payment_status_enum: ["PENDING", "PAID", "FAILED"],
      payment_type_enum: [
        "SUBSCRIPTION_MONTHLY_FEE",
        "SUBSCRIPTION_YEARLY_FEE",
        "SUBSCRIPTION_ONE_TIME_PAYMENT",
        "CLASSROOM_ONE_TIME_PAYMENT",
      ],
      posts_attachment_type_enum: ["IMAGE", "LINK"],
      topic_write_permission_type_enum: ["PUBLIC", "ADMINS"],
      video_type_enum: ["YOUTUBE", "LOOM", "VIMEO"],
    },
  },
} as const
