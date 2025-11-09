-- =============================================
--                  LOGIN
-- =============================================
CREATE OR REPLACE FUNCTION login_user(_email TEXT)
RETURNS TABLE(
  id INTEGER,
  email TEXT,
  password TEXT,
  first_name TEXT,
  last_name TEXT,
  role_id INTEGER      -- <--- OJO: este es el nombre de la columna en tu tabla
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,
    u.password::TEXT,
    u.first_name::TEXT,
    u.last_name::TEXT,
    u.role_id::INTEGER
  FROM users u
  WHERE u.email = _email;
END;
$$ LANGUAGE plpgsql;
-- =============================================
--                  Roles 
-- =============================================
-- Crear rol
CREATE OR REPLACE FUNCTION create_role(
  p_name VARCHAR,
  p_description TEXT
) RETURNS INTEGER AS $$
DECLARE
  new_role_id INTEGER;
BEGIN
  INSERT INTO roles (name, description)
  VALUES (p_name, p_description)
  RETURNING id INTO new_role_id;

  RETURN new_role_id;
END;
$$ LANGUAGE plpgsql;

--obtener todos los roles
CREATE OR REPLACE FUNCTION get_all_roles()
RETURNS TABLE(id INTEGER, name VARCHAR, description TEXT) AS $$
BEGIN
  RETURN QUERY
    SELECT id, name, description FROM roles ORDER BY id;
END;
$$ LANGUAGE plpgsql;

--ontener rol por id
CREATE OR REPLACE FUNCTION get_role_by_id(
  p_id INTEGER
)
RETURNS TABLE(id INTEGER, name VARCHAR, description TEXT) AS $$
BEGIN
  RETURN QUERY
    SELECT id, name, description FROM roles WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

--eliminar rol por id
CREATE OR REPLACE FUNCTION delete_role_by_id(
  p_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM roles WHERE id = p_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- =============================================
--                  Users 
-- =============================================
--registrar usuario
-- Registrar usuario, asigna rol_id=2 (usuario) por defecto
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
  INSERT INTO users (first_name, last_name, document_id, phone, email, password, role_id)
  VALUES (p_first_name, p_last_name, p_document_id, p_phone, p_email, p_password, 2)
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

-- =============================================
--                  Search History
-- =============================================
-- Agregar búsqueda al historial
CREATE OR REPLACE FUNCTION create_search_history(
  p_user_id INTEGER,
  p_pokemon_name VARCHAR
) RETURNS INTEGER AS $$
DECLARE
  new_id INTEGER;
BEGIN
  INSERT INTO search_history (user_id, pokemon_name)
  VALUES (p_user_id, p_pokemon_name)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Obtener historial de búsquedas por usuario
CREATE OR REPLACE FUNCTION get_search_history_by_user(
  p_user_id INTEGER
)
RETURNS TABLE(
  id INTEGER,
  user_id INTEGER,
  pokemon_name VARCHAR,
  "timestamp" TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
    SELECT sh.id, sh.user_id, sh.pokemon_name, sh."timestamp"
    FROM search_history sh
    WHERE sh.user_id = p_user_id
    ORDER BY sh."timestamp" DESC;
END;
$$ LANGUAGE plpgsql;