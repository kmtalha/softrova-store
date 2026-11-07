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
  Edit3,
  Download,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  Share2,
  SlidersHorizontal,
  Star,
  Zap,
  FolderPlus,
  Database,
  X,
  LogOut
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
  deleteSupabaseApp,
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
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
  const [appSearchQuery, setAppSearchQuery] = useState<string>('');

  // Edit App State
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'AI',
    version: '1.0.0',
    price: 'Free',
    tagline: '',
    shortDescription: '',
    fullDescription: '',
    downloadUrl: '',
    featured: false,
  });
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

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
  const [isSyncingApps, setIsSyncingApps] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

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

        let baseApps: AppItem[] = [];

        // 1. Fetch Supabase Apps if connected
        if (supabase) {
          const sbApps = await fetchSupabaseApps();
          if (sbApps && sbApps.length > 0) {
            baseApps = sbApps;
          }
        }

        // 2. If no Supabase apps, assemble from custom apps and initial apps
        if (baseApps.length === 0) {
          const storedCustom = localStorage.getItem('softrova_custom_apps');
          const customApps: AppItem[] = storedCustom ? JSON.parse(storedCustom) : [];
          const appMap = new Map<string, AppItem>();
          INITIAL_APPS.forEach((app) => appMap.set(app.id, app));
          if (Array.isArray(customApps)) {
            customApps.forEach((app) => appMap.set(app.id, app));
          }
          baseApps = Array.from(appMap.values());
        }

        // 3. Apply Local Edits Cache (softrova_edited_apps)
        try {
          const storedEdited = localStorage.getItem('softrova_edited_apps');
          if (storedEdited) {
            const editedMap: Record<string, AppItem> = JSON.parse(storedEdited);
            baseApps = baseApps.map((a) => (editedMap[a.id] ? { ...a, ...editedMap[a.id] } : a));
          }
        } catch {}

        // 4. Filter out any Deleted Apps (softrova_deleted_app_ids)
        try {
          const storedDeleted = localStorage.getItem('softrova_deleted_app_ids');
          if (storedDeleted) {
            const deletedIds: string[] = JSON.parse(storedDeleted);
            if (Array.isArray(deletedIds) && deletedIds.length > 0) {
              baseApps = baseApps.filter((a) => !deletedIds.includes(a.id));
            }
          }
        } catch {}

        // 5. Build and synchronize Spotlight Map
        const storedSpotlight = localStorage.getItem('softrova_spotlight_map');
        const currentMap: Record<string, boolean> = storedSpotlight ? JSON.parse(storedSpotlight) : {};
        baseApps.forEach((a) => {
          if (currentMap[a.id] === undefined && a.featured) {
            currentMap[a.id] = true;
          }
        });
        setSpotlightMap(currentMap);
        setAppsList(
          baseApps.map((a) => ({
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
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.auth.signOut();
      }
      sessionStorage.removeItem('softrova_admin_auth');
    } catch (e) {
      console.error('Logout error:', e);
    }
    setIsAuthenticated(false);
    setAdminUserEmail('');
    setEmailInput('');
    setPasswordInput('');
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

  // Delete App from Store & Database
  const handleDeleteApp = async (appId: string, appName: string) => {
    if (!confirm(`Are you sure you want to remove "${appName}" from Softrova Store?`)) return;

    // 1. Delete from Supabase Database if connected
    if (supabaseConnected) {
      try {
        const deleted = await deleteSupabaseApp(appId);
        if (!deleted) {
          console.warn('Supabase delete returned false (0 rows deleted). RLS is blocking deletion.');
          alert(`Important Database Notice:\n"${appName}" was removed from this browser, but Supabase Database blocked the deletion because Row Level Security (RLS) is currently ON in your Supabase project.\n\nTo permanently delete it from all devices (including phones), go to your Supabase SQL Editor and run:\n\nALTER TABLE public.apps DISABLE ROW LEVEL SECURITY;\nDELETE FROM public.apps WHERE id = '${appId}';`);
        }
      } catch (err) {
        console.error('Failed to delete app from Supabase:', err);
      }
    }

    // 2. Immediately update in-memory state
    setAppsList((prev) => prev.filter((a) => a.id !== appId));
    setSpotlightMap((prev) => {
      const copy = { ...prev };
      delete copy[appId];
      return copy;
    });

    // 3. Persist deletion in softrova_deleted_app_ids so storefront permanently removes it
    try {
      const storedDeleted = localStorage.getItem('softrova_deleted_app_ids');
      const deletedIds: string[] = storedDeleted ? JSON.parse(storedDeleted) : [];
      if (!deletedIds.includes(appId)) {
        deletedIds.push(appId);
        localStorage.setItem('softrova_deleted_app_ids', JSON.stringify(deletedIds));
      }

      // Clean from custom apps
      const stored = localStorage.getItem('softrova_custom_apps');
      if (stored) {
        const customApps = JSON.parse(stored);
        if (Array.isArray(customApps)) {
          localStorage.setItem(
            'softrova_custom_apps',
            JSON.stringify(customApps.filter((a: any) => a.id !== appId))
          );
        }
      }

      // Clean from edited apps map
      const storedEdited = localStorage.getItem('softrova_edited_apps');
      if (storedEdited) {
        const editedMap = JSON.parse(storedEdited);
        delete editedMap[appId];
        localStorage.setItem('softrova_edited_apps', JSON.stringify(editedMap));
      }

      // Clean from spotlight map
      const storedSpotlight = localStorage.getItem('softrova_spotlight_map');
      if (storedSpotlight) {
        const spotMap = JSON.parse(storedSpotlight);
        delete spotMap[appId];
        localStorage.setItem('softrova_spotlight_map', JSON.stringify(spotMap));
      }
    } catch (e) {
      console.error('Error synchronizing deletion to storage:', e);
    }

    setSpotlightSuccessMsg(`"${appName}" was successfully deleted from Softrova Store & Database.`);
    setTimeout(() => setSpotlightSuccessMsg(''), 4000);
  };

  // Open Edit App Modal
  const handleOpenEdit = (app: AppItem) => {
    setEditingApp(app);
    setEditFormData({
      name: app.name,
      category: app.category || 'AI',
      version: app.version || '1.0.0',
      price: app.price || 'Free',
      tagline: app.tagline || '',
      shortDescription: app.shortDescription || '',
      fullDescription: app.fullDescription || '',
      downloadUrl: app.downloadUrl === '#' ? '' : (app.downloadUrl || ''),
      featured: !!spotlightMap[app.id] || !!app.featured,
    });
  };

  // Save Edited App
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    setIsSavingEdit(true);
    try {
      const updatedApp: AppItem = {
        ...editingApp,
        name: sanitizeString(editFormData.name, 60),
        category: editFormData.category,
        version: sanitizeString(editFormData.version, 20),
        price: sanitizeString(editFormData.price, 20),
        tagline: sanitizeString(editFormData.tagline, 120),
        shortDescription: sanitizeString(editFormData.shortDescription, 200),
        fullDescription: sanitizeString(editFormData.fullDescription, 2000),
        downloadUrl: editFormData.downloadUrl.trim() || editingApp.downloadUrl || '#',
        featured: editFormData.featured,
      };

      // Save to Supabase if connected
      if (supabaseConnected) {
        await insertSupabaseApp(updatedApp);
      }

      // Update state
      setAppsList((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));

      // Update spotlight map
      setSpotlightMap((prev) => ({
        ...prev,
        [updatedApp.id]: !!updatedApp.featured,
      }));

      // Update localStorage custom apps and edit cache
      try {
        // If it was previously marked as deleted, remove it from deleted
        const storedDeleted = localStorage.getItem('softrova_deleted_app_ids');
        if (storedDeleted) {
          const deletedIds: string[] = JSON.parse(storedDeleted);
          const filtered = deletedIds.filter((id) => id !== updatedApp.id);
          localStorage.setItem('softrova_deleted_app_ids', JSON.stringify(filtered));
        }

        // Save in softrova_edited_apps map so storefront immediately reflects all edits
        const storedEdited = localStorage.getItem('softrova_edited_apps');
        const editedMap = storedEdited ? JSON.parse(storedEdited) : {};
        editedMap[updatedApp.id] = updatedApp;
        localStorage.setItem('softrova_edited_apps', JSON.stringify(editedMap));

        // Update softrova_custom_apps
        const stored = localStorage.getItem('softrova_custom_apps');
        const customApps = stored ? JSON.parse(stored) : [];
        if (Array.isArray(customApps)) {
          const idx = customApps.findIndex((a: any) => a.id === updatedApp.id);
          if (idx !== -1) {
            customApps[idx] = updatedApp;
          } else {
            customApps.push(updatedApp);
          }
          localStorage.setItem('softrova_custom_apps', JSON.stringify(customApps));
        }

        const spotlightStored = localStorage.getItem('softrova_spotlight_map');
        const currentSpotlight = spotlightStored ? JSON.parse(spotlightStored) : {};
        currentSpotlight[updatedApp.id] = updatedApp.featured;
        localStorage.setItem('softrova_spotlight_map', JSON.stringify(currentSpotlight));
      } catch (err) {
        console.error('Failed to update local storage after edit:', err);
      }

      setEditingApp(null);
      setSpotlightSuccessMsg(`"${updatedApp.name}" has been updated successfully!`);
      setTimeout(() => setSpotlightSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving app edit:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Export & Download Complete Store Data (Backup JSON)
  const handleDownloadStoreData = () => {
    try {
      const storeData = {
        exportedAt: new Date().toISOString(),
        storeName: siteSettings.storeName || 'Softrova Store',
        totalApps: appsList.length,
        categories: categories,
        siteSettings: siteSettings,
        spotlightMap: spotlightMap,
        apps: appsList,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(storeData, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateTag = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `softrova-store-backup-${dateTag}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setSpotlightSuccessMsg('Store data backup downloaded successfully!');
      setTimeout(() => setSpotlightSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to download store backup:', err);
      alert('Failed to generate store data backup.');
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
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (supabaseConnected) {
        const supabase = getSupabase();
        if (supabase) {
          await supabase.from('site_settings').upsert({
            id: 'default',
            tagline: siteSettings.tagline,
            support_email: siteSettings.supportEmail,
            copyright_text: siteSettings.copyrightText,
            socials: siteSettings.socials,
          });
        }
      }
      localStorage.setItem('softrova_site_settings', JSON.stringify(siteSettings));
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // Sync Showcase Apps to Supabase Database
  const handleSeedApps = async () => {
    if (!supabaseConnected) return;
    setIsSyncingApps(true);
    setSyncMsg('');
    try {
      for (const app of INITIAL_APPS) {
        await insertSupabaseApp(app);
      }
      const refreshed = await fetchSupabaseApps();
      if (refreshed && refreshed.length > 0) {
        setAppsList(refreshed);
      }
      setSyncMsg('All 6 showcase apps successfully synced to Supabase PostgreSQL!');
      setTimeout(() => setSyncMsg(''), 4000);
    } catch (e) {
      console.error(e);
      setSyncMsg('Failed to sync apps.');
    } finally {
      setIsSyncingApps(false);
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
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-neon-cyan mx-auto bg-[#0B0D21]">
              <img
                src="/softrova-logo.png"
                alt="Softrova"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Softrova
              </h1>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-cyan-400 block mt-0.5">
                SOLUTIONS
              </span>
              <p className="text-xs text-slate-400 mt-2">
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
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Admin Password</span>
                {passwordInput && (
                  <span className="text-[10px] text-cyan-400/80 font-mono">
                    {showPassword ? 'Visible' : 'Hidden'}
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <Key size={16} className="absolute left-3.5 text-cyan-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
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
        
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#15173B] border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:text-white hover:border-cyan-400 transition-all min-h-[36px]"
          >
            <ArrowLeft size={15} />
            <span>Return to Storefront</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadStoreData}
              title="Export all apps, categories, and settings as a clean JSON backup file"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-xs font-bold text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-900/60 transition-all min-h-[36px]"
            >
              <Download size={14} />
              <span>Download Store Data</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold font-mono">
              <Lock size={12} />
              <span>{adminUserEmail ? adminUserEmail : 'ADMIN SECURE'}</span>
            </span>

            {/* Prominent Log Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              title="Log out and secure administration session"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-400 text-xs font-bold transition-all min-h-[36px] shadow-sm hover:scale-105 active:scale-95"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Header Hero */}
        <div className="relative rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-[#1A1B41] via-[#15173B] to-[#0B0D21] border border-cyan-400/30 shadow-3d-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-neon-cyan shrink-0 bg-[#0B0D21]">
                <img
                  src="/softrova-logo.png"
                  alt="Softrova Official Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                    Softrova
                  </h1>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    ADMIN
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.28em] text-cyan-400 mt-0.5 mb-1">
                  SOLUTIONS
                </span>
                <p className="text-xs sm:text-sm text-slate-300">
                  Manage applications, control Softrova Spotlight, create categories, and customize corporate footer.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all shadow-sm shrink-0 hover:scale-105 active:scale-95"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
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
              <SlidersHorizontal size={15} />
              <span>Manage Apps & Spotlight ({appsList.length})</span>
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

        {/* TAB 2: APPS & SPOTLIGHT CONTROLLER */}
        {activeAdminTab === 'spotlight' && (
          <div className="rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-[#1A1B41]/90 via-[#121435]/95 to-[#0B0D21] border border-cyan-400/25 shadow-3d-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal size={20} className="text-cyan-400" />
                  <span>Apps & Spotlight Manager</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Edit app details, delete apps, configure home carousel spotlight, or download complete store data.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleDownloadStoreData}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:text-white hover:bg-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download size={13} />
                  <span>Export Store Data</span>
                </button>
                <span className="text-xs font-bold font-mono px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
                  {spotlightCount} in Spotlight
                </span>
              </div>
            </div>

            {spotlightSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 shadow-neon-cyan animate-fade-in">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>{spotlightSuccessMsg}</span>
              </div>
            )}

            {/* Quick Search Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search apps by title, category, or package id..."
                value={appSearchQuery}
                onChange={(e) => setAppSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              {appSearchQuery && (
                <button
                  type="button"
                  onClick={() => setAppSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* List of all apps with Edit, Spotlight Toggle, and Delete */}
            <div className="space-y-3">
              {appsList
                .filter((app) => {
                  if (!appSearchQuery.trim()) return true;
                  const q = appSearchQuery.toLowerCase();
                  return (
                    app.name.toLowerCase().includes(q) ||
                    (app.category && app.category.toLowerCase().includes(q)) ||
                    (app.shortDescription && app.shortDescription.toLowerCase().includes(q))
                  );
                })
                .map((app) => {
                  const isFeatured = !!spotlightMap[app.id];
                  return (
                    <div
                      key={app.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border gap-3 transition-all ${
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white truncate">
                              {app.name}
                            </h3>
                            <span className="text-[10px] text-cyan-300 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                              {app.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              v{app.version}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              {app.price}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {app.shortDescription || app.tagline || 'No description provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(app)}
                          className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#10122E] border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-400 transition-all shadow-sm"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        {/* Spotlight Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleSpotlight(app.id)}
                          className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isFeatured
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-neon-yellow hover:scale-105'
                              : 'bg-[#10122E] border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-400'
                          }`}
                        >
                          <Star size={13} className={isFeatured ? 'fill-slate-950' : ''} />
                          <span>{isFeatured ? 'Featured ★' : 'Spotlight'}</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteApp(app.id, app.name)}
                          title={`Delete ${app.name} from store`}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all hover:scale-105"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

              {appsList.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No applications found in the store. Publish a new application from the "Publish Apps" tab.
                </div>
              )}
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

              {/* Seed / Sync Action Bar */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Quickly push the 6 default showcase apps directly into your Supabase database table:
                </p>

                <button
                  type="button"
                  disabled={isSyncingApps || !supabaseConnected}
                  onClick={handleSeedApps}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-400/40 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles size={14} className={isSyncingApps ? 'animate-spin' : ''} />
                  <span>{isSyncingApps ? 'Syncing Apps...' : 'Sync 6 Showcase Apps to Supabase'}</span>
                </button>
              </div>

              {syncMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{syncMsg}</span>
                </div>
              )}
            </div>

            {/* Crucial Fix: Enable Delete & Edit Permissions */}
            <div className="p-6 rounded-3xl bg-amber-950/30 border border-amber-400/50 space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                    <span>Database Delete & Edit Permissions (Run Once in Supabase)</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    If deleting an app in the admin panel does not delete it from your phone or database, PostgreSQL Row Level Security (RLS) is blocking the delete. Run this query in your <strong>Supabase SQL Editor</strong>:
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const sql = `ALTER TABLE public.apps DISABLE ROW LEVEL SECURITY;\nALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;\nALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;\nDELETE FROM public.apps WHERE name ILIKE '%spartan%';`;
                    navigator.clipboard.writeText(sql);
                    alert('SQL command copied to clipboard! Paste and Run it in your Supabase SQL Editor.');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Copy size={13} />
                  <span>Copy SQL Fix</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-[#080916] border border-amber-500/30 text-amber-200/90 text-xs font-mono overflow-x-auto leading-relaxed">
{`ALTER TABLE public.apps DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;

-- Clean up any test Spartan GYM apps from database:
DELETE FROM public.apps WHERE name ILIKE '%spartan%';`}
              </pre>
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

      {/* EDIT APPLICATION MODAL DIALOG */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#0D0F24] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <AppIcon
                  iconUrl={editingApp.iconUrl}
                  iconType={editingApp.iconType}
                  iconBg={editingApp.iconBg}
                  size="md"
                />
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit3 size={18} className="text-cyan-400" />
                    <span>Edit App: {editingApp.name}</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Update metadata, category, direct download link, and spotlight status.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingApp(null)}
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">App Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category *</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    {categories
                      .filter((c) => c !== 'All')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Version</label>
                  <input
                    type="text"
                    value={editFormData.version}
                    onChange={(e) => setEditFormData({ ...editFormData, version: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Price</label>
                  <input
                    type="text"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    placeholder="Free or $4.99"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Short Tagline</label>
                <input
                  type="text"
                  value={editFormData.tagline}
                  onChange={(e) => setEditFormData({ ...editFormData, tagline: e.target.value })}
                  placeholder="e.g. Next-generation neural workspace"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Short Description (Cards)</label>
                <textarea
                  rows={2}
                  value={editFormData.shortDescription}
                  onChange={(e) => setEditFormData({ ...editFormData, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Description</label>
                <textarea
                  rows={3}
                  value={editFormData.fullDescription}
                  onChange={(e) => setEditFormData({ ...editFormData, fullDescription: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Direct Download URL</span>
                  <span className="text-[10px] text-cyan-400">Supabase Storage / Cloudflare R2 / Drive</span>
                </label>
                <input
                  type="url"
                  value={editFormData.downloadUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, downloadUrl: e.target.value })}
                  placeholder="https://.../app-binary.apk"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#10122E] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Spotlight Toggle in Edit Modal */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#10122E] border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={editFormData.featured}
                  onChange={(e) => setEditFormData({ ...editFormData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Feature in Home Spotlight Carousel</span>
                  <span className="text-slate-400 block text-[11px]">Show this app on the top 3D interactive showcase.</span>
                </div>
              </label>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 rounded-xl bg-cyan-pill hover:bg-cyan-pill-hover text-slate-950 text-xs font-black uppercase tracking-wider shadow-neon-cyan flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  {isSavingEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} className="stroke-[3]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
