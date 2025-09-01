-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO admin_users (id, username, password_hash) VALUES 
  ('admin-1', 'admin', '$2a$10$K7L1OJ0TfgLDkSOlBhM1w.5rNzgWdHB.QWBqH5c2VYcKjvZz7Wiem');

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES 
  ('site_name', 'SATYAM GOLD'),
  ('site_logo', 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/04925dbc9_1000012467.png'),
  ('primary_color', '#ff8c42'),
  ('secondary_color', '#2c3e50'),
  ('footer_text', '© 2024 SATYAM GOLD. All rights reserved. Delivering freshness to your doorstep.'),
  ('phone_number', '9631816666'),
  ('whatsapp_number', '9631816666'),
  ('email', 'avinash@gmail.com'),
  ('facebook_url', '16:9 aspect ratio'),
  ('instagram_url', '16:9 aspect ratio'),
  ('whatsapp_chat_url', 'https://wa.me/916201530654'),
  ('whatsapp_logo_url', 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/01a0a43b4_1000016121.png');

-- Insert sample products
INSERT OR IGNORE INTO products (id, name, description, category, price, unit, weight_options, image_url, in_stock, featured) VALUES 
  ('prod-1', 'Sattu', 'Premium quality atta made with traditional methods', 'Sattu', 60, 'kg', '["500g", "1kg", "5kg"]', 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/6336e6ce8_1000016130.png', 1, 1),
  ('prod-2', 'Premium Wheat Atta', 'Stone-milled whole wheat flour made from the finest quality wheat grains. Rich in fiber and nutrients.', 'Atta', 40, 'kg', '["1kg", "5kg", "10kg"]', 'https://via.placeholder.com/300x300/8B4513/FFFFFF?text=Wheat+Atta', 1, 1),
  ('prod-3', 'Multi-Grain Atta', 'A healthy blend of multiple grains for enhanced nutrition', 'Atta', 65, 'kg', '["500g", "1kg", "5kg"]', 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/c913bb678_1000016137.png', 1, 0),
  ('prod-4', 'Njjn', 'Premium quality besan', 'Besan', 80, 'kg', '["500g", "1kg"]', 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/c913bb678_1000016137.png', 1, 0);

-- Insert hero slides
INSERT OR IGNORE INTO hero_slides (id, image_url, title, description, link, display_order, active) VALUES 
  ('slide-1', 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/6336e6ce8_1000016130.png', 'Gold Harvest Wheat Flour', 'Grown Without Chemicals. Packed With Goodness', '/', 1, 1);