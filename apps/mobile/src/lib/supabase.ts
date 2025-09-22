import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://sbqkzzjbigcgtgyletqw.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNicWt6empiaWdjZ3RneWxldHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwODY3MjksImV4cCI6MjA3MjY2MjcyOX0.yg6c8vIycKWUDkshT9ZLBmUf4zwJ4C-HWqTyqOYLZVo';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export types for use in the application
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          full_name: string;
          avatar_url: string;
          role: string;
          subscription_tier: string;
          last_active: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          role?: string;
          subscription_tier?: string;
          last_active?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          role?: string;
          subscription_tier?: string;
          last_active?: string;
        };
      };
      syllabus_nodes: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          parent_id: string | null;
          name: string;
          description: string;
          type: string;
          order_index: number;
          estimated_hours: number;
          difficulty_level: number;
          exam_relevance: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
          name: string;
          description: string;
          type: string;
          order_index: number;
          estimated_hours: number;
          difficulty_level: number;
          exam_relevance: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
          name?: string;
          description?: string;
          type?: string;
          order_index?: number;
          estimated_hours?: number;
          difficulty_level?: number;
          exam_relevance?: number;
        };
      };
      embeddings: {
        Row: {
          id: number;
          content_id: string;
          text: string;
          embedding: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          content_id: string;
          text: string;
          embedding: string;
          metadata: Json;
          created_at?: string;
        };
        Update: {
          id?: number;
          content_id?: string;
          text?: string;
          embedding?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          content: string;
          subject_id: string;
          topic_id: string;
          tags: string[];
          is_public: boolean;
          word_count: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          title: string;
          content: string;
          subject_id: string;
          topic_id: string;
          tags?: string[];
          is_public?: boolean;
          word_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          title?: string;
          content?: string;
          subject_id?: string;
          topic_id?: string;
          tags?: string[];
          is_public?: boolean;
          word_count?: number;
        };
      };
      podcasts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          description: string;
          audio_url: string;
          duration: number;
          content_id: string;
          status: string;
          word_count: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          title: string;
          description: string;
          audio_url: string;
          duration: number;
          content_id: string;
          status?: string;
          word_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          title?: string;
          description?: string;
          audio_url?: string;
          duration?: number;
          content_id?: string;
          status?: string;
          word_count?: number;
        };
      };
      videos: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          description: string;
          video_url: string;
          thumbnail_url: string;
          duration: number;
          content_id: string;
          status: string;
          view_count: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          title: string;
          description: string;
          video_url: string;
          thumbnail_url: string;
          duration: number;
          content_id: string;
          status?: string;
          view_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          title?: string;
          description?: string;
          video_url?: string;
          thumbnail_url?: string;
          duration?: number;
          content_id?: string;
          status?: string;
          view_count?: number;
        };
      };
      progress: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          syllabus_node_id: string;
          status: string;
          time_spent: number;
          last_accessed: string;
          completion_percentage: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          syllabus_node_id: string;
          status?: string;
          time_spent?: number;
          last_accessed?: string;
          completion_percentage?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          syllabus_node_id?: string;
          status?: string;
          time_spent?: number;
          last_accessed?: string;
          completion_percentage?: number;
        };
      };
      builds: {
        Row: {
          id: string;
          created_at: string;
          version: string;
          platform: string;
          artifact_url: string;
          status: string;
          size: number;
          changelog: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          version: string;
          platform: string;
          artifact_url: string;
          status?: string;
          size: number;
          changelog: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          version?: string;
          platform?: string;
          artifact_url?: string;
          status?: string;
          size?: number;
          changelog?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          tier: string;
          status: string;
          start_date: string;
          end_date: string;
          auto_renew: boolean;
          payment_method: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          tier: string;
          status: string;
          start_date: string;
          end_date: string;
          auto_renew?: boolean;
          payment_method: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          tier?: string;
          status?: string;
          start_date?: string;
          end_date?: string;
          auto_renew?: boolean;
          payment_method?: string;
        };
      };
      admin_audit: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details: Json;
          ip_address: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details: Json;
          ip_address: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string;
          details?: Json;
          ip_address?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type SyllabusNode = Database['public']['Tables']['syllabus_nodes']['Row'];
export type Embedding = Database['public']['Tables']['embeddings']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
export type Podcast = Database['public']['Tables']['podcasts']['Row'];
export type Video = Database['public']['Tables']['videos']['Row'];
export type Progress = Database['public']['Tables']['progress']['Row'];
export type Build = Database['public']['Tables']['builds']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type AdminAudit = Database['public']['Tables']['admin_audit']['Row'];
