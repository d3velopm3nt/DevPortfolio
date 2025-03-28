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
      applications: {
        Row: {
          created_at: string | null
          description: string | null
          github_url: string | null
          id: string
          image_url: string | null
          live_url: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      github_repositories: {
        Row: {
          created_at: string | null
          dependencies: Json | null
          description: string | null
          forks_count: number | null
          full_name: string
          github_id: number
          html_url: string
          id: string
          is_private: boolean
          language: string | null
          last_synced_at: string | null
          name: string
          project_id: string | null
          readme_content: string | null
          stargazers_count: number | null
          synced_at: string | null
          topics: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          forks_count?: number | null
          full_name: string
          github_id: number
          html_url: string
          id?: string
          is_private?: boolean
          language?: string | null
          last_synced_at?: string | null
          name: string
          project_id?: string | null
          readme_content?: string | null
          stargazers_count?: number | null
          synced_at?: string | null
          topics?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          forks_count?: number | null
          full_name?: string
          github_id?: number
          html_url?: string
          id?: string
          is_private?: boolean
          language?: string | null
          last_synced_at?: string | null
          name?: string
          project_id?: string | null
          readme_content?: string | null
          stargazers_count?: number | null
          synced_at?: string | null
          topics?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "github_repositories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "github_repositories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_systems: {
        Row: {
          created_at: string | null
          id: string
          name: string
          platform_id: string | null
          version: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          platform_id?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          platform_id?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operating_systems_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          github_access_token: string | null
          github_last_sync_at: string | null
          github_refresh_token: string | null
          github_token_expires_at: string | null
          github_url: string | null
          github_username: string | null
          id: string
          linkedin_url: string | null
          updated_at: string | null
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          github_access_token?: string | null
          github_last_sync_at?: string | null
          github_refresh_token?: string | null
          github_token_expires_at?: string | null
          github_url?: string | null
          github_username?: string | null
          id: string
          linkedin_url?: string | null
          updated_at?: string | null
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          github_access_token?: string | null
          github_last_sync_at?: string | null
          github_refresh_token?: string | null
          github_token_expires_at?: string | null
          github_url?: string | null
          github_username?: string | null
          id?: string
          linkedin_url?: string | null
          updated_at?: string | null
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      project_platforms: {
        Row: {
          created_at: string | null
          id: string
          operating_system_id: string | null
          platform_id: string | null
          project_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          operating_system_id?: string | null
          platform_id?: string | null
          project_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          operating_system_id?: string | null
          platform_id?: string | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_platforms_operating_system_id_fkey"
            columns: ["operating_system_id"]
            isOneToOne: false
            referencedRelation: "operating_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_platforms_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_platforms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tech_stacks: {
        Row: {
          created_at: string | null
          project_id: string
          tech_stack_id: string
        }
        Insert: {
          created_at?: string | null
          project_id: string
          tech_stack_id: string
        }
        Update: {
          created_at?: string | null
          project_id?: string
          tech_stack_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tech_stacks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tech_stacks_tech_stack_id_fkey"
            columns: ["tech_stack_id"]
            isOneToOne: false
            referencedRelation: "tech_stacks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_technologies: {
        Row: {
          project_id: string
          technology_id: string
        }
        Insert: {
          project_id: string
          technology_id: string
        }
        Update: {
          project_id?: string
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_technologies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_technologies_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          application_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          github_url: string | null
          id: string
          image_url: string | null
          live_url: string | null
          start_date: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          start_date?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          start_date?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_projects: {
        Row: {
          project_id: string
          resource_id: string
        }
        Insert: {
          project_id: string
          resource_id: string
        }
        Update: {
          project_id?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_projects_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_technologies: {
        Row: {
          resource_id: string
          technology_id: string
        }
        Insert: {
          resource_id: string
          technology_id: string
        }
        Update: {
          resource_id?: string
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_technologies_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_technologies_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_types: {
        Row: {
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string | null
          description: string | null
          documentation_url: string | null
          github_url: string | null
          id: string
          name: string
          type: string
          type_id: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          github_url?: string | null
          id?: string
          name: string
          type: string
          type_id?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          github_url?: string | null
          id?: string
          name?: string
          type?: string
          type_id?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "resource_types"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_feed_post_info_blocks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          order_index: number
          post_id: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index: number
          post_id?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          post_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tech_feed_post_info_blocks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "tech_feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_feed_post_info_items: {
        Row: {
          block_id: string | null
          content: string
          created_at: string | null
          id: string
          order_index: number
          type: string
          updated_at: string | null
        }
        Insert: {
          block_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          order_index: number
          type: string
          updated_at?: string | null
        }
        Update: {
          block_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          order_index?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tech_feed_post_info_items_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "tech_feed_post_info_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_feed_post_technologies: {
        Row: {
          post_id: string
          technology_id: string
        }
        Insert: {
          post_id: string
          technology_id: string
        }
        Update: {
          post_id?: string
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tech_feed_post_technologies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "tech_feed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_feed_post_technologies_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_feed_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          resource_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          resource_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          resource_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tech_feed_posts_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_feed_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_info_blocks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          technology_id: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          technology_id?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          technology_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tech_info_blocks_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_info_items: {
        Row: {
          block_id: string | null
          content: string
          created_at: string | null
          id: string
          order_index: number
          type: string
          updated_at: string | null
        }
        Insert: {
          block_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          order_index: number
          type: string
          updated_at?: string | null
        }
        Update: {
          block_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          order_index?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tech_info_items_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "tech_info_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_stack_technologies: {
        Row: {
          created_at: string | null
          is_required: boolean | null
          tech_stack_id: string
          technology_id: string
        }
        Insert: {
          created_at?: string | null
          is_required?: boolean | null
          tech_stack_id: string
          technology_id: string
        }
        Update: {
          created_at?: string | null
          is_required?: boolean | null
          tech_stack_id?: string
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tech_stack_technologies_tech_stack_id_fkey"
            columns: ["tech_stack_id"]
            isOneToOne: false
            referencedRelation: "tech_stacks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tech_stack_technologies_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      tech_stacks: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      technologies: {
        Row: {
          color: string
          created_at: string | null
          icon_name: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          color: string
          created_at?: string | null
          icon_name?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          color?: string
          created_at?: string | null
          icon_name?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_project: {
        Args: {
          p_project_id: string
          p_title: string
          p_description: string
          p_github_url: string
          p_live_url: string
          p_tech_names: string[]
        }
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
