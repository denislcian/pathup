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
      body_measurements: {
        Row: {
          arm_cm: number | null
          body_fat_pct: number | null
          chest_cm: number | null
          created_at: string
          hips_cm: number | null
          id: string
          measured_on: string
          neck_cm: number | null
          notes: string | null
          thigh_cm: number | null
          updated_at: string
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          created_at?: string
          hips_cm?: number | null
          id?: string
          measured_on: string
          neck_cm?: number | null
          notes?: string | null
          thigh_cm?: number | null
          updated_at?: string
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          created_at?: string
          hips_cm?: number | null
          id?: string
          measured_on?: string
          neck_cm?: number | null
          notes?: string | null
          thigh_cm?: number | null
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          count: number
          day: string
          habit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count: number
          day: string
          habit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          habit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_user_id_fkey"
            columns: ["habit_id", "user_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      habits: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          target: number
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          position?: number
          target?: number
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          target?: number
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          beginner_mode: boolean
          birth_date: string | null
          created_at: string
          display_name: string | null
          equipment: string[]
          experience_level: string | null
          goal: string | null
          health_data_consent_at: string | null
          height_cm: number | null
          id: string
          is_private: boolean
          onboarding_completed_at: string | null
          parq_completed_at: string | null
          parq_flagged: boolean | null
          sex: string | null
          training_days_per_week: number | null
          units: string
          updated_at: string
          username: string | null
        }
        Insert: {
          beginner_mode?: boolean
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          equipment?: string[]
          experience_level?: string | null
          goal?: string | null
          health_data_consent_at?: string | null
          height_cm?: number | null
          id: string
          is_private?: boolean
          onboarding_completed_at?: string | null
          parq_completed_at?: string | null
          parq_flagged?: boolean | null
          sex?: string | null
          training_days_per_week?: number | null
          units?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          beginner_mode?: boolean
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          equipment?: string[]
          experience_level?: string | null
          goal?: string | null
          health_data_consent_at?: string | null
          height_cm?: number | null
          id?: string
          is_private?: boolean
          onboarding_completed_at?: string | null
          parq_completed_at?: string | null
          parq_flagged?: boolean | null
          sex?: string | null
          training_days_per_week?: number | null
          units?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      program_enrollments: {
        Row: {
          created_at: string
          id: string
          program_slug: string
          started_on: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          program_slug: string
          started_on?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          program_slug?: string
          started_on?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          exercise_slug: string
          id: string
          notes: string | null
          position: number
          rep_max: number
          rep_min: number
          routine_id: string
          target_sets: number
          user_id: string
        }
        Insert: {
          exercise_slug: string
          id: string
          notes?: string | null
          position: number
          rep_max?: number
          rep_min?: number
          routine_id: string
          target_sets?: number
          user_id: string
        }
        Update: {
          exercise_slug?: string
          id?: string
          notes?: string | null
          position?: number
          rep_max?: number
          rep_min?: number
          routine_id?: string
          target_sets?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_routine_id_user_id_fkey"
            columns: ["routine_id", "user_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          folder: string | null
          id: string
          name: string
          notes: string | null
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder?: string | null
          id: string
          name: string
          notes?: string | null
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder?: string | null
          id?: string
          name?: string
          notes?: string | null
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wellness_checkins: {
        Row: {
          created_at: string
          day: string
          energy: number
          id: string
          mood: number
          note: string | null
          readiness: number
          sleep_hours: number
          sleep_quality: number
          soreness: number
          stress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day: string
          energy: number
          id?: string
          mood: number
          note?: string | null
          readiness: number
          sleep_hours: number
          sleep_quality: number
          soreness: number
          stress: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day?: string
          energy?: number
          id?: string
          mood?: number
          note?: string | null
          readiness?: number
          sleep_hours?: number
          sleep_quality?: number
          soreness?: number
          stress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          exercise_slug: string
          id: string
          notes: string | null
          position: number
          superset_group: number | null
          user_id: string
          workout_id: string
        }
        Insert: {
          exercise_slug: string
          id: string
          notes?: string | null
          position: number
          superset_group?: number | null
          user_id: string
          workout_id: string
        }
        Update: {
          exercise_slug?: string
          id?: string
          notes?: string | null
          position?: number
          superset_group?: number | null
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_user_id_fkey"
            columns: ["workout_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          completed_at: string
          id: string
          position: number
          reps: number
          rir: number | null
          set_type: string
          user_id: string
          weight_kg: number
          workout_exercise_id: string
        }
        Insert: {
          completed_at: string
          id: string
          position: number
          reps: number
          rir?: number | null
          set_type?: string
          user_id: string
          weight_kg: number
          workout_exercise_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          position?: number
          reps?: number
          rir?: number | null
          set_type?: string
          user_id?: string
          weight_kg?: number
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_workout_exercise_id_user_id_fkey"
            columns: ["workout_exercise_id", "user_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          name: string
          notes: string | null
          program_session: string | null
          program_slug: string | null
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id: string
          name: string
          notes?: string | null
          program_session?: string | null
          program_slug?: string | null
          started_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          program_session?: string | null
          program_slug?: string | null
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_my_account: { Args: never; Returns: undefined }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
