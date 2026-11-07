import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppItem } from '@/types/app';
import { SiteSettings } from '@/types/settings';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    !!supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    !!supabaseAnonKey &&
    supabaseAnonKey.length > 20
  );
};

// Singleton client instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
};

/**
 * Fetch all apps from Supabase
 */
export async function fetchSupabaseApps(): Promise<AppItem[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch apps error:', error.message);
      return null;
    }

    if (!data || data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline || '',
      shortDescription: row.short_description || '',
      fullDescription: row.full_description || '',
      developer: row.developer || 'Softrova Official',
      verified: row.verified ?? true,
      rating: Number(row.rating) || 5.0,
      reviewsCount: Number(row.reviews_count) || 1,
      category: row.category || 'AI',
      badge: row.badge,
      featured: Boolean(row.featured),
      heroHeadline: row.hero_headline,
      heroSubheadline: row.hero_subheadline,
      price: row.price || 'Free',
      size: row.size || '45 MB',
      version: row.version || '1.0.0',
      updatedAt: row.updated_at || 'Recently',
      iconBg: row.icon_bg || 'from-cyan-400 via-blue-600 to-indigo-950',
      iconType: row.icon_type || 'sparkles',
      iconUrl: row.icon_url,
      accentGlow: row.accent_glow || 'rgba(0, 229, 255, 0.6)',
      screenshots: Array.isArray(row.screenshots) ? row.screenshots : [],
      features: Array.isArray(row.features) ? row.features : [],
      changelog: Array.isArray(row.changelog) ? row.changelog : [],
      specs: row.specs || {
        packageId: 'com.softrova.app',
        architecture: 'Universal',
        minOs: 'Windows 10/11, macOS, Linux',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        permissions: ['Local Storage'],
      },
      downloadUrl: row.download_url || '#',
    }));
  } catch (err) {
    console.warn('Supabase exception:', err);
    return null;
  }
}

/**
 * Insert or update an app in Supabase
 */
export async function insertSupabaseApp(app: AppItem): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const payload = {
      id: app.id,
      name: app.name,
      tagline: app.tagline,
      short_description: app.shortDescription,
      full_description: app.fullDescription,
      developer: app.developer,
      verified: app.verified,
      rating: app.rating,
      reviews_count: app.reviewsCount,
      category: app.category,
      badge: app.badge,
      featured: app.featured || false,
      hero_headline: app.heroHeadline,
      hero_subheadline: app.heroSubheadline,
      price: app.price,
      size: app.size,
      version: app.version,
      icon_bg: app.iconBg,
      icon_type: app.iconType,
      icon_url: app.iconUrl,
      accent_glow: app.accentGlow,
      screenshots: app.screenshots,
      features: app.features,
      changelog: app.changelog,
      specs: app.specs,
      download_url: app.downloadUrl,
    };

    const { error } = await supabase.from('apps').upsert(payload);
    if (error) {
      console.error('Failed to insert app into Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Insert app exception:', err);
    return false;
  }
}

/**
 * Toggle spotlight status in Supabase
 */
export async function updateSupabaseSpotlight(appId: string, featured: boolean): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('apps')
      .update({ featured })
      .eq('id', appId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete an app from Supabase
 */
export async function deleteSupabaseApp(appId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('apps').delete().eq('id', appId);
    if (error) {
      console.error('Delete app from Supabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Delete app exception:', err);
    return false;
  }
}

/**
 * Fetch categories from Supabase
 */
export async function fetchSupabaseCategories(): Promise<string[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('name', { ascending: true });

    if (error || !data) return null;
    return ['All', ...data.map((c: any) => c.name)];
  } catch {
    return null;
  }
}

/**
 * Insert new category
 */
export async function insertSupabaseCategory(name: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('categories').insert({ name });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete a category
 */
export async function deleteSupabaseCategory(name: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('categories').delete().eq('name', name);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Admin Authentication Helpers
 */
export async function signInAdminWithEmail(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error('Supabase is not configured.') };
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpAdminWithEmail(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error('Supabase is not configured.') };
  return await supabase.auth.signUp({ email, password });
}

export async function signOutAdmin() {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getAdminUser() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Upload image/file to Supabase Storage Bucket
 */
export async function uploadToSupabaseStorage(
  bucketName: 'app-icons' | 'app-screenshots' | 'app-binaries',
  file: File,
  filename: string
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const cleanPath = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    let contentType = file.type;
    if (bucketName === 'app-binaries' || filename.toLowerCase().endsWith('.apk')) {
      contentType = 'application/vnd.android.package-archive';
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(cleanPath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: contentType || 'application/octet-stream',
      });

    if (error || !data) {
      console.error(`Upload to ${bucketName} error:`, error?.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(cleanPath);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Storage upload exception:', err);
    return null;
  }
}
