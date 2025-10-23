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