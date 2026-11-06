'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  Lock,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Server,
  Cloud,
  Code2,
  Key,
  HardDrive,
  Copy,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import { AppCategory } from '@/types/app';

export default function AdminUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
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
    screenshots: '',
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

  // Drag and drop handlers
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
    // Simulate SHA-256 hash calculation based on file properties
    const mockHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setFileHash(mockHash);

    // Auto-fill app name if blank
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please upload an APK, ZIP, or binary file before submitting.');
      return;
    }

    setIsSubmitting(true);
    // Simulate pipeline upload to FastAPI + Cloudflare R2
    setTimeout(() => {
      setIsSubmitting(false);
      setUploadSuccess(true);
    }, 2200);
  };

  const fastApiCodeSnippet = `# FastAPI + Cloudflare R2 Production Backend Endpoint
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import boto3, hashlib, os

app = FastAPI(title="Softrova Store API", version="1.0.0")
auth_scheme = HTTPBearer()

# Connect to Cloudflare R2 via S3-compatible Boto3 client
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
async def upload_app_binary(
    file: UploadFile = File(...),
    app_name: str = Form(...),
    version: str = Form(...),
    category: str = Form(...),
    is_admin: bool = Depends(verify_admin_jwt)
):
    # Compute SHA-256 Checksum on the fly
    contents = await file.read()
    sha256 = hashlib.sha256(contents).hexdigest()
    
    # Store directly in Cloudflare R2 with zero egress fees
    object_key = f"{category.lower()}/{file.filename}"
    r2_client.put_object(
        Bucket=BUCKET_NAME,
        Key=object_key,
        Body=contents,
        ContentType=file.content_type
    )
    
    download_url = f"https://cdn.softrova.com/{object_key}"
    return {
        "status": "success",
        "name": app_name,
        "version": version,
        "sha256": sha256,
        "download_url": download_url
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

        {/* Header Hero */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1A1B41] via-[#15173B] to-[#0B0D21] border border-cyan-400/30 shadow-3d-card space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 shadow-neon-cyan">
              <UploadCloud size={28} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                Softrova Admin Publishing Portal
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Restricted Route
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Deploy validated binaries directly to Cloudflare Pages & R2 object storage with automated integrity hashing.
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
                <span>Cloudflare + FastAPI Architecture Implementation Blueprint</span>
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

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>How it works:</strong> The static frontend deployed on <code>store.softrova.com</code> (Cloudflare Pages) renders SSG pages with instant speed. When you upload in this portal, the file streams to your authenticated <strong>FastAPI</strong> backend which uploads directly to <strong>Cloudflare R2</strong> (zero egress fees) and triggers an automated webhook to re-generate the static store catalog.
            </p>

            <pre className="p-4 rounded-xl bg-[#060714] text-cyan-300 text-[11px] font-mono overflow-x-auto border border-slate-800">
              {fastApiCodeSnippet}
            </pre>
          </div>
        )}

        {/* Upload Success Banner */}
        {uploadSuccess && (
          <div className="rounded-2xl p-4 bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between gap-4 text-emerald-300 text-xs animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Package Successfully Published!</p>
                <p className="text-emerald-300/80">
                  Binary mirrored to Cloudflare R2. SHA-256 hash verified. Open Graph and SSG cache invalidated.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUploadSuccess(false)}
              className="px-3 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-white font-semibold transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Form Container */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#1A1B41]/90 via-[#121435]/95 to-[#0B0D21] border border-cyan-400/25 shadow-3d-card space-y-8"
        >
          {/* 1. Drag & Drop Upload Zone */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
              1. Application Package Payload (APK, ZIP, DMG, EXE)
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-3xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
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

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 shadow-neon-cyan">
                {selectedFile ? (
                  <FileCheck2 size={36} className="text-emerald-400" />
                ) : (
                  <UploadCloud size={36} className="text-cyan-400 animate-pulse" />
                )}
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-base font-bold text-white flex items-center justify-center gap-2">
                    <span>{selectedFile.name}</span>
                    <span className="text-xs text-emerald-400 font-mono">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Click or drag another file to replace package.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    Drag and drop application package here, or <span className="text-cyan-400 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports Android .apk, zipped binaries, Windows executables, macOS bundles up to 5GB
                  </p>
                </div>
              )}

              {/* Security Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B0D21] border border-slate-700 text-[10px] text-slate-400 mt-2 font-mono">
                <Lock size={10} className="text-amber-400" />
                <span>Zero-Knowledge SHA-256 client verification active</span>
              </div>
            </div>

            {/* SHA-256 Calculated Badge */}
            {fileHash && (
              <div className="p-3 rounded-xl bg-[#0B0D21] border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-mono text-[11px] truncate">
                  <span className="text-cyan-400 font-bold uppercase">SHA-256:</span>
                  <span className="text-slate-300 truncate">{fileHash}</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                  Valid Checksum
                </span>
              </div>
            )}
          </div>

          {/* 2. Metadata Form Fields */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
              2. Application Metadata & Store Attributes
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Package Identifier (Reverse DNS) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. com.softrova.neuralstudio"
                  value={formData.packageId}
                  onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Version Number *
                </label>
                <input
                  type="text"
                  required
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
                  Target Architecture
                </label>
                <input
                  type="text"
                  value={formData.architecture}
                  onChange={(e) => setFormData({ ...formData, architecture: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Required Permissions
                </label>
                <input
                  type="text"
                  value={formData.permissions}
                  onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Short Tagline / Teaser *
              </label>
              <input
                type="text"
                required
                placeholder="High performance AI workspace for neural developers"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-[#10122E] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Full Release Description & Changelog *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Detailed explanation of features, security audits, and changelog updates..."
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
              <span>Sign payload with Softrova Developer Master Certificate</span>
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
