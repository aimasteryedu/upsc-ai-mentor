-- Podcasts policies (public content viewable by all, admin write)
CREATE POLICY "Public podcasts are viewable by all users" ON podcasts
  FOR SELECT USING (is_public = true);
  
CREATE POLICY "Only admins can modify podcasts" ON podcasts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Videos policies (public content viewable by all, admin write)
CREATE POLICY "Public videos are viewable by all users" ON videos
  FOR SELECT USING (is_public = true);
  
CREATE POLICY "Only admins can modify videos" ON videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Progress policies (owner access)
CREATE POLICY "Users can view their own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own progress" ON progress
  FOR ALL USING (auth.uid() = user_id);

-- Tests policies (public tests viewable by all, admin write)
CREATE POLICY "Public tests are viewable by all users" ON tests
  FOR SELECT USING (is_public = true);
  
CREATE POLICY "Only admins can modify tests" ON tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Questions policies (viewable with test, admin write)
CREATE POLICY "Questions are viewable with test" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tests
      WHERE tests.id = questions.test_id AND tests.is_public = true
    )
  );
  
CREATE POLICY "Only admins can modify questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Test attempts policies (owner access)
CREATE POLICY "Users can view their own test attempts" ON test_attempts
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create their own test attempts" ON test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own test attempts" ON test_attempts
  FOR UPDATE USING (auth.uid() = user_id);
