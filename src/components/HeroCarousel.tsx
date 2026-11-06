'use client';

import React, { useState, useEffect } from 'react';
import { AppItem } from '@/types/app';
import AppIcon from './AppIcon';
import StarRating from './StarRating';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface HeroCarouselProps {
  apps: AppItem[];
  onSelectApp: (app: AppItem) => void;
  onDownloadClick: (app: AppItem) => void;
}

export default function HeroCarousel({
  apps,
  onSelectApp,
  onDownloadClick,
}: HeroCarouselProps) {
  const featuredApps = apps.filter((a) => a.featured);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredApps.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredApps.length]);

  if (featuredApps.length === 0) return null;

  const currentApp = featuredApps[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredApps.length) % featuredApps.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
  };

  return (
    <section aria-label="Featured Applications Spotlight" className="relative w-full overflow-hidden pt-3 sm:pt-6 pb-6 sm:pb-10">
      {/* Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[700px] lg:w-[900px] h-[300px] sm:h-[450px] bg-gradient-to-r from-cyan-500/15 via-[#1A1B41]/40 to-blue-600/20 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-5 sm:p-8 lg:p-12 overflow-hidden bg-gradient-to-br from-[#1A1B41]/90 via-[#121435]/95 to-[#0B0D21] border border-cyan-400/30 shadow-3d-card backdrop-blur-2xl transition-all">
          
          <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />

          {/* Top Ribbon & Slider Controls */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-neon-cyan-pill">
              <Sparkles size={13} className="text-cyan-300 animate-spin" />
              <span>Softrova Spotlight</span>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Featured App"
                className="p-1.5 sm:p-2 rounded-xl bg-[#10122E]/80 border border-cyan-500/30 text-slate-300 hover:text-white hover:border-cyan-400 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1.5 px-1 sm:px-2">
                {featuredApps.map((app, idx) => (
                  <button
                    key={app.id}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-6 sm:w-7 bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)]'
                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Featured App"
                className="p-1.5 sm:p-2 rounded-xl bg-[#10122E]/80 border border-cyan-500/30 text-slate-300 hover:text-white hover:border-cyan-400 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Slide Content Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Details */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-300 px-2.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 flex items-center gap-1">
                    <Zap size={11} className="fill-amber-300 text-amber-300" />
                    {currentApp.badge || 'Featured'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Category: <strong className="text-white">{currentApp.category}</strong>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {currentApp.heroHeadline || currentApp.name}
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-cyan-100/90 font-medium leading-relaxed">
                  {currentApp.heroSubheadline || currentApp.shortDescription}
                </p>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {currentApp.features.slice(0, 2).map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-[#10122E]/70 border border-slate-700/60 text-xs text-slate-300"
                  >
                    <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Meta & Ratings */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
                <div className="flex items-center gap-3">
                  <AppIcon
                    iconType={currentApp.iconType}
                    iconBg={currentApp.iconBg}
                    iconUrl={currentApp.iconUrl}
                    size="md"
                    glowColor={currentApp.accentGlow}
                    className="shrink-0"
                  />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {currentApp.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>{currentApp.developer}</span>
                      {currentApp.verified && (
                        <ShieldCheck size={13} className="text-cyan-400" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-slate-700 hidden sm:block" />

                <div className="flex flex-col">
                  <StarRating
                    rating={currentApp.rating}
                    reviewsCount={currentApp.reviewsCount}
                    size={14}
                  />
                  <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                    Verified Softrova Build • {currentApp.size}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onDownloadClick(currentApp)}
                  aria-label={`Install ${currentApp.name}`}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-neon-cyan hover:shadow-neon-cyan-lg hover:scale-105 active:scale-95 transition-all min-h-[44px]"
                >
                  <Download size={17} className="stroke-[2.5]" />
                  <span>Get App • {currentApp.price}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectApp(currentApp)}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#1A1B41] border border-cyan-500/30 text-white font-semibold text-xs sm:text-sm hover:bg-[#24265A] hover:border-cyan-400 transition-all min-h-[44px] group"
                >
                  <span>View Details & Specs</span>
                  <ArrowRight size={15} className="text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right 3D Visual */}
            <div className="lg:col-span-5 relative perspective-1000 flex items-center justify-center mt-2 lg:mt-0">
              <div className="relative w-full max-w-md group">
                <div className="relative rounded-2xl overflow-hidden border border-cyan-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,229,255,0.3)] transition-transform duration-500 group-hover:scale-105">
                  <div className="relative aspect-video w-full bg-[#0B0D21]">
                    <img
                      src={currentApp.screenshots[0]}
                      alt={`${currentApp.name} 3D Visual`}
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                      width={640}
                      height={360}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D21] via-transparent to-black/30" />
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-[#0B0D21] via-[#10122E]/90 to-transparent flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white tracking-wide truncate">
                        {currentApp.name} v{currentApp.version}
                      </p>
                      <p className="text-[10px] text-cyan-300 font-mono">
                        SHA-256: {currentApp.specs.sha256.slice(0, 14)}...
                      </p>
                    </div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 sm:py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                      Edge Ready
                    </span>
                  </div>
                </div>

                <div className="absolute -top-2.5 -right-2.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[11px] shadow-neon-yellow flex items-center gap-1 animate-bounce">
                  <Sparkles size={12} className="fill-slate-950" />
                  <span>Top Pick</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
