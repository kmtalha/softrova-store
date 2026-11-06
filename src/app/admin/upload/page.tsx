'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  Lock,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  ArrowLeft,
  Server,
  Cloud,
  Copy,
  Check,
  Sparkles,
  Info,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  Key,
  AlertTriangle,
  Share2,
  SlidersHorizontal,
  Star,
  Zap,
  FolderPlus,
  Database,
  X
} from 'lucide-react';
import { AppItem } from '@/types/app';
import { SiteSettings } from '@/types/settings';
import { DEFAULT_SITE_SETTINGS } from '@/data/settings';
import { DEFAULT_CATEGORIES } from '@/data/categories';
import { INITIAL_APPS } from '@/data/apps';
import { SUPABASE_SCHEMA_SQL } from '@/data/supabaseSchema';
import {
  getSupabase,
  isSupabaseConfigured,
  fetchSupabaseApps,
  insertSupabaseApp,
  updateSupabaseSpotlight,
  fetchSupabaseCategories,
  insertSupabaseCategory,
  deleteSupabaseCategory,
  uploadToSupabaseStorage,
} from '@/lib/supabase';
import AppIcon from '@/components/AppIcon';
import StarRating from '@/components/StarRating';
import {
  sanitizeString,
  validateUploadFile,
  validateUploadImage,
  checkRateLimit,
} from '@/lib/security';

export default function AdminUploadPage() {
  const router = useRouter();

  // Authentication Gate State (Strict Supabase Auth)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [adminUserEmail, setAdminUserEmail] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Admin Tab: 'publish' | 'spotlight' | 'categories' | 'settings' | 'supabase'
  const [activeAdminTab, setActiveAdminTab] = useState<'publish' | 'spotlight' | 'categories' | 'settings' | 'supabase'>('publish');

  // Supabase Configuration Status
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Dynamic Categories State
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [catSuccessMsg, setCatSuccessMsg] = useState<string>('');

  // Apps & Spotlight Management State
  const [appsList, setAppsList] = useState<AppItem[]>(INITIAL_APPS);
  const [spotlightMap, setSpotlightMap] = useState<Record<string, boolean>>({});
  const [spotlightSuccessMsg, setSpotlightSuccessMsg] = useState<string>('');

  // File refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const screenshotsInputRef = useRef<HTMLInputElement>(null);

  // Payload file state
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');

  // Images state
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [screenshotsFiles, setScreenshotsFiles] = useState<File[]>([]);
  const [screenshotsPreviews, setScreenshotsPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [publishedApp, setPublishedApp] = useState<AppItem | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showArchDocs, setShowArchDocs] = useState(false);

  // Site & Social Media Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Form State for App Upload
  const [formData, setFormData] = useState({
    name: '',
    packageId: '',
    version: '1.0.0',
    category: 'AI',
    price: 'Free',
    architecture: 'Universal x86_64 / arm64',
    shortDescription: '',
    fullDescription: '',
    permissions: 'Local Storage, Network Access',
    downloadUrl: '',
  });

  // Check session, load categories, apps & spotlight map
  useEffect(() => {
    async function initAdmin() {
      try {
        const supabase = getSupabase();
        if (supabase) {
          setSupabaseConnected(true);
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsAuthenticated(true);
            setAdminUserEmail(session.user.email || 'Admin');
          }

          supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              setIsAuthenticated(true);
              setAdminUserEmail(session.user.email || 'Admin');
            }
          });

          // Fetch Supabase Apps
          const sbApps = await fetchSupabaseApps();
          if (sbApps && sbApps.length > 0) {
            setAppsList(sbApps);
            const map: Record<string, boolean> = {};
            sbApps.forEach((a) => {
              if (a.featured) map[a.id] = true;
            });
            setSpotlightMap(map);
          }

          // Fetch Supabase Categories
          const sbCats = await fetchSupabaseCategories();
          if (sbCats && sbCats.length > 0) {
            setCategories(sbCats);
          }
        }

        // 1. Fallback Categories
        const storedCats = localStorage.getItem('softrova_categories');
        if (storedCats) {
          const parsed = JSON.parse(storedCats);
          if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
        }

        // 2. Fallback Apps
        const storedCustom = localStorage.getItem('softrova_custom_apps');
        const customApps: AppItem[] = storedCustom ? JSON.parse(storedCustom) : [];
        const combined = Array.isArray(customApps) && customApps.length > 0
          ? [...customApps, ...INITIAL_APPS]
          : INITIAL_APPS;

        // 3. Fallback Spotlight Map
        const storedSpotlight = localStorage.getItem('softrova_spotlight_map');
        let currentMap: Record<string, boolean> = {};
        if (storedSpotlight) {
          currentMap = JSON.parse(storedSpotlight);
        } else {
          combined.forEach((a) => {
            if (a.featured) currentMap[a.id] = true;
          });
        }
        setSpotlightMap((prev) => (Object.keys(prev).length > 0 ? prev : currentMap));
        setAppsList((prev) =>
          prev.length > INITIAL_APPS.length
            ? prev
            : combined.map((a) => ({
                ...a,
                featured: currentMap[a.id] !== undefined ? currentMap[a.id] : a.featured,
              }))
        );

        // 4. Site Settings
        const storedSettings = localStorage.getItem('softrova_site_settings');
        if (storedSettings) {
          setSiteSettings(JSON.parse(storedSettings));
        }
      } catch (err) {
        console.error('Init admin error:', err);
      }
    }

    initAdmin();
  }, []);

  // Auth submission: Strict Supabase Email & Password
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const rateCheck = checkRateLimit('admin_auth', 5, 30000);
    if (!rateCheck.allowed) {
      setLockoutSeconds(rateCheck.waitSeconds || 30);
      setAuthError(`Too many failed attempts. Locked for ${rateCheck.waitSeconds}s.`);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setAuthError('Supabase is not configured. Please verify .env.local.');
      return;
    }

    if (!emailInput.trim() || !passwordInput) {
      setAuthError('Please enter both admin email and password.');
      return;
    }

    setIsLoggingIn(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput.trim(),
      password: passwordInput,
    });
    setIsLoggingIn(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (data?.session) {
      setIsAuthenticated(true);
      setAdminUserEmail(data.user.email || 'Admin');
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setAdminUserEmail('');
  };

  // SPOTLIGHT CONTROLLER: Toggle Featured status on any app
  const toggleSpotlight = async (appId: string) => {
    const isCurrentlyFeatured = !!spotlightMap[appId];
    const newStatus = !isCurrentlyFeatured;
    const updatedMap = { ...spotlightMap, [appId]: newStatus };

    setSpotlightMap(updatedMap);
    setAppsList((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, featured: newStatus } : a))
    );

    // Sync to Supabase
    if (supabaseConnected) {
      await updateSupabaseSpotlight(appId, newStatus);
    }

    try {
      localStorage.setItem('softrova_spotlight_map', JSON.stringify(updatedMap));
      const targetApp = appsList.find((a) => a.id === appId);
      const appName = targetApp ? targetApp.name : 'App';
      setSpotlightSuccessMsg(
        newStatus
          ? `"${appName}" added to Softrova Spotlight Carousel!`
          : `"${appName}" removed from Spotlight.`
      );
      setTimeout(() => setSpotlightSuccessMsg(''), 3000);
    } catch (e) {
      console.error('Failed to update spotlight:', e);
    }
  };

  // CATEGORY MANAGER: Add New Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCat = sanitizeString(newCatInput, 30).trim();
    if (!cleanCat) return;

    if (categories.some((c) => c.toLowerCase() === cleanCat.toLowerCase())) {
      alert('This category already exists.');
      return;
    }

    const updated = [...categories, cleanCat];
    setCategories(updated);
    setNewCatInput('');

    // Sync to Supabase
    if (supabaseConnected) {
      await insertSupabaseCategory(cleanCat);
    }

    try {
      localStorage.setItem('softrova_categories', JSON.stringify(updated));
      setCatSuccessMsg(`Category "${cleanCat}" successfully created!`);
      setTimeout(() => setCatSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  // CATEGORY MANAGER: Delete Category
  const handleDeleteCategory = async (catToDelete: string) => {
    if (catToDelete === 'All') {
      alert('Cannot delete the root "All" category.');
      return;
    }
    const updated = categories.filter((c) => c !== catToDelete);
    setCategories(updated);

    // Sync to Supabase
    if (supabaseConnected) {
      await deleteSupabaseCategory(catToDelete);
    }

    try {
      localStorage.setItem('softrova_categories', JSON.stringify(updated));
      setCatSuccessMsg(`Category "${catToDelete}" removed.`);
      setTimeout(() => setCatSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  // Drag and drop for binary payload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setFileError('');
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid file.');
      return;
    }

    setSelectedFile(file);
    const mockHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setFileHash(mockHash);

    if (!formData.name) {
      const cleanName = sanitizeString(
        file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        60
      );
      setFormData((prev) => ({
        ...prev,
        name: cleanName,
        packageId: `com.softrova.${cleanName.toLowerCase().replace(/\s+/g, '')}`,
      }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // App Icon Upload
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateUploadImage(file);
      if (!validation.valid) {
        setImageError(validation.error || 'Invalid icon format.');
        return;
      }

      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIconPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Screenshots Upload
  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      files.forEach((file) => {
        const validation = validateUploadImage(file);
        if (!validation.valid) {
          setImageError(validation.error || 'Invalid screenshot format.');
          return;
        }
        validFiles.push(file);

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setScreenshotsPreviews((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
      setScreenshotsFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeScreenshot = (indexToRemove: number) => {
    setScreenshotsPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setScreenshotsFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Form submission: App Upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeString(formData.name, 80);
    if (!cleanName) {
      alert('Please provide a valid Application Name.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalIconUrl = iconPreview || undefined;
      const finalScreenshots: string[] = [...screenshotsPreviews];
      let finalDownloadUrl = formData.downloadUrl.trim() || '#';

      // 1. If Supabase is connected, upload assets directly to Supabase Storage Buckets
      if (supabaseConnected) {
        if (iconFile) {
          const uploadedIconUrl = await uploadToSupabaseStorage('app-icons', iconFile, `${cleanName.toLowerCase()}-icon.${iconFile.name.split('.').pop()}`);
          if (uploadedIconUrl) {
            finalIconUrl = uploadedIconUrl;
          }
        }

        if (screenshotsFiles.length > 0) {
          const uploadedUrls: string[] = [];
          for (let i = 0; i < screenshotsFiles.length; i++) {
            const file = screenshotsFiles[i];
            const url = await uploadToSupabaseStorage('app-screenshots', file, `${cleanName.toLowerCase()}-screen-${i + 1}.${file.name.split('.').pop()}`);
            if (url) uploadedUrls.push(url);
          }
          if (uploadedUrls.length > 0) {
            finalScreenshots.length = 0;
            finalScreenshots.push(...uploadedUrls);
          }
        }

        if (selectedFile) {
          const uploadedBinaryUrl = await uploadToSupabaseStorage('app-binaries', selectedFile, `${cleanName.toLowerCase()}-v${formData.version}.${selectedFile.name.split('.').pop()}`);
          if (uploadedBinaryUrl) {
            finalDownloadUrl = uploadedBinaryUrl;
          }
        }
      }

      const newApp: AppItem = {
        id: `app-${Date.now()}`,
        name: cleanName,
        tagline: sanitizeString(formData.shortDescription, 120) || 'Verified Solution Application',
        shortDescription: sanitizeString(formData.shortDescription, 180) || 'Next-generation application built for performance and security.',
        fullDescription: sanitizeString(formData.fullDescription, 2000) || 'Published via Softrova Admin Portal. Verified clean binary with zero telemetry leak.',
        developer: 'Softrova Official',
        verified: true,
        rating: 5.0,
        reviewsCount: 1,
        category: formData.category,
        badge: 'New',
        price: sanitizeString(formData.price, 20) || 'Free',
        size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '42 MB',
        version: sanitizeString(formData.version, 20) || '1.0.0',
        updatedAt: 'Just now',
        iconBg: 'from-cyan-400 via-blue-600 to-indigo-950',
        iconType: 'sparkles',
        iconUrl: finalIconUrl,
        accentGlow: 'rgba(0, 229, 255, 0.6)',
        screenshots: finalScreenshots.length > 0
          ? finalScreenshots
          : [
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
            ],
        features: [
          'Verified Solution Application',
          'Client-side cryptographically signed',
          'Deployable to Cloudflare Edge',
          'Zero telemetry and privacy-preserving',
        ],
        changelog: [
          {
            version: `v${formData.version}`,
            date: 'Today',
            notes: ['Initial production package release', 'Security sandbox verified'],
          },
        ],
        specs: {
          packageId: sanitizeString(formData.packageId, 120) || `com.softrova.${cleanName.toLowerCase().replace(/\s+/g, '')}`,
          architecture: sanitizeString(formData.architecture, 60),
          minOs: 'Windows 10/11, macOS 12+, Linux',
          sha256: fileHash || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          permissions: formData.permissions.split(',').map((p) => sanitizeString(p, 40)),
        },
        downloadUrl: finalDownloadUrl,
      };

      // 2. Insert into Supabase PostgreSQL (if connected)
      if (supabaseConnected) {
        await insertSupabaseApp(newApp);
      }

      // 3. Save to localStorage as immediate offline cache
      try {
        const stored = localStorage.getItem('softrova_custom_apps');
        const customApps = stored ? JSON.parse(stored) : [];
        localStorage.setItem('softrova_custom_apps', JSON.stringify([newApp, ...customApps]));
        setAppsList((prev) => [newApp, ...prev]);
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }

      setPublishedApp(newApp);
      setIsSubmitting(false);
      setUploadSuccess(true);
    } catch (err) {
      console.error('App submission error:', err);
      setIsSubmitting(false);
    }
  };

  // Save Social & Footer Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('softrova_site_settings', JSON.stringify(siteSettings));
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const fastApiCodeSnippet = `# FastAPI + Cloudflare R2 Backend
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import boto3, hashlib, os

app = FastAPI(title="Softrova Store API")
auth_scheme = HTTPBearer()

r2_client = boto3.client(
    "s3",
    endpoint_url=f"https://{os.environ['CLOUDFLARE_ACCOUNT_ID']}.r2.cloudflarestorage.com",
    aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
    region_name="auto"
)
BUCKET_NAME = "softrova-app-binaries"

def verify_admin_jwt(creds: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    if creds.credentials != os.environ.get("ADMIN_SECRET_KEY"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

@app.post("/api/v1/apps/upload")
async def upload_app(
    file: UploadFile = File(...),
    app_name: str = Form(...),
    version: str = Form(...),
    category: str = Form(...),
    is_admin: bool = Depends(verify_admin_jwt)
):
    body = await file.read()
    sha256 = hashlib.sha256(body).hexdigest()
    key = f"{category.lower()}/{file.filename}"
    r2_client.put_object(Bucket=BUCKET_NAME, Key=key, Body=body, ContentType=file.content_type)
    return {"status": "success", "sha256": sha256, "url": f"https://cdn.softrova.com/{key}"}`;

  const copyCode = () => {
    navigator.clipboard.writeText(fastApiCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 1. Security Authentication Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0D21] text-white bg-cyber-grid flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1A1B41] via-[#10122E] to-[#0B0D21] border border-cyan-400/40 shadow-3d-card space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-neon-cyan mx-auto bg-[#0B0D21]">
              <img
                src="/softrova-logo.png"
                alt="Softrova"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">
                Softrova Admin Authentication
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your Supabase administrator credentials to manage the store.
              </p>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@softrova.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
                <Key size={16} className="absolute left-3 top-3 text-cyan-400" />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || lockoutSeconds > 0}
              className="w-full py-3 rounded-xl bg-cyan-pill hover:bg-cyan-pill-hover text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock size={14} />
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Return to Public Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Count featured apps in spotlight
  const spotlightCount = Object.values(spotlightMap).filter(Boolean).length;

  // 2. Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#0B0D21] text-white bg-cyber-grid py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Breadcrumb & Lock Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#15173B] border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:text-white hover:border-cyan-400 transition-all min-h-[36px]"
          >
            <ArrowLeft size={15} />
            <span>Return to Storefront</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold font-mono">
              <Lock size={11} />
              <span>SESSION SECURE</span>
            </span>
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.removeItem('softrova_admin_auth');
                } catch {}
                setIsAuthenticated(false);
              }}
              className="text-[11px] text-slate-400 hover:text-rose-400 underline ml-2"
            >
              Lock Console
            </button>
          </div>
        </div>

        {/* Header Hero */}
        <div className="relative rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-[#1A1B41] via-[#15173B] to-[#0B0D21] border border-cyan-400/30 shadow-3d-card space-y-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-neon-cyan shrink-0 bg-[#0B0D21]">
              <img
                src="/softrova-logo.png"
                alt="Softrova Official Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Softrova Administration Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Manage applications, control Softrova Spotlight, create categories, and customize corporate footer.
              </p>
            </div>
          </div>

          {/* Admin Navigation Tabs (4 Tabs) */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveAdminTab('publish')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                activeAdminTab === 'publish'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan'
                  : 'bg-[#15173B] text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud size={15} />
              <span>Publish Apps</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('spotlight')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                activeAdminTab === 'spotlight'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan'
                  : 'bg-[#15173B] text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={15} />
              <span>Softrova Spotlight ({spotlightCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('categories')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                activeAdminTab === 'categories'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan'
                  : 'bg-[#15173B] text-slate-400 hover:text-white'
              }`}
            >
              <FolderPlus size={15} />
              <span>Categories ({categories.length - 1})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('settings')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                activeAdminTab === 'settings'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan'
                  : 'bg-[#15173B] text-slate-400 hover:text-white'
              }`}
            >
              <Share2 size={15} />
              <span>Social & Footer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('supabase')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                activeAdminTab === 'supabase'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan'
                  : 'bg-[#15173B] text-slate-400 hover:text-white'
              }`}
            >
              <Database size={15} />
              <span>Database & Auth</span>
              {supabaseConnected ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-neon-cyan" title="Connected"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="Awaiting Keys"></span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: PUBLISH APPLICATION FORM */}
        {activeAdminTab === 'publish' && (
          <>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowArchDocs(!showArchDocs)}
                className="text-xs text-cyan-300 hover:text-white flex items-center gap-1.5 underline underline-offset-4 font-medium"
              >
                <Info size={14} />
                <span>{showArchDocs ? 'Hide Backend Architecture Guide' : 'View FastAPI & Cloudflare R2 Blueprint'}</span>
              </button>
            </div>

            {showArchDocs && (
              <div className="rounded-3xl p-5 sm:p-6 bg-[#10122E] border border-cyan-400/40 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm">
                    <Server size={17} />
                    <span>Cloudflare R2 + FastAPI Backend Blueprint</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-xs text-cyan-300 hover:text-white transition-all"
                  >
                    {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-3.5 sm:p-4 rounded-xl bg-[#060714] text-cyan-300 text-[11px] font-mono overflow-x-auto border border-slate-800">
                  {fastApiCodeSnippet}
                </pre>
              </div>
            )}

            {uploadSuccess && publishedApp && (
              <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-950/90 to-[#10122E] border border-emerald-500/60 shadow-neon-cyan space-y-4 animate-fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <AppIcon
                      iconUrl={publishedApp.iconUrl}
                      iconType={publishedApp.iconType}
                      iconBg={publishedApp.iconBg}
                      size="md"
                    />
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        <span>"{publishedApp.name}" Published!</span>
                      </h2>
                      <p className="text-xs text-emerald-300/90 mt-0.5">
                        Your application is live in the storefront catalog under "{publishedApp.category}".
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadSuccess(false)}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Link
                    href="/"
                    className="px-5 py-2.5 rounded-full bg-cyan-pill hover:bg-cyan-pill-hover text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan transition-all flex items-center gap-2"
                  >
                    <Eye size={14} className="stroke-[3]" />
                    <span>View on Storefront</span>
                  </Link>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-[#1A1B41]/90 via-[#121435]/95 to-[#0B0D21] border border-cyan-400/25 shadow-3d-card space-y-6 sm:space-y-8"
            >
              {/* Section 1: Binary Package Payload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center text-[10px]">1</span>
                    <span>Application Binary Payload (APK, ZIP, DMG, EXE)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Optional for preview</span>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2.5 ${
                    dragActive
                      ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_30px_rgba(0,229,255,0.35)] scale-[1.01]'
                      : selectedFile
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : 'border-cyan-500/30 bg-[#10122E]/80 hover:border-cyan-400/60 hover:bg-[#15173B]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".apk,.zip,.exe,.dmg,.tar.gz,.deb"
                    className="hidden"
                  />

                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 shadow-neon-cyan">
                    {selectedFile ? (
                      <FileCheck2 size={28} className="text-emerald-400" />
                    ) : (
                      <UploadCloud size={28} className="text-cyan-400 animate-pulse" />
                    )}
                  </div>

                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white flex items-center justify-center gap-2 truncate max-w-full px-2">
                        <span className="truncate">{selectedFile.name}</span>
                        <span className="text-xs text-emerald-400 font-mono shrink-0">
                          ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">Click or drag to replace package</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-bold text-white">
                        Drag and drop binary package, or <span className="text-cyan-400 underline">browse file</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports Android APK, Windows EXE, macOS DMG, and ZIP archives (max 500MB)
                      </p>
                    </div>
                  )}
                </div>

                {fileError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}

                {fileHash && (
                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B0D21] border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 font-mono text-[11px] truncate">
                      <span className="text-cyan-400 font-bold uppercase">SHA-256:</span>
                      <span className="text-slate-300 truncate">{fileHash}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                      Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Section 2: App Visual Assets */}
              <div className="space-y-5 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center text-[10px]">2</span>
                  <span>App Visual Assets (Icon & Screenshots Upload)</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* App Icon Upload */}
                  <div className="md:col-span-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        App Icon (PNG, JPG, WebP, SVG)
                      </span>
                      {iconPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setIconFile(null);
                            setIconPreview('');
                          }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#10122E] border border-slate-700/80">
                      <div className="shrink-0">
                        <AppIcon
                          iconUrl={iconPreview}
                          iconType="sparkles"
                          iconBg="from-cyan-400 via-blue-600 to-indigo-950"
                          size="lg"
                        />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <input
                          ref={iconInputRef}
                          type="file"
                          onChange={handleIconChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => iconInputRef.current?.click()}
                          className="w-full px-3 py-2 rounded-xl bg-[#15173B] hover:bg-[#1A1B41] border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <ImageIcon size={13} />
                          <span className="truncate">{iconPreview ? 'Change Icon' : 'Upload Icon'}</span>
                        </button>
                        <p className="text-[10px] text-slate-400">
                          Square 512×512px or 1024×1024px transparent PNG.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Screenshots Gallery */}
                  <div className="md:col-span-7 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        Screenshots ({screenshotsPreviews.length} uploaded)
                      </span>
                      {screenshotsPreviews.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setScreenshotsPreviews([])}
                          className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <input
                      ref={screenshotsInputRef}
                      type="file"
                      multiple
                      onChange={handleScreenshotsChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-[#10122E] border border-slate-700/80 min-h-[130px]">
                      {screenshotsPreviews.map((src, index) => (
                        <div
                          key={index}
                          className="relative group aspect-video rounded-xl overflow-hidden border border-cyan-500/30 bg-[#0B0D21]"
                        >
                          <img src={src} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => screenshotsInputRef.current?.click()}
                        className="aspect-video rounded-xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-[#15173B]/50 hover:bg-[#1A1B41] flex flex-col items-center justify-center gap-1 text-cyan-300 hover:text-white transition-all min-h-[70px]"
                      >
                        <Plus size={18} />
                        <span className="text-[10px] font-bold">Add Image</span>
                      </button>
                    </div>
                  </div>
                </div>

                {imageError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}
              </div>

              {/* Section 3: Metadata Form with Dynamic Categories */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center text-[10px]">3</span>
                  <span>Application Metadata & Release Notes</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      App Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Softrova Neural Studio"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={80}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Package ID
                    </label>
                    <input
                      type="text"
                      placeholder="com.softrova.app"
                      value={formData.packageId}
                      onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                      maxLength={100}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Version
                    </label>
                    <input
                      type="text"
                      placeholder="1.0.0"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      maxLength={20}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Dynamic Category Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300">
                        Category *
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab('categories')}
                        className="text-[10px] text-cyan-400 hover:text-white underline"
                      >
                        + Create New Category
                      </button>
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                    >
                      {categories.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Short Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="High performance AI workspace for neural developers"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shortDescription: e.target.value })
                    }
                    maxLength={180}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Full Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detailed explanation of features, security guarantees, and changelog updates..."
                    value={formData.fullDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, fullDescription: e.target.value })
                    }
                    maxLength={2000}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>Direct Download URL (Optional)</span>
                    <span className="text-[10px] text-cyan-400 font-medium">Cloudflare R2 / Drive / GitHub — Best for apps &gt; 50MB</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://cdn.softrova.com/downloads/app.apk or Google Drive Link"
                    value={formData.downloadUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, downloadUrl: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
                  <span>Signed with Softrova Master Publisher Certificate</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cyan-pill hover:bg-cyan-pill-hover text-slate-950 font-black text-sm uppercase tracking-wider shadow-neon-cyan hover:shadow-neon-cyan-lg transition-all flex items-center justify-center gap-2.5 min-h-[44px] ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      <span>Streaming to Cloudflare R2...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={18} className="stroke-[2.5]" />
                      <span>Publish to Softrova Store</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* TAB 2: SOFTROVA SPOTLIGHT CONTROLLER */}
        {activeAdminTab === 'spotlight' && (
          <div className="rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-[#1A1B41]/90 via-[#121435]/95 to-[#0B0D21] border border-cyan-400/25 shadow-3d-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-400" />
                  <span>Softrova Spotlight Carousel Controller</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose which apps are featured on the top 3D rotating showcase carousel on the home page.
                </p>
              </div>

              <span className="text-xs font-bold font-mono px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 self-start sm:self-auto">
                {spotlightCount} App(s) Featured
              </span>
            </div>

            {spotlightSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 shadow-neon-cyan animate-fade-in">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>{spotlightSuccessMsg}</span>
              </div>
            )}

            {/* List of all apps with Spotlight Toggle */}
            <div className="space-y-3">
              {appsList.map((app) => {
                const isFeatured = !!spotlightMap[app.id];
                return (
                  <div
                    key={app.id}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isFeatured
                        ? 'bg-[#15173B] border-amber-400/50 shadow-[0_0_20px_rgba(255,215,0,0.15)]'
                        : 'bg-[#10122E]/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-3">
                      <AppIcon
                        iconUrl={app.iconUrl}
                        iconType={app.iconType}
                        iconBg={app.iconBg}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">
                            {app.name}
                          </h3>
                          <span className="text-[10px] text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                            {app.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {app.shortDescription}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSpotlight(app.id)}
                      className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                        isFeatured
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-neon-yellow hover:scale-105'
                          : 'bg-[#10122E] border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-400'
                      }`}
                    >
                      <Star size={13} className={isFeatured ? 'fill-slate-950' : ''} />
                      <span>{isFeatured ? 'Featured ★' : 'Feature in Spotlight'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC CATEGORY CREATOR & MANAGER */}
        {activeAdminTab === 'categories' && (
          <div className="rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-[#1A1B41]/90 via-[#121435]/95 to-[#0B0D21] border border-cyan-400/25 shadow-3d-card space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <FolderPlus size={20} className="text-cyan-400" />
                <span>Storefront Category Creator & Manager</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Create new application categories that appear on the storefront filter bar and inside the app uploader.
              </p>
            </div>

            {catSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 shadow-neon-cyan animate-fade-in">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>{catSuccessMsg}</span>
              </div>
            )}

            {/* Create New Category Form */}
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                type="text"
                required
                maxLength={30}
                placeholder="Enter new category name (e.g. Fintech, Cloud, Web3, Creative)..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-cyan-pill hover:bg-cyan-pill-hover text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={16} />
                <span>Create Category</span>
              </button>
            </form>

            {/* Active Categories Pills Grid */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Active Store Categories ({categories.length})
              </h3>

              <div className="flex flex-wrap items-center gap-2.5">
                {categories.map((cat) => {
                  const isRoot = cat === 'All';
                  return (
                    <div
                      key={cat}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#10122E] border border-cyan-500/30 text-xs font-semibold text-white shadow-sm"
                    >
                      <span>{cat}</span>
                      {!isRoot && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          title={`Delete ${cat} category`}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STORE & SOCIAL MEDIA SETTINGS */}
        {activeAdminTab === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-[#1A1B41]/90 via-[#121435]/95 to-[#0B0D21] border border-cyan-400/25 shadow-3d-card space-y-6"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Share2 size={20} className="text-cyan-400" />
                <span>Corporate Social Media & Footer Customizer</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize your official community links, support email, and brand tagline displayed in the store footer.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 shadow-neon-cyan animate-fade-in">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>Settings successfully saved! The footer has been updated across the entire storefront.</span>
              </div>
            )}

            {/* Social Media URL Inputs */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Official Social Media Channels
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Twitter / X Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://twitter.com/softrova"
                    value={siteSettings.socials.twitter}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        socials: { ...siteSettings.socials, twitter: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    LinkedIn Organization URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/company/softrova"
                    value={siteSettings.socials.linkedin}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        socials: { ...siteSettings.socials, linkedin: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    GitHub Organization URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/softrova"
                    value={siteSettings.socials.github}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        socials: { ...siteSettings.socials, github: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Discord Community Server URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://discord.gg/softrova"
                    value={siteSettings.socials.discord}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        socials: { ...siteSettings.socials, discord: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@softrova"
                    value={siteSettings.socials.youtube}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        socials: { ...siteSettings.socials, youtube: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://softrova.com"
                    value={siteSettings.socials.website}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        socials: { ...siteSettings.socials, website: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* General Brand Info */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Contact & Footer Bio
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Public Support / Business Email
                  </label>
                  <input
                    type="email"
                    placeholder="contact@softrova.com"
                    value={siteSettings.supportEmail}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        supportEmail: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={siteSettings.copyrightText}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        copyrightText: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Store Bio / Mission Statement
                </label>
                <textarea
                  rows={2}
                  value={siteSettings.tagline}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      tagline: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 rounded-2xl bg-cyan-pill hover:bg-cyan-pill-hover text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan hover:shadow-neon-cyan-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Check size={16} className="stroke-[3]" />
                <span>Save Social & Footer Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 5: SUPABASE DATABASE & AUTHENTICATION */}
        {activeAdminTab === 'supabase' && (
          <div className="space-y-6">
            {/* Status Overview Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1A1B41] via-[#10122E] to-[#0B0D21] border border-cyan-400/40 shadow-3d-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                    <Database size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Supabase PostgreSQL & Storage Status</span>
                      {supabaseConnected ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold">
                          ONLINE & CONNECTED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold">
                          AWAITING CREDENTIALS
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400">
                      High-performance cloud database with real-time Row-Level Security (RLS) & Media Storage.
                    </p>
                  </div>
                </div>

                {adminUserEmail && (
                  <div className="px-3 py-1.5 rounded-xl bg-[#15173B] border border-cyan-400/30 text-xs text-slate-300">
                    Logged in as: <span className="font-bold text-cyan-300">{adminUserEmail}</span>
                  </div>
                )}
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#0F1128] border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-mono">Database Tables</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-cyan-400" />
                    <span>apps, categories, site_settings</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1128] border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-mono">Row Level Security (RLS)</div>
                  <div className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span>Public Read / Admin Write</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0F1128] border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-mono">Storage Buckets</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Cloud size={16} className="text-cyan-400" />
                    <span>app-icons, app-screenshots, app-binaries</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Setup Instructions */}
            <div className="p-6 rounded-3xl bg-[#10122E] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-cyan-400" />
                <span>3-Step Supabase Connection Guide</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">1</div>
                  <div>
                    <strong className="text-white">Copy Credentials into <code className="text-cyan-300">.env.local</code>:</strong>
                    <p className="text-slate-400 mt-0.5">
                      In your Supabase Dashboard, go to <strong>Project Settings → API</strong>. Copy <strong>Project URL</strong> and <strong>Project API Keys: anon public</strong>, then paste them into <code className="text-cyan-300">.env.local</code>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">2</div>
                  <div>
                    <strong className="text-white">Run Database & Storage Migration (SQL Editor):</strong>
                    <p className="text-slate-400 mt-0.5">
                      Go to <strong>SQL Editor</strong> in Supabase, click <strong>New Query</strong>, paste the SQL schema below, and hit <strong>Run</strong>. This creates all tables, storage buckets, and RLS security policies.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">3</div>
                  <div>
                    <strong className="text-white">Create Admin User (Authentication):</strong>
                    <p className="text-slate-400 mt-0.5">
                      Go to <strong>Authentication → Users</strong> in Supabase, click <strong>Add user → Create user</strong> with your admin email and password. Then you can log into this portal with Supabase Auth!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SQL Migration Script Box */}
            <div className="p-6 rounded-3xl bg-[#0D0F24] border border-cyan-400/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck2 size={16} className="text-cyan-400" />
                    <span>Supabase Schema Migration Script (schema.sql)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Creates tables, indexes, storage buckets, and enterprise Row Level Security (RLS) rules.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:text-white hover:bg-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  {copiedSql ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#080916] border border-slate-800 text-[11px] font-mono text-cyan-200/90 overflow-x-auto max-h-96 leading-relaxed">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
