-- Session table migration for cookie-based authentication
-- Run this script on your PostgreSQL database

-- Create sessions table for managing user sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint
ALTER TABLE public.sessions 
ADD CONSTRAINT fk_sessions_user 
FOREIGN KEY (user_id) REFERENCES public.users(id_serial) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions USING btree (expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.sessions USING btree (is_active);

-- Add comment to the table
COMMENT ON TABLE public.sessions IS 'Stores user session information for cookie-based authentication';

-- Optional: Create a function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.sessions 
    WHERE expires_at < CURRENT_TIMESTAMP OR is_active = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create an index for cleanup performance
CREATE INDEX IF NOT EXISTS idx_sessions_cleanup ON public.sessions USING btree (expires_at, is_active);
