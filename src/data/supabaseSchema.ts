export const SUPABASE_SCHEMA_SQL = `-- ==========================================
-- Softrova App Store — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Default Categories
INSERT INTO public.categories (name) VALUES
    ('AI'),
    ('Productivity'),
    ('Games'),
    ('Tools'),
    ('Security'),
    ('Design')
ON CONFLICT (name) DO NOTHING;

-- 3. Create Applications Table
CREATE TABLE IF NOT EXISTS public.apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    short_description TEXT,
    full_description TEXT,
    developer TEXT DEFAULT 'Softrova Official',
    verified BOOLEAN DEFAULT true,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    category TEXT NOT NULL,
    badge TEXT,
    featured BOOLEAN DEFAULT false,
    hero_headline TEXT,
    hero_subheadline TEXT,
    price TEXT DEFAULT 'Free',
    size TEXT DEFAULT '45 MB',
    version TEXT DEFAULT '1.0.0',
    icon_bg TEXT DEFAULT 'from-cyan-400 via-blue-600 to-indigo-950',
    icon_type TEXT DEFAULT 'sparkles',
    icon_url TEXT,
    accent_glow TEXT DEFAULT 'rgba(0, 229, 255, 0.6)',
    screenshots JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    changelog JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '{}'::jsonb,
    download_url TEXT DEFAULT '#',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    tagline TEXT,
    support_email TEXT,
    copyright_text TEXT,
    socials JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Open Access & Full Admin Control (Disables RLS row filtering so deletes & edits always succeed)
ALTER TABLE public.apps DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;

-- Fallback permissive policies in case RLS is re-enabled
DROP POLICY IF EXISTS "Allow All Apps" ON public.apps;
CREATE POLICY "Allow All Apps" ON public.apps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Categories" ON public.categories;
CREATE POLICY "Allow All Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Settings" ON public.site_settings;
CREATE POLICY "Allow All Settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- 8. Storage Buckets Creation (for App Icons, Screenshots, and Binaries)
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('app-icons', 'app-icons', true),
    ('app-screenshots', 'app-screenshots', true),
    ('app-binaries', 'app-binaries', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Public Can View Media
DROP POLICY IF EXISTS "Public Access App Icons" ON storage.objects;
CREATE POLICY "Public Access App Icons" ON storage.objects
    FOR SELECT USING (bucket_id = 'app-icons');

DROP POLICY IF EXISTS "Public Access App Screenshots" ON storage.objects;
CREATE POLICY "Public Access App Screenshots" ON storage.objects
    FOR SELECT USING (bucket_id = 'app-screenshots');

DROP POLICY IF EXISTS "Public Access App Binaries" ON storage.objects;
CREATE POLICY "Public Access App Binaries" ON storage.objects
    FOR SELECT USING (bucket_id = 'app-binaries');

-- Storage Policies: Only Authenticated Admins Can Upload & Delete
DROP POLICY IF EXISTS "Admin Upload App Icons" ON storage.objects;
CREATE POLICY "Admin Upload App Icons" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'app-icons' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Upload App Screenshots" ON storage.objects;
CREATE POLICY "Admin Upload App Screenshots" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'app-screenshots' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Upload App Binaries" ON storage.objects;
CREATE POLICY "Admin Upload App Binaries" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'app-binaries' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete Storage Objects" ON storage.objects;
CREATE POLICY "Admin Delete Storage Objects" ON storage.objects
    FOR DELETE USING (auth.role() = 'authenticated');
`;
