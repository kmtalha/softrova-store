'use client';

import React, { useRef, useState, useEffect } from 'react';
import { AppItem } from '@/types/app';
import AppIcon from './AppIcon';
import StarRating from './StarRating';
import { ShieldCheck, Download, Sparkles, ArrowUpRight } from 'lucide-react';

interface AppCardProps {
  app: AppItem;
  onSelect: (app: AppItem) => void;
  onDownload: (app: AppItem) => void;
  isDownloading?: boolean;
  downloadProgress?: number;
}

export default function AppCard({
  app,
  onSelect,
  onDownload,
  isDownloading = false,
  downloadProgress = 0,
}: AppCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch-enabled device to avoid jitter on mobile scroll
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rY = ((x - centerX) / centerX) * 8;
    const rX = -((y - centerY) / centerY) * 8;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleGetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(app);
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(app)}
      className="relative cursor-pointer perspective-1000 group rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(app);
        }
      }}
      aria-label={`${app.name} by ${app.developer}`}
      style={{ minHeight: '320px' }}
    >
      {/* 3D Card Container */}
      <div
        className="relative w-full h-full rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 ease-out transform-gpu transform-style-preserve-3d active:scale-95"
        style={{
          transform: !isTouchDevice && isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          background: isHovered
            ? 'linear-gradient(145deg, rgba(26, 27, 65, 0.88) 0%, rgba(16, 18, 46, 0.95) 100%)'
            : 'linear-gradient(145deg, rgba(26, 27, 65, 0.6) 0%, rgba(11, 13, 33, 0.85) 100%)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: isHovered
            ? '1px solid rgba(0, 229, 255, 0.5)'
            : '1px solid rgba(0, 229, 255, 0.15)',
          boxShadow: isHovered
            ? `0 25px 45px -10px rgba(0, 0, 0, 0.8), 0 0 30px -5px ${app.accentGlow || 'rgba(0, 229, 255, 0.4)'}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
            : '0 15px 35px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Specular Glare Layer (Desktop only) */}
        {!isTouchDevice && isHovered && (
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 opacity-60"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(0, 229, 255, 0.2) 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Top Section: App Icon + Category Badge */}
        <div className="relative z-10 translate-z-20">
          <div className="flex items-start justify-between gap-3 mb-4">
            <AppIcon
              iconType={app.iconType}
              iconBg={app.iconBg}
              iconUrl={app.iconUrl}
              size="md"
              glowColor={app.accentGlow}
              className="transform-gpu transition-transform duration-300 group-hover:scale-105 shrink-0"
            />

            <div className="flex flex-col items-end gap-1.5">
              {app.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/30 flex items-center gap-1 shadow-sm">
                  <Sparkles size={10} className="fill-amber-300 text-amber-300" />
                  {app.badge}
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/20">
                {app.category}
              </span>
            </div>
          </div>

          {/* App Title & Developer */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors line-clamp-1">
                {app.name}
              </h3>
              <ArrowUpRight
                size={16}
                className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 hidden sm:block"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-medium text-slate-300">{app.developer}</span>
              {app.verified && (
                <span title="Verified Softrova Official Build" className="inline-flex items-center">
                  <ShieldCheck
                    size={14}
                    className="text-cyan-400 shrink-0"
                  />
                </span>
              )}
            </div>
          </div>

          {/* Short Description */}
          <p className="mt-2.5 text-xs text-slate-300/90 line-clamp-2 leading-relaxed">
            {app.shortDescription}
          </p>
        </div>

        {/* Bottom Section: Rating & Pill Button */}
        <div className="relative z-10 pt-4 mt-auto border-t border-slate-800/80 flex items-center justify-between gap-2 translate-z-30">
          
          <div className="flex flex-col">
            <StarRating rating={app.rating} reviewsCount={app.reviewsCount} size={13} />
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
              {app.size} • v{app.version}
            </span>
          </div>

          <div className="shrink-0">
            {isDownloading ? (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#10122E] border border-cyan-400 text-cyan-300 text-xs font-bold shadow-neon-cyan min-w-[90px] justify-center">
                <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>{downloadProgress}%</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGetClick}
                aria-label={`Download ${app.name}`}
                className="relative flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-cyan-pill hover:bg-cyan-pill-hover text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan hover:shadow-neon-cyan-lg hover:scale-105 active:scale-95 transition-all min-h-[38px] min-w-[74px]"
              >
                <Download size={13} className="stroke-[3]" />
                <span>GET</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </article>
  );
}
