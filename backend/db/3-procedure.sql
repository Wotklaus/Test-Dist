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



-- =============================================
--                  Users 
-- =============================================
--registrar usuario
CREATE OR REPLACE FUNCTION register_user(
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_document_id VARCHAR,
  p_phone VARCHAR,
  p_email VARCHAR,
  p_password VARCHAR
) RETURNS INTEGER AS $$
DECLARE
  new_user_id INTEGER;
BEGIN
  INSERT INTO users (first_name, last_name, document_id, phone, email, password)
  VALUES (p_first_name, p_last_name, p_document_id, p_phone, p_email, p_password)
  RETURNING id INTO new_user_id;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
--                  Favorite Pokemons
-- =============================================
-- Agregar favorito
CREATE OR REPLACE FUNCTION add_favorite(uid INTEGER, pid INTEGER, pname VARCHAR)
RETURNS VOID AS $$
BEGIN
  INSERT INTO favorites (user_id, pokemon_id, pokemon_name)
  VALUES (uid, pid, pname)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Quitar favorito
CREATE OR REPLACE FUNCTION remove_favorite(uid INTEGER, pid INTEGER)
RETURNS VOID AS $$
BEGIN
  DELETE FROM favorites WHERE user_id = uid AND pokemon_id = pid;
END;
$$ LANGUAGE plpgsql;

-- Listar favoritos
CREATE OR REPLACE FUNCTION get_favorites(uid INTEGER)
RETURNS TABLE(pokemon_id INTEGER, pokemon_name VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT favorites.pokemon_id, favorites.pokemon_name FROM favorites WHERE favorites.user_id = uid;
END;
$$ LANGUAGE plpgsql;

