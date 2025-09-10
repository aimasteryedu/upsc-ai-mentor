-- Flashcards policies (owner access)
CREATE POLICY "Users can view their own flashcards" ON flashcards
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create their own flashcards" ON flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own flashcards" ON flashcards
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own flashcards" ON flashcards
  FOR DELETE USING (auth.uid() = user_id);

-- Builds policies (admin only)
CREATE POLICY "Only admins can access builds" ON builds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Subscriptions policies (owner access, admin read)
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
  
CREATE POLICY "Only admins can modify subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name) VALUES ('notes', 'User notes and documents');
INSERT INTO storage.buckets (id, name) VALUES ('podcasts', 'Generated audio content');
INSERT INTO storage.buckets (id, name) VALUES ('videos', 'Generated video content');
INSERT INTO storage.buckets (id, name) VALUES ('builds', 'App build artifacts');

-- Set up storage RLS policies
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
