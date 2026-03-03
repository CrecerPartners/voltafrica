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
      order_items: {
        Row: {
          commission_rate: number
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          ref_code: string | null
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          id?: string
          order_id: string
          price?: number
          product_id: string
          quantity?: number
          ref_code?: string | null
        }
        Update: {
          commission_rate?: number
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          ref_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string
          id: string
          name: string
          paystack_reference: string | null
          phone: string
          state: string
          status: string
          total: number
          user_id: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email: string
          id?: string
          name: string
          paystack_reference?: string | null
          phone: string
          state: string
          status?: string
          total?: number
          user_id?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          paystack_reference?: string | null
          phone?: string
          state?: string
          status?: string
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          account_number: string
          amount: number
          bank_name: string
          id: string
          notes: string | null
          processed_at: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          account_number?: string
          amount?: number
          bank_name?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number
          bank_name?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          assets: Json
          brand: string
          category: string
          commission_rate: number
          created_at: string
          description: string
          id: string
          image: string
          name: string
          price: number
          slug: string
        }
        Insert: {
          assets?: Json
          brand: string
          category: string
          commission_rate?: number
          created_at?: string
          description?: string
          id?: string
          image?: string
          name: string
          price?: number
          slug: string
        }
        Update: {
          assets?: Json
          brand?: string
          category?: string
          commission_rate?: number
          created_at?: string
          description?: string
          id?: string
          image?: string
          name?: string
          price?: number
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_number: string | null
          account_type: string | null
          avatar_url: string | null
          bank_name: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          id_document_url: string | null
          name: string
          referral_code: string | null
          shop_logo_url: string | null
          shop_name: string | null
          shop_slug: string | null
          social_links: Json | null
          tier: string
          university: string
          updated_at: string
          user_id: string
          verification_status: string | null
          whatsapp: string | null
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          avatar_url?: string | null
          bank_name?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          id_document_url?: string | null
          name?: string
          referral_code?: string | null
          shop_logo_url?: string | null
          shop_name?: string | null
          shop_slug?: string | null
          social_links?: Json | null
          tier?: string
          university?: string
          updated_at?: string
          user_id: string
          verification_status?: string | null
          whatsapp?: string | null
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          avatar_url?: string | null
          bank_name?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          id_document_url?: string | null
          name?: string
          referral_code?: string | null
          shop_logo_url?: string | null
          shop_name?: string | null
          shop_slug?: string | null
          social_links?: Json | null
          tier?: string
          university?: string
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          date: string
          earnings: number
          id: string
          referred_name: string
          referred_user_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          date?: string
          earnings?: number
          id?: string
          referred_name?: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          date?: string
          earnings?: number
          id?: string
          referred_name?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          reviewer_name: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          reviewer_name?: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          reviewer_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount: number
          commission: number
          created_at: string
          customer: string
          date: string
          id: string
          notes: string | null
          product_id: string | null
          proof_file_url: string | null
          quantity: number
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          commission?: number
          created_at?: string
          customer?: string
          date?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          proof_file_url?: string | null
          quantity?: number
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          commission?: number
          created_at?: string
          customer?: string
          date?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          proof_file_url?: string | null
          quantity?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_shop_items: {
        Row: {
          added_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_shop_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      training_courses: {
        Row: {
          category: string
          cover_color: string
          created_at: string
          description: string
          id: string
          level: string
          sort_order: number
          title: string
        }
        Insert: {
          category?: string
          cover_color?: string
          created_at?: string
          description?: string
          id?: string
          level?: string
          sort_order?: number
          title: string
        }
        Update: {
          category?: string
          cover_color?: string
          created_at?: string
          description?: string
          id?: string
          level?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      training_lessons: {
        Row: {
          course_id: string
          created_at: string
          id: string
          module_number: number
          module_title: string
          sort_order: number
          title: string
          youtube_url: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          module_number?: number
          module_title?: string
          sort_order?: number
          title: string
          youtube_url?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          module_number?: number
          module_title?: string
          sort_order?: number
          title?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      training_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "training_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          proof_file_name: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          proof_file_name?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          proof_file_name?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          name: string | null
          rank: number | null
          total_earnings: number | null
          total_sales: number | null
          university: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
