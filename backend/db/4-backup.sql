-- Inserta los roles primero
INSERT INTO roles (name, description) VALUES
('admin', 'Full access'),
('user', 'Standard user');

-- Inserta solo dos usuarios: uno admin (role_id = 1) y uno usuario normal (role_id = 2)
INSERT INTO users (first_name, last_name, document_id, phone, email, password, role_id) VALUES
('Admin', 'Admin', '00000000', '555-0000', 'admin@system.com', '$2b$10$UrOHqi1FHId2m86KOoqGzuUoccF5EAstCbWVT5ERNwNS/UUtZwNw2', 1), -- admin
('User', 'User', '00000001', '555-0001', 'user@system.com', '$2b$10$IaFDsbUpfyZwKfAwcrebr.drT4BceZjfJYOuNQL5vQ9eETRIDLCcG', 2); -- user