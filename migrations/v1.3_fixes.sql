-- PHASE 6 Fixes Migration

-- 6.1 Update role constraint
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT; -- Ensure it exists
DO $$ 
BEGIN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'salesman', 'customer'));

-- 6.2 Soft Deletes
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 6.4 Broadcast Messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_broadcast BOOLEAN DEFAULT FALSE;

-- 6.12 Rename image to image_url
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'image'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE products RENAME COLUMN image TO image_url;
    END IF;
END $$;

-- 6.8 Activity Logs Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_orders_sales_rep ON orders(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id);

-- Optional: Prevent Hard Delete trigger logic
CREATE OR REPLACE FUNCTION prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Hard deletes are disabled. Use is_active = FALSE for soft delete instead.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply to users and customers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trig_prevent_delete_users') THEN
        CREATE TRIGGER trig_prevent_delete_users 
        BEFORE DELETE ON users 
        FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trig_prevent_delete_customers') THEN
        CREATE TRIGGER trig_prevent_delete_customers 
        BEFORE DELETE ON customers 
        FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();
    END IF;
END $$;
