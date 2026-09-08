/*
# Create household_inventory table

1. New Tables
- `household_inventory`
  - `id` (text, primary key) — stores crypto.randomUUID() strings from the browser
  - `sync_id` (text, not null) — household sync code used for RLS isolation
  - `item_name_en` (text) — encrypted English item name
  - `item_name_zh` (text) — encrypted Chinese item name
  - `brand_name` (text) — encrypted brand name
  - `category` (text, not null)
  - `location` (text, not null)
  - `quantity` (integer, not null, default 1)
  - `low_stock_threshold` (integer, default 1)
  - `expiration_date` (date, nullable)
  - `purchase_date` (date, nullable)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `household_inventory`.
- Four policies (SELECT/INSERT/UPDATE/DELETE) scoped to `anon, authenticated`.
- Each policy checks that the request's `x-household-sync-id` header matches the row's `sync_id` column.
- This provides per-household isolation without user accounts.

3. Important Notes
- No user accounts / auth — this is a no-auth app.
- The `sync_id` column acts as the household identifier, passed via the `x-household-sync-id` request header.
- RLS policies use `current_setting('request.header.x-household-sync-id', true)` to read the header value.
*/

CREATE TABLE IF NOT EXISTS household_inventory (
  id text PRIMARY KEY,
  sync_id text NOT NULL,
  item_name_en text DEFAULT '',
  item_name_zh text DEFAULT '',
  brand_name text DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  location text NOT NULL DEFAULT 'Home',
  quantity integer NOT NULL DEFAULT 1,
  low_stock_threshold integer NOT NULL DEFAULT 1,
  expiration_date date,
  purchase_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_household_inventory_sync_id ON household_inventory(sync_id);

ALTER TABLE household_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_household_inventory" ON household_inventory;
CREATE POLICY "anon_select_household_inventory"
ON household_inventory FOR SELECT
TO anon, authenticated
USING (sync_id = current_setting('request.header.x-household-sync-id', true));

DROP POLICY IF EXISTS "anon_insert_household_inventory" ON household_inventory;
CREATE POLICY "anon_insert_household_inventory"
ON household_inventory FOR INSERT
TO anon, authenticated
WITH CHECK (sync_id = current_setting('request.header.x-household-sync-id', true));

DROP POLICY IF EXISTS "anon_update_household_inventory" ON household_inventory;
CREATE POLICY "anon_update_household_inventory"
ON household_inventory FOR UPDATE
TO anon, authenticated
USING (sync_id = current_setting('request.header.x-household-sync-id', true))
WITH CHECK (sync_id = current_setting('request.header.x-household-sync-id', true));

DROP POLICY IF EXISTS "anon_delete_household_inventory" ON household_inventory;
CREATE POLICY "anon_delete_household_inventory"
ON household_inventory FOR DELETE
TO anon, authenticated
USING (sync_id = current_setting('request.header.x-household-sync-id', true));