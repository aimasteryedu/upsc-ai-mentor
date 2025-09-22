-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table with role field
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT '\''learner'\'' CHECK (role IN ('\''admin'\'', '\''learner'\'')),
  subscription_status TEXT DEFAULT '\''trial'\'' CHECK (subscription_status IN ('\''trial'\'', '\''active'\'', '\''expired'\'', '\''cancelled'\'')),
  subscription_end_date TIMESTAMPTZ,
  query_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $trigger$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'\''full_name'\'', COALESCE(new.raw_user_meta_data->>'\''role'\'', '\''learner'\''));
  RETURN NEW;
END;
$trigger$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing users
UPDATE users SET role = '\''learner'\'' WHERE role IS NULL OR role = '\'''\'';
UPDATE users SET subscription_status = '\''trial'\'' WHERE subscription_status IS NULL;
