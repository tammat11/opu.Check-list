-- Users table with role hierarchy
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  iin VARCHAR(12) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'cleaner',
  parent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_role CHECK (role IN ('admin', 'partner', 'curator', 'cleaner'))
);

-- Objects (Cleaning locations)
CREATE TABLE IF NOT EXISTS objects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  partner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklist templates (Templates created by admin/partner)
CREATE TABLE IF NOT EXISTS checklist_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Template items (Items within a template)
CREATE TABLE IF NOT EXISTS template_items (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checklist assignments (Which template applies to which object)
CREATE TABLE IF NOT EXISTS checklist_assignments (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  object_id INTEGER REFERENCES objects(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE,
  assigned_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_assignment UNIQUE NULLS NOT DISTINCT (template_id, object_id)
);

-- Active checklists (Assigned to cleaners for specific shifts)
CREATE TABLE IF NOT EXISTS active_checklists (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES checklist_templates(id),
  object_id INTEGER NOT NULL REFERENCES objects(id),
  assigned_to INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed'))
);

-- Checklist progress tracking
CREATE TABLE IF NOT EXISTS checklist_progress (
  id SERIAL PRIMARY KEY,
  checklist_id INTEGER NOT NULL REFERENCES active_checklists(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES template_items(id),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(512) NOT NULL UNIQUE,
  auth_key VARCHAR(256) NOT NULL,
  p256dh_key VARCHAR(256) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  checklist_id INTEGER REFERENCES active_checklists(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50),
  scheduled_for TIMESTAMP,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User locations (for geolocation)
CREATE TABLE IF NOT EXISTS user_locations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Browser fingerprints for remembering devices
CREATE TABLE IF NOT EXISTS browser_fingerprints (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fingerprint_hash VARCHAR(256) NOT NULL UNIQUE,
  device_name VARCHAR(255),
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approval requests for new users and password resets
CREATE TABLE IF NOT EXISTS approval_requests (
  id SERIAL PRIMARY KEY,
  requested_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  requested_from_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL,
  user_data JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  rejection_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  CONSTRAINT valid_request_type CHECK (request_type IN ('new_user', 'password_reset', 'data_edit'))
);

-- Shift locations for geolocation tracking
CREATE TABLE IF NOT EXISTS shift_locations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checklist_id INTEGER REFERENCES checklists(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_objects_partner_id ON objects(partner_id);
CREATE INDEX IF NOT EXISTS idx_objects_created_by ON objects(created_by);
CREATE INDEX IF NOT EXISTS idx_checklist_templates_created_by ON checklist_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_template_items_template_id ON template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_checklist_assignments_template_id ON checklist_assignments(template_id);
CREATE INDEX IF NOT EXISTS idx_checklist_assignments_object_id ON checklist_assignments(object_id);
CREATE INDEX IF NOT EXISTS idx_active_checklists_assigned_to ON active_checklists(assigned_to);
CREATE INDEX IF NOT EXISTS idx_active_checklists_assigned_by ON active_checklists(assigned_by);
CREATE INDEX IF NOT EXISTS idx_active_checklists_status ON active_checklists(status);
CREATE INDEX IF NOT EXISTS idx_checklist_progress_checklist_id ON checklist_progress(checklist_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_unique_checklist_type_user
ON notifications(user_id, checklist_id, notification_type)
WHERE checklist_id IS NOT NULL AND notification_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_iin ON users(iin);
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_browser_fingerprints_user_id ON browser_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_from ON approval_requests(requested_from_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_by ON approval_requests(requested_by_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_shift_locations_user_id ON shift_locations(user_id);
