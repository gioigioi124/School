-- Seed file for Supabase PostgreSQL
-- Populate initial application roles

INSERT INTO roles (id, name, description)
VALUES 
  (gen_random_uuid(), 'admin', 'System Administrator'),
  (gen_random_uuid(), 'teacher', 'Teacher'),
  (gen_random_uuid(), 'student', 'Student'),
  (gen_random_uuid(), 'parent', 'Parent')
ON CONFLICT (name) DO NOTHING;
