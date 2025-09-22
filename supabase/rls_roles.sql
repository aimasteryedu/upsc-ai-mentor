-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = '\''admin'\''
    )
  );
  
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = '\''admin'\''
    )
  );

-- RLS Policies for other tables (simplified)
CREATE POLICY "Learners cannot access admin features" ON notes
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Admins can view all notes" ON notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = '\''admin'\''
    )
  );
