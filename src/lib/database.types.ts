
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
      questions: {
        Row: {
          id: string
          question: string
          options: Json | null
          correct_answer: string | null
          explanation: string | null
          tags: string[] | null
          difficulty_level: string | null
          exam_category_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          question: string
          options?: Json | null
          correct_answer?: string | null
          explanation?: string | null
          tags?: string[] | null
          difficulty_level?: string | null
          exam_category_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          question?: string
          options?: Json | null
          correct_answer?: string | null
          explanation?: string | null
          tags?: string[] | null
          difficulty_level?: string | null
          exam_category_id?: string | null
          created_at?: string | null
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          created_at?: string | null
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          questions_attempted: number | null
          questions_correct: number | null
          streak_days: number | null
          last_active: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          questions_attempted?: number | null
          questions_correct?: number | null
          streak_days?: number | null
          last_active?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          questions_attempted?: number | null
          questions_correct?: number | null
          streak_days?: number | null
          last_active?: string | null
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
