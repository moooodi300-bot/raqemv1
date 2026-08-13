-- ============================================================================
-- Migration: Complete RLS Security Fix & Strict Tenant Isolation
-- File: fix_rls_security.sql
-- Description: Enables RLS on all public schema tables, secures functions,
--              cleans up loose policies, and establishes strict multi-tenant
--              RLS isolation policies for SELECT, INSERT, UPDATE, and DELETE.
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

REVOKE EXECUTE ON FUNCTION public.get_current_user_tenant_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_tenant_id() TO authenticated;

-- 2. Helper event trigger function: Auto-enable RLS on future tables
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

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- 3. Dynamic PL/pgSQL block to enable RLS and apply strict tenant policies on all tables
DO $$
DECLARE
  r RECORD;
  pol RECORD;
  target_table TEXT;
  has_tenant_col BOOLEAN;
BEGIN
  -- Loop through all base tables in the public schema
  FOR r IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
  LOOP
    target_table := r.table_name;
    
    -- Step A: Enable Row Level Security
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', target_table);

    -- Step B: Drop loose/unrestricted/overly permissive existing policies
    FOR pol IN
      SELECT policyname 
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = target_table
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, target_table);
    END LOOP;

    -- Step C: Check if tenant_id column exists
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = target_table 
        AND column_name = 'tenant_id'
    ) INTO has_tenant_col;

    -- Step D: Create strict tenant isolation policies
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
      -- Standard authenticated full access fallback for global/lookup tables without tenant_id
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

    -- Revoke all permissions from anon role on business tables
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, PUBLIC;', target_table);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', target_table);

  END LOOP;
END $$;
