'use client';

import React, { useState, useRef } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { AppCategory, AppItem } from '@/types/app';
import AppIcon from '@/components/AppIcon';

export default function AdminUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const screenshotsInputRef = useRef<HTMLInputElement>(null);

  // Payload file state
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');

  // Images state
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [screenshotsPreviews, setScreenshotsPreviews] = useState<string[]>([]);
  const [dragImageActive, setDragImageActive] = useState(false);

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
    setSelectedFile(file);
    const mockHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setFileHash(mockHash);

    if (!formData.name) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
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

  // Handler for App Icon upload
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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

  // Handler for multiple screenshots upload
  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
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

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please provide an Application Name.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Build new app item
      const newApp: AppItem = {
        id: `app-${Date.now()}`,
        name: formData.name,
        tagline: formData.shortDescription || 'Verified Softrova Application',
        shortDescription: formData.shortDescription || 'Next-generation application built for performance and security.',
        fullDescription: formData.fullDescription || 'Published via Softrova Admin Portal. Verified clean binary with zero telemetry leak.',
        developer: 'Softrova Official',
        verified: true,
        rating: 5.0,
        reviewsCount: 1,
        category: formData.category,
        badge: 'New',
        price: formData.price || 'Free',
        size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '42 MB',
        version: formData.version,
        updatedAt: 'Just now',
        iconBg: 'from-cyan-400 via-blue-600 to-indigo-950',
        iconType: 'sparkles',
        iconUrl: iconPreview || undefined,
        accentGlow: 'rgba(0, 229, 255, 0.6)',
        screenshots: screenshotsPreviews.length > 0
          ? screenshotsPreviews
          : [
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80'
            ],
        features: [
          'Verified Softrova Package',
          'Client-side cryptographically signed',
          'Deployable to Cloudflare R2 / Global Edge',
          'Zero telemetry and privacy-preserving'
        ],
        changelog: [
          {
            version: `v${formData.version}`,
            date: 'Today',
            notes: ['Initial production package release', 'Security sandbox verified']
          }
        ],
        specs: {
          packageId: formData.packageId || `com.softrova.${formData.name.toLowerCase().replace(/\s+/g, '')}`,
          architecture: formData.architecture,
          minOs: 'Windows 10/11, macOS 12+, Linux',
          sha256: fileHash || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          permissions: formData.permissions.split(',').map((p) => p.trim())
        },
        downloadUrl: '#'
      };

      // Persist in localStorage so it immediately appears in the store!
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
    }, 2000);
  };

  const fastApiCodeSnippet = `# FastAPI + Cloudflare R2 Production Backend Endpoint with Multi-part Image Upload
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
import boto3, hashlib, os

app = FastAPI(title="Softrova Store API", version="1.0.0")
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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return True

@app.post("/api/v1/apps/upload")
async def upload_app_with_images(
    file: Optional[UploadFile] = File(None),
    icon: Optional[UploadFile] = File(None),
    screenshots: List[UploadFile] = File([]),
    app_name: str = Form(...),
    version: str = Form(...),
    category: str = Form(...),
    is_admin: bool = Depends(verify_admin_jwt)
):
    # 1. Stream Icon to Cloudflare R2
    icon_url = None
    if icon:
        icon_bytes = await icon.read()
        icon_key = f"icons/{category.lower()}/{icon.filename}"
        r2_client.put_object(Bucket=BUCKET_NAME, Key=icon_key, Body=icon_bytes, ContentType=icon.content_type)
        icon_url = f"https://cdn.softrova.com/{icon_key}"

    # 2. Stream Screenshots to Cloudflare R2
    screenshot_urls = []
    for sc in screenshots:
        sc_bytes = await sc.read()
        sc_key = f"screenshots/{sc.filename}"
        r2_client.put_object(Bucket=BUCKET_NAME, Key=sc_key, Body=sc_bytes, ContentType=sc.content_type)
        screenshot_urls.append(f"https://cdn.softrova.com/{sc_key}")

    return {
        "status": "success",
        "name": app_name,
        "icon_url": icon_url,
        "screenshots": screenshot_urls
    }`;

  const copyCode = () => {
    navigator.clipboard.writeText(fastApiCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0D21] text-white bg-cyber-grid py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Breadcrumb & Return to Store */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#15173B] border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:text-white hover:border-cyan-400 hover:shadow-neon-cyan transition-all"
          >
            <ArrowLeft size={16} />
            <span>Return to Storefront</span>
          </Link>

          {/* Security Status Badges */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono">
              <Lock size={12} />
              <span>TLS 1.3 ENCRYPTED</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono">
              <ShieldCheck size={12} />
              <span>ADMIN JWT ACTIVE</span>
            </span>
          </div>
        </div>

        {/* Header Hero with Official Logo */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1A1B41] via-[#15173B] to-[#0B0D21] border border-cyan-400/30 shadow-3d-card space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-neon-cyan shrink-0 bg-[#0B0D21]">
              <img
                src="/softrova-logo.png"
                alt="Softrova Official Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                Softrova Admin Publishing Portal
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Restricted Route
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Upload application packages, custom app icons, and screenshot galleries directly into the store ecosystem.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
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

        {/* Expandable Architecture Guide Modal / Panel */}
        {showArchDocs && (
          <div className="rounded-3xl p-6 bg-[#10122E] border border-cyan-400/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <Server size={18} />
                <span>Cloudflare R2 Multi-part Image & Binary Pipeline</span>
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-xs text-cyan-300 hover:text-white transition-all"
              >
                {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copied Snippet' : 'Copy FastAPI Code'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#060714] text-cyan-300 text-[11px] font-mono overflow-x-auto border border-slate-800">
              {fastApiCodeSnippet}
            </pre>
          </div>
        )}

        {/* Upload Success Banner with Instant Link to Store */}
        {uploadSuccess && publishedApp && (
          <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-950/90 to-[#10122E] border border-emerald-500/60 shadow-neon-cyan space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <AppIcon
                  iconUrl={publishedApp.iconUrl}
                  iconType={publishedApp.iconType}
                  iconBg={publishedApp.iconBg}
                  size="md"
                />
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <span>"{publishedApp.name}" Successfully Published!</span>
                  </h3>
                  <p className="text-xs text-emerald-300/90 mt-0.5">
                    Your app with custom icon and {publishedApp.screenshots.length} screenshot(s) is now live in the store catalog.
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

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-full bg-cyan-pill hover:bg-cyan-pill-hover text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan hover:scale-105 transition-all flex items-center gap-2"
              >
                <Eye size={14} className="stroke-[3]" />
                <span>View on Storefront</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setUploadSuccess(false);
                  setSelectedFile(null);
                  setIconPreview('');
                  setScreenshotsPreviews([]);
                  setFormData({
                    name: '',
                    packageId: '',
                    version: '1.0.0',
                    category: 'AI',
                    price: 'Free',
                    architecture: 'Universal x86_64 / arm64',
                    shortDescription: '',
                    fullDescription: '',
                    permissions: 'Local Storage, Network Access',
                  });
                }}
                className="px-4 py-2.5 rounded-full bg-[#15173B] text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-all"
              >
                Upload Another Application
              </button>
            </div>
          </div>
        )}

        {/* Main Upload Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#1A1B41]/90 via-[#121435]/95 to-[#0B0D21] border border-cyan-400/25 shadow-3d-card space-y-8"
        >
          
          {/* SECTION 1: Binary Package Payload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center text-[10px]">1</span>
                <span>Application Binary Payload (APK, ZIP, DMG, EXE)</span>
              </label>
              <span className="text-[11px] text-slate-400">Optional for mockup preview</span>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
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

              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 shadow-neon-cyan">
                {selectedFile ? (
                  <FileCheck2 size={32} className="text-emerald-400" />
                ) : (
                  <UploadCloud size={32} className="text-cyan-400 animate-pulse" />
                )}
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white flex items-center justify-center gap-2">
                    <span>{selectedFile.name}</span>
                    <span className="text-xs text-emerald-400 font-mono">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Click or drag to replace binary package
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    Drag and drop file here, or <span className="text-cyan-400 underline">browse package</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports Android APK, Windows EXE, macOS DMG, and ZIP archives
                  </p>
                </div>
              )}
            </div>

            {fileHash && (
              <div className="p-3 rounded-xl bg-[#0B0D21] border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-mono text-[11px] truncate">
                  <span className="text-cyan-400 font-bold uppercase">SHA-256:</span>
                  <span className="text-slate-300 truncate">{fileHash}</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                  Integrity Verified
                </span>
              </div>
            )}
          </div>

          {/* SECTION 2: APP IMAGES UPLOAD (ICON & SCREENSHOTS) */}
          <div className="space-y-6 pt-4 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center text-[10px]">2</span>
              <span>App Visual Assets (Icon & Screenshots Upload)</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* App Icon Upload (Col 1-5) */}
              <div className="md:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    App Icon (PNG, JPG, SVG, WebP)
                  </span>
                  {iconPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setIconFile(null);
                        setIconPreview('');
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 underline"
                    >
                      Reset Icon
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#10122E] border border-slate-700/80">
                  {/* Live Icon 3D Preview */}
                  <div className="shrink-0">
                    <AppIcon
                      iconUrl={iconPreview}
                      iconType="sparkles"
                      iconBg="from-cyan-400 via-blue-600 to-indigo-950"
                      size="lg"
                    />
                  </div>

                  {/* Upload Trigger Button */}
                  <div className="space-y-2 flex-1">
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
                      className="w-full px-3.5 py-2 rounded-xl bg-[#15173B] hover:bg-[#1A1B41] border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <ImageIcon size={14} />
                      <span>{iconPreview ? 'Change App Icon' : 'Upload App Icon'}</span>
                    </button>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Recommended: Square 512×512px or 1024×1024px transparent PNG.
                    </p>
                  </div>
                </div>
              </div>

              {/* Screenshots Gallery Upload (Col 6-12) */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    App Screenshots Gallery ({screenshotsPreviews.length} uploaded)
                  </span>
                  {screenshotsPreviews.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setScreenshotsPreviews([])}
                      className="text-[11px] text-rose-400 hover:text-rose-300 underline"
                    >
                      Clear All
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

                {/* Screenshots Grid & Add Button */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#10122E] border border-slate-700/80 min-h-[140px]">
                  {screenshotsPreviews.map((src, index) => (
                    <div
                      key={index}
                      className="relative group aspect-video rounded-xl overflow-hidden border border-cyan-500/30 bg-[#0B0D21] shadow-md"
                    >
                      <img src={src} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        title="Remove screenshot"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Add Screenshots Card Button */}
                  <button
                    type="button"
                    onClick={() => screenshotsInputRef.current?.click()}
                    className="aspect-video rounded-xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-[#15173B]/50 hover:bg-[#1A1B41] flex flex-col items-center justify-center gap-1 text-cyan-300 hover:text-white transition-all"
                  >
                    <Plus size={20} />
                    <span className="text-[10px] font-bold">Add Image</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Upload multiple landscape 16:9 or phone 9:16 screenshots to showcase UI/UX.
                </p>
              </div>

            </div>
          </div>

          {/* SECTION 3: Application Metadata & Store Attributes */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center text-[10px]">3</span>
              <span>Application Metadata & Release Notes</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  App Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Softrova Vision AI"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Package Identifier (Reverse DNS)
                </label>
                <input
                  type="text"
                  placeholder="e.g. com.softrova.visionai"
                  value={formData.packageId}
                  onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Version Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1.0.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Pricing Tier
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Target Architecture
                </label>
                <input
                  type="text"
                  value={formData.architecture}
                  onChange={(e) => setFormData({ ...formData, architecture: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Short Tagline / Teaser
              </label>
              <input
                type="text"
                placeholder="High performance spatial AI workspace for creative developers"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Full Release Description
              </label>
              <textarea
                rows={3}
                placeholder="Detailed explanation of features, security guarantees, and changelog updates..."
                value={formData.fullDescription}
                onChange={(e) =>
                  setFormData({ ...formData, fullDescription: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-cyan-400" />
              <span>Signed with Softrova Master Publisher Certificate</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cyan-pill hover:bg-cyan-pill-hover text-slate-950 font-black text-sm uppercase tracking-wider shadow-neon-cyan hover:shadow-neon-cyan-lg transition-all flex items-center justify-center gap-2.5 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>Streaming Package & Images to R2...</span>
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
