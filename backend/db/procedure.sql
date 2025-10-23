-- =============================================
--                  LOGIN
-- =============================================
CREATE OR REPLACE FUNCTION login_user(_email TEXT)
RETURNS TABLE(
  id INTEGER,
  email TEXT,
  password TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,
    u.password::TEXT
  FROM users u
  WHERE u.email = _email;
END;
$$ LANGUAGE plpgsql;