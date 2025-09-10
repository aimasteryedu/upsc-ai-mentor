export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          subscription_status: string | null;
          subscription_end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          subscription_status?: string | null;
          subscription_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          subscription_status?: string | null;
          subscription_end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      syllabus_nodes: {
        Row: {
          id: string;
          parent_id: string | null;
          title: string;
          description: string | null;
          level: string;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          title: string;
          description?: string | null;
          level: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string | null;
          title?: string;
          description?: string | null;
          level?: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      embeddings: {
        Row: {
          id: number;
          content_id: string;
          text: string;
          embedding: number[];
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: number;
          content_id: string;
          text: string;
          embedding: number[];
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: number;
          content_id?: string;
          text?: string;
          embedding?: number[];
          metadata?: any;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          syllabus_node_id: string | null;
          is_ai_generated: boolean;
          source_url: string | null;
          storage_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          syllabus_node_id?: string | null;
          is_ai_generated?: boolean;
          source_url?: string | null;
          storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          syllabus_node_id?: string | null;
          is_ai_generated?: boolean;
          source_url?: string | null;
          storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      podcasts: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          syllabus_node_id: string | null;
          script: string;
          duration: number;
          storage_path: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          syllabus_node_id?: string | null;
          script: string;
          duration: number;
          storage_path: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          syllabus_node_id?: string | null;
          script?: string;
          duration?: number;
          storage_path?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          syllabus_node_id: string | null;
          script: string;
          duration: number;
          resolution: string;
          storage_path: string;
          thumbnail_path: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          syllabus_node_id?: string | null;
          script: string;
          duration: number;
          resolution: string;
          storage_path: string;
          thumbnail_path?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          syllabus_node_id?: string | null;
          script?: string;
          duration?: number;
          resolution?: string;
          storage_path?: string;
          thumbnail_path?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          syllabus_node_id: string;
          status: string;
          confidence: number;
          time_spent: number;
          last_accessed: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          syllabus_node_id: string;
          status?: string;
          confidence?: number;
          time_spent?: number;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          syllabus_node_id?: string;
          status?: string;
          confidence?: number;
          time_spent?: number;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: number;
          content_id: string;
          text: string;
          metadata: any;
          similarity: number;
        }[];
      };
    };
  };
}
