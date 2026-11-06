'use client';

import React, { useState, useEffect } from 'react';
import { AppItem } from '@/types/app';
import AppIcon from './AppIcon';
import StarRating from './StarRating';
import {
  X,
  Download,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Cpu,
  Lock,
  Calendar,
  FileCode2,
  Sparkles,
  Share2,
  Check,
  ExternalLink,
  Layers
} from 'lucide-react';

interface AppDetailModalProps {
  app: AppItem | null;
  onClose: () => void;
  onDownload: (app: AppItem) => void;
  isDownloading?: boolean;
  downloadProgress?: number;
}

export default function AppDetailModal({
  app,
  onClose,
  onDownload,
  isDownloading = false,
  downloadProgress = 0,
}: AppDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'changelog'>('overview');
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState(0);
  const [copiedHash, setCopiedHash] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!app) return null;

  const handleCopySha = () => {
    navigator.clipboard.writeText(app.specs.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-2xl bg-[#060714]/85 transition-opacity"
      onClick={onClose}
    >
      {/* 3D Glass Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1A1B41] via-[#10122E] to-[#0B0D21] border border-cyan-400/40 shadow-3d-card p-6 sm:p-8 space-y-6 text-white no-scrollbar"
        style={{
          boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.9), 0 0 45px -5px rgba(0, 229, 255, 0.35)',
        }}
      >
        {/* Top Close Button & Share */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-300 font-bold tracking-widest uppercase">
              Application Blueprint
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {app.specs.packageId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="p-2 rounded-full bg-[#15173B] text-slate-400 hover:text-white hover:bg-slate-700/60 border border-slate-700 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Header Hero Row: Icon + Meta + Download Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4">
          <div className="flex items-start gap-4 sm:gap-6">
            <AppIcon
              iconType={app.iconType}
              iconBg={app.iconBg}
              iconUrl={app.iconUrl}
              size="lg"
              glowColor={app.accentGlow}
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {app.name}
                </h2>
                {app.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-amber-300 bg-amber-400/10 border border-amber-400/30 flex items-center gap-1">
                    <Sparkles size={10} className="fill-amber-300" />
                    {app.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-cyan-300 font-medium">
                <span>{app.developer}</span>
                {app.verified && (
                  <span className="inline-flex items-center gap-1 text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-400/30">
                    <ShieldCheck size={12} /> Verified Publisher
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <StarRating rating={app.rating} reviewsCount={app.reviewsCount} size={15} />
                <span className="text-xs text-slate-400 font-mono">
                  {app.category} • v{app.version} • {app.size}
                </span>
              </div>
            </div>
          </div>

          {/* Action Download Pill Button */}
          <div className="shrink-0 flex sm:flex-col items-center justify-between gap-2">
            {isDownloading ? (
              <div className="w-full sm:w-44 px-4 py-3 rounded-2xl bg-[#10122E] border border-cyan-400 text-center text-xs font-bold text-cyan-300 shadow-neon-cyan flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>Downloading {downloadProgress}%</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onDownload(app)}
                className="w-full sm:w-44 px-6 py-3.5 rounded-2xl bg-cyan-pill hover:bg-cyan-pill-hover text-slate-950 font-black text-sm uppercase tracking-wider shadow-neon-cyan hover:shadow-neon-cyan-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} className="stroke-[2.5]" />
                <span>Get App</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400 font-medium text-center">
              Direct Cloudflare R2 Download
            </span>
          </div>
        </div>

        {/* 3D Perspective Screenshots Gallery */}
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-cyan-400/30 aspect-video w-full bg-[#0B0D21] shadow-2xl">
            <img
              src={app.screenshots[activeScreenshotIdx] || app.screenshots[0]}
              alt={`${app.name} Screenshot`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D21]/80 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300 bg-[#0B0D21]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/20">
              <span className="font-semibold text-white">
                Screenshot {activeScreenshotIdx + 1} of {app.screenshots.length}
              </span>
              <span className="text-cyan-300 font-mono text-[11px]">
                High-Resolution Retina Display Preview
              </span>
            </div>
          </div>

          {/* Screenshot Thumbnails */}
          {app.screenshots.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {app.screenshots.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveScreenshotIdx(idx)}
                  className={`relative w-24 h-14 rounded-xl overflow-hidden border transition-all shrink-0 ${
                    activeScreenshotIdx === idx
                      ? 'border-cyan-400 ring-2 ring-cyan-400/60 scale-105'
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={s} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Tabs: Overview, Specs, Changelog */}
        <div className="flex items-center gap-2 border-b border-slate-800 pt-2">
          {(['overview', 'specs', 'changelog'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
                activeTab === tab
                  ? 'border-cyan-400 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'overview' && 'Overview & Features'}
              {tab === 'specs' && 'Technical Specs'}
              {tab === 'changelog' && 'Changelog History'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-2">
                  About {app.name}
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {app.fullDescription}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-3">
                  Core Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {app.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-[#15173B]/70 border border-slate-700/60 text-xs text-slate-200"
                    >
                      <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Shield Banner */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-400/40">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-white">
                    Softrova Zero-Malware Guarantee
                  </p>
                  <p className="text-slate-300">
                    Scanned with 70+ antivirus engines. Cryptographically signed and verified for isolated sandbox execution.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#15173B]/70 border border-slate-700/60 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                    <FileCode2 size={14} className="text-cyan-400" /> Package Identifier
                  </span>
                  <p className="text-sm font-mono text-white font-bold">{app.specs.packageId}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#15173B]/70 border border-slate-700/60 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                    <Cpu size={14} className="text-cyan-400" /> Target Architecture
                  </span>
                  <p className="text-sm font-mono text-white font-bold">{app.specs.architecture}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#15173B]/70 border border-slate-700/60 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                    <HardDrive size={14} className="text-cyan-400" /> System Compatibility
                  </span>
                  <p className="text-sm text-white font-bold">{app.specs.minOs}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#15173B]/70 border border-slate-700/60 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                    <Lock size={14} className="text-cyan-400" /> Declared Permissions
                  </span>
                  <p className="text-xs text-slate-300">
                    {app.specs.permissions.join(', ')}
                  </p>
                </div>
              </div>

              {/* SHA-256 Hash Verification Box */}
              <div className="p-4 rounded-2xl bg-[#10122E] border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono tracking-wider text-cyan-300 font-bold">
                    Cryptographic SHA-256 Checksum
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySha}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-white px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 transition-colors"
                  >
                    {copiedHash ? (
                      <>
                        <Check size={12} className="text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <span>Copy Hash</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs font-mono text-slate-300 break-all select-all bg-[#0B0D21] p-2.5 rounded-lg border border-slate-800">
                  {app.specs.sha256}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="space-y-4">
              {app.changelog.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#15173B]/60 border border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white font-mono">
                      {entry.version}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> {entry.date}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    {entry.notes.map((note, nIdx) => (
                      <li key={nIdx}>{note}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  function handleClose() {
    onClose();
  }
}
