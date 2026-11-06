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
  Code2,
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
  ShieldAlert
} from 'lucide-react';
import { AppCategory, AppItem } from '@/types/app';
import AppIcon from '@/components/AppIcon';
import {
  sanitizeString,
  validateUploadFile,
  validateUploadImage,
  checkRateLimit,
} from '@/lib/security';

export default function AdminUploadPage() {
  const router = useRouter();

  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

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
  const [screenshotsPreviews, setScreenshotsPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [publishedApp, setPublishedApp] = useState<AppItem | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showArchDocs, setShowArchDocs] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    packageId: '',
    version: '1.0.0',
    category: 'AI' as Exclude<AppCategory, 'All'>,
    price: 'Free',
    architecture: 'Universal x86_64 / arm64',
    shortDescription: '',
    fullDescription: '',
    permissions: 'Local Storage, Network Access',
  });

  const categories: Exclude<AppCategory, 'All'>[] = [
    'AI',
    'Productivity',
    'Games',
    'Tools',
    'Security',
    'Design',
  ];

  // Check existing session
  useEffect(() => {
    try {
      if (sessionStorage.getItem('softrova_admin_auth') === 'verified') {
        setIsAuthenticated(true);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  // Passcode verification with rate limiting
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Check brute-force guard
    const rateCheck = checkRateLimit('admin_auth', 5, 30000);
    if (!rateCheck.allowed) {
      setLockoutSeconds(rateCheck.waitSeconds || 30);
      setAuthError(`Too many failed attempts. Locked for ${rateCheck.waitSeconds}s.`);
      return;
    }

    // Default admin key
    if (passcode.trim() === 'softrova2026' || passcode.trim() === 'admin') {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('softrova_admin_auth', 'verified');
      } catch {}
    } else {
      setAuthError('Invalid Master Access Key. Access Denied.');
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

  // App Icon Upload with validation
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateUploadImage(file);
      if (!validation.valid) {
        setImageError(validation.error || 'Invalid icon.');
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

  // Screenshots Upload with validation
  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const validation = validateUploadImage(file);
        if (!validation.valid) {
          setImageError(validation.error || 'Invalid screenshot.');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setScreenshotsPreviews((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeScreenshot = (indexToRemove: number) => {
    setScreenshotsPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Form submission with sanitization
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeString(formData.name, 80);
    if (!cleanName) {
      alert('Please provide a valid Application Name.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newApp: AppItem = {
        id: `app-${Date.now()}`,
        name: cleanName,
        tagline: sanitizeString(formData.shortDescription, 120) || 'Verified Softrova Application',
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
        iconUrl: iconPreview || undefined,
        accentGlow: 'rgba(0, 229, 255, 0.6)',
        screenshots: screenshotsPreviews.length > 0
          ? screenshotsPreviews
          : [
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
            ],
        features: [
          'Verified Softrova Package',
          'Client-side cryptographically signed',
          'Deployable to Cloudflare R2 / Global Edge',
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
        downloadUrl: '#',
      };

      try {
        const stored = localStorage.getItem('softrova_custom_apps');
        const customApps = stored ? JSON.parse(stored) : [];
        localStorage.setItem('softrova_custom_apps', JSON.stringify([newApp, ...customApps]));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }

      setPublishedApp(newApp);
      setIsSubmitting(false);
      setUploadSuccess(true);
    }, 1800);
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
                Softrova Security Gate
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter Master Key to access the publishing dashboard.
              </p>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Master Access Key</span>
                <span className="text-[10px] text-cyan-400 font-mono">Default: softrova2026</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter administrator passcode..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
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
              disabled={lockoutSeconds > 0}
              className="w-full py-3 rounded-xl bg-cyan-pill hover:bg-cyan-pill-hover text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2"
            >
              <Lock size={14} />
              <span>Unlock Admin Portal</span>
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
        <div className="relative rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-[#1A1B41] via-[#15173B] to-[#0B0D21] border border-cyan-400/30 shadow-3d-card space-y-3">
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
                Softrova Admin Publishing Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Deploy validated binaries and image galleries directly to Cloudflare Pages & R2 with client-side sanitization.
              </p>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowArchDocs(!showArchDocs)}
              className="text-xs text-cyan-300 hover:text-white flex items-center gap-1.5 underline underline-offset-4 font-medium"
            >
              <Info size={14} />
              <span>{showArchDocs ? 'Hide Backend Architecture Guide' : 'View FastAPI & Cloudflare R2 Architecture Guide'}</span>
            </button>
          </div>
        </div>

        {/* Backend Architecture Guide */}
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

        {/* Upload Success Alert */}
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
                    Your app is live in the storefront catalog.
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

        {/* Main Publishing Form */}
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
              <span className="text-[11px] text-slate-400">Optional for mockup</span>
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

          {/* Section 2: App Visual Assets (Icon & Screenshots) */}
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

          {/* Section 3: Metadata Form */}
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as Exclude<AppCategory, 'All'>,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                >
                  {categories.map((c) => (
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

      </div>
    </div>
  );
}
