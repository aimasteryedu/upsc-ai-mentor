-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- API Keys table for secure storage
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    encrypted_key BYTEA NOT NULL,  -- Encrypted API key
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model Settings table
CREATE TABLE IF NOT EXISTS model_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('reasoning', 'embeddings', 'asr', 'tts', 'visuals', 'animations', 'avatars')),
    provider TEXT NOT NULL,
    model_name TEXT NOT NULL,
    api_key_id UUID REFERENCES api_keys(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_model_settings_category ON model_settings(category);
CREATE INDEX IF NOT EXISTS idx_model_settings_active ON model_settings(is_active);

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access
CREATE POLICY api_keys_admin_only ON api_keys FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

CREATE POLICY model_settings_admin_only ON model_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Function to encrypt API key
CREATE OR REPLACE FUNCTION encrypt_api_key(plain_key TEXT, encryption_key TEXT DEFAULT 'your-encryption-key-here')
RETURNS BYTEA AS 
BEGIN
    RETURN pgp_sym_encrypt(plain_key, encryption_key);
END;
 LANGUAGE plpgsql;

-- Function to decrypt API key
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_key BYTEA, encryption_key TEXT DEFAULT 'your-encryption-key-here')
RETURNS TEXT AS 
BEGIN
    RETURN pgp_sym_decrypt(encrypted_key, encryption_key);
END;
 LANGUAGE plpgsql;

-- Insert default settings
INSERT INTO api_keys (provider, encrypted_key) VALUES
('moonshot', encrypt_api_key('your-moonshot-key')),
('openai', encrypt_api_key('your-openai-key')),
('huggingface', encrypt_api_key('your-huggingface-key'));

INSERT INTO model_settings (category, provider, model_name, api_key_id) VALUES
('reasoning', 'moonshot', 'kimi-k2-0905', (SELECT id FROM api_keys WHERE provider = 'moonshot' LIMIT 1)),
('embeddings', 'openai', 'text-embedding-3-large', (SELECT id FROM api_keys WHERE provider = 'openai' LIMIT 1)),
('asr', 'openai', 'whisper-large-v3', (SELECT id FROM api_keys WHERE provider = 'openai' LIMIT 1)),
('tts', 'huggingface', 'suno/bark', (SELECT id FROM api_keys WHERE provider = 'huggingface' LIMIT 1)),
('visuals', 'huggingface', 'stable-diffusion-v1.0', (SELECT id FROM api_keys WHERE provider = 'huggingface' LIMIT 1)),
('animations', 'huggingface', 'animatediff', (SELECT id FROM api_keys WHERE provider = 'huggingface' LIMIT 1)),
('avatars', 'huggingface', 'sadtalker', (SELECT id FROM api_keys WHERE provider = 'huggingface' LIMIT 1));

