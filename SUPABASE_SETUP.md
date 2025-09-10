# UPSC AI Mentor Setup

## Introduction

This document explains how to set up and enable pgvector extension in Supabase for the UPSC AI Mentor application and implement Row Level Security (RLS) policies for the database tables.

## Setting up pgvector

The pgvector extension allows PostgreSQL to store and search through vector embeddings, which is essential for the RAG (Retrieval-Augmented Generation) capabilities of UPSC AI Mentor.

### Enable pgvector in Supabase

1. Navigate to the SQL Editor in your Supabase dashboard.
2. Run the following SQL command to enable the extension:

```sql
-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

3. Verify that the extension is enabled:

```sql
-- Check if pgvector is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Create embeddings table

```sql
-- Create the embeddings table with vector column
CREATE TABLE embeddings (
  id bigserial PRIMARY KEY,
  content_id text,
  text text,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create an index for similarity search
CREATE INDEX embeddings_vector_idx ON embeddings 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
```

## Row Level Security (RLS) Policies

Row Level Security (RLS) is a PostgreSQL feature that allows you to restrict access to rows in a table based on the user making the request. This is essential for ensuring data privacy and security in UPSC AI Mentor.

### Enable RLS on tables

```sql
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
```

### Create RLS policies

```sql
-- Users table policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Syllabus nodes policies (public read, admin write)
CREATE POLICY "Syllabus nodes are viewable by all users" ON syllabus_nodes
  FOR SELECT USING (true);
  
CREATE POLICY "Only admins can modify syllabus nodes" ON syllabus_nodes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Notes policies (owner access)
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Progress policies (owner access)
CREATE POLICY "Users can view their own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own progress" ON progress
  FOR ALL USING (auth.uid() = user_id);
```

## Storage Buckets Configuration

Configure storage buckets with appropriate RLS policies:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name) VALUES ('notes', 'User notes and documents');
INSERT INTO storage.buckets (id, name) VALUES ('podcasts', 'Generated audio content');
INSERT INTO storage.buckets (id, name) VALUES ('videos', 'Generated video content');
INSERT INTO storage.buckets (id, name) VALUES ('builds', 'App build artifacts');

-- Set up RLS for storage
-- Notes bucket: user can access their own files
CREATE POLICY "Users can access their own notes" ON storage.objects
  FOR ALL USING (
    bucket_id = 'notes' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Podcasts bucket: public content is viewable by all, private only by owner
CREATE POLICY "Public podcasts are viewable by all" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'podcasts' AND 
    (storage.foldername(name))[2] = 'public'
  );
  
CREATE POLICY "Private podcasts are viewable by owner" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'podcasts' AND 
    (storage.foldername(name))[1] = auth.uid()::text AND
    (storage.foldername(name))[2] = 'private'
  );

-- Videos bucket: similar to podcasts
CREATE POLICY "Public videos are viewable by all" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'videos' AND 
    (storage.foldername(name))[2] = 'public'
  );
  
CREATE POLICY "Private videos are viewable by owner" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text AND
    (storage.foldername(name))[2] = 'private'
  );

-- Builds bucket: admin only
CREATE POLICY "Only admins can access builds" ON storage.objects
  FOR ALL USING (
    bucket_id = 'builds' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
```

## Further Considerations

- Implement custom claims for role-based access control
- Set up webhook triggers for monitoring and auditing
- Configure periodic backups of your database
- Implement rate limiting on sensitive operations
