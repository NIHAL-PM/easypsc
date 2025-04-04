
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      settings: {
        Row: {
          id: string
          key: string
          value: string | null
          user_id: string
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          user_id: string
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          user_id?: string
          updated_at?: string | null
          created_at?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string | null
          user_name: string
          exam_category: string
          message: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_name: string
          exam_category: string
          message: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          user_name?: string
          exam_category?: string
          message?: string
          created_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          preferred_exams: string[] | null
          preferred_language: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          preferred_exams?: string[] | null
          preferred_language?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          preferred_exams?: string[] | null
          preferred_language?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
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
