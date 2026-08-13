-- ============================================================================
-- Migration: Complete Multi-Tenant RLS Security Fix & Strict Tenant Isolation
-- File: supabase/migrations/20250215_fix_multitenant_rls_security.sql
-- Description: Enables RLS across all public tables, removes insecure anon policies
--              (such as anon_all_*), secures functions, and enforces strict tenant
--              isolation policies for SELECT, INSERT, UPDATE, and DELETE.
-- ============================================================================

-- 1. Helper function: Retrieve authenticated user's tenant_id safely
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id 
  FROM public.staff 
  WHERE auth_user_id = auth.uid() 
  LIMIT 1;
$$;

-- Revoke execute on helper function from PUBLIC and anon roles
REVOKE EXECUTE ON FUNCTION public.get_current_user_tenant_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_tenant_id() TO authenticated;

-- 2. Helper event trigger function: Auto-enable RLS on any future tables
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE TABLE' LOOP
    IF obj.schema_name = 'public' THEN
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', obj.schema_name, obj.object_identity);
    END IF;
  END LOOP;
END;
$$;

-- Revoke execution of rls_auto_enable from all non-superusers
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- 3. Explicitly enable Row Level Security on all known business & tenant tables
ALTER TABLE IF EXISTS public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cost_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fleet_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mobile_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mobile_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mobile_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mobile_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.purchase_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicles ENABLE ROW LEVEL SECURITY;

-- 4. Dynamic PL/pgSQL block to audit, clean up loose policies, and enforce tenant isolation
DO $$
DECLARE
  r RECORD;
  pol RECORD;
  target_table TEXT;
  has_tenant_col BOOLEAN;
BEGIN
  -- Iterate through all base tables in the public schema
  FOR r IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
  LOOP
    target_table := r.table_name;
    
    -- Ensure RLS is enabled
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', target_table);

    -- Remove all existing policies (including insecure anon_all_* or loose USING (true) policies)
    FOR pol IN
      SELECT policyname 
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = target_table
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, target_table);
    END LOOP;

    -- Check if tenant_id column exists on this table
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = target_table 
        AND column_name = 'tenant_id'
    ) INTO has_tenant_col;

    -- Create strict tenant isolation policies for authenticated users
    IF has_tenant_col THEN
      -- SELECT Policy
      EXECUTE format('
        CREATE POLICY "tenant_isolation_select" ON public.%I
        FOR SELECT TO authenticated
        USING (tenant_id = public.get_current_user_tenant_id() OR tenant_id IS NULL);
      ', target_table);

      -- INSERT Policy
      EXECUTE format('
        CREATE POLICY "tenant_isolation_insert" ON public.%I
        FOR INSERT TO authenticated
        WITH CHECK (tenant_id = public.get_current_user_tenant_id() OR tenant_id IS NULL);
      ', target_table);

      -- UPDATE Policy
      EXECUTE format('
        CREATE POLICY "tenant_isolation_update" ON public.%I
        FOR UPDATE TO authenticated
        USING (tenant_id = public.get_current_user_tenant_id() OR tenant_id IS NULL)
        WITH CHECK (tenant_id = public.get_current_user_tenant_id() OR tenant_id IS NULL);
      ', target_table);

      -- DELETE Policy
      EXECUTE format('
        CREATE POLICY "tenant_isolation_delete" ON public.%I
        FOR DELETE TO authenticated
        USING (tenant_id = public.get_current_user_tenant_id() OR tenant_id IS NULL);
      ', target_table);
    ELSE
      -- Fallback policy for global reference lookup tables without tenant_id
      EXECUTE format('
        CREATE POLICY "authenticated_select_policy" ON public.%I
        FOR SELECT TO authenticated
        USING (true);
      ', target_table);

      EXECUTE format('
        CREATE POLICY "authenticated_all_policy" ON public.%I
        FOR ALL TO authenticated
        USING (true)
        WITH CHECK (true);
      ', target_table);
    END IF;

    -- Revoke table access from anonymous / public users
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, PUBLIC;', target_table);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', target_table);

  END LOOP;
END $$;
