'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import AppCard from '@/components/AppCard';
import AppDetailModal from '@/components/AppDetailModal';
import Footer from '@/components/Footer';
import { INITIAL_APPS } from '@/data/apps';
import { AppCategory, AppItem } from '@/types/app';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Filter,
  CheckCircle,
  ShieldCheck,
  SearchX
} from 'lucide-react';

export default function StorefrontPage() {
  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('All');
  const [activeModalApp, setActiveModalApp] = useState<AppItem | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'name'>('featured');

  // Load custom apps uploaded from /admin/upload
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('softrova_custom_apps');
      if (stored) {
        const customApps: AppItem[] = JSON.parse(stored);
        if (Array.isArray(customApps) && customApps.length > 0) {
          setApps([...customApps, ...INITIAL_APPS]);
        }
      }
    } catch (e) {
      console.error('Failed to parse custom apps:', e);
    }
  }, []);

  // Simulated download progress state
  const [downloadingAppId, setDownloadingAppId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Filter & Search Logic
  const filteredApps = useMemo(() => {
    return apps
      .filter((app) => {
        const matchesCategory =
          selectedCategory === 'All' || app.category === selectedCategory;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          app.name.toLowerCase().includes(query) ||
          app.developer.toLowerCase().includes(query) ||
          app.shortDescription.toLowerCase().includes(query) ||
          app.category.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Default featured first
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [apps, selectedCategory, searchQuery, sortBy]);

  // Handle Download Click with realistic simulated progress
  const handleDownload = (app: AppItem) => {
    if (downloadingAppId) return; // Prevent concurrent simulation
    setDownloadingAppId(app.id);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingAppId(null);
            setDownloadProgress(0);
          }, 800);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#0B0D21] text-white flex flex-col bg-cyber-grid selection:bg-cyan-400 selection:text-slate-950">
      
      {/* 1. Header & Navigation (Semantic <header>) */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 2. Main Storefront Body (Semantic <main>) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">
        
        {/* Hero Section (When not actively filtering by text search) */}
        {!searchQuery && (
          <HeroCarousel
            apps={apps}
            onSelectApp={setActiveModalApp}
            onDownloadClick={handleDownload}
          />
        )}

        {/* Store Catalog Header & Sort Controls */}
        <section aria-labelledby="catalog-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="catalog-heading"
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
                >
                  {selectedCategory === 'All' ? 'All Applications' : `${selectedCategory} Applications`}
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {filteredApps.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Explore hand-crafted software curated by Softrova Labs with zero telemetry leaks.
              </p>
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter size={12} className="text-cyan-400" /> Sort:
              </span>
              <div className="inline-flex rounded-xl bg-[#10122E] p-1 border border-slate-700/60">
                {(['featured', 'rating', 'name'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      sortBy === s
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan-pill'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Search Badge */}
          {searchQuery && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#15173B]/80 border border-cyan-500/30 text-xs">
              <span className="text-slate-300">
                Search results for: <strong className="text-cyan-300 font-mono">"{searchQuery}"</strong>
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:text-white font-semibold underline"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredApps.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[#10122E]/60 border border-slate-800 space-y-4">
              <div className="inline-flex p-4 rounded-3xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 shadow-neon-cyan">
                <SearchX size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No applications found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  We couldn't find any apps matching "{searchQuery}". Try selecting another category or clear your search terms.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-5 py-2.5 rounded-full bg-cyan-pill text-slate-950 font-bold text-xs uppercase shadow-neon-cyan hover:scale-105 transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Responsive 3D App Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onSelect={setActiveModalApp}
                  onDownload={handleDownload}
                  isDownloading={downloadingAppId === app.id}
                  downloadProgress={downloadProgress}
                />
              ))}
            </div>
          )}
        </section>

        {/* Ecosystem Guarantee Banner */}
        <section aria-label="Softrova Security Guarantee" className="pt-6">
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1A1B41] via-[#10122E] to-[#0B0D21] border border-cyan-400/30 shadow-3d-card flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} className="fill-amber-300" />
                <span>Softrova Security Engine</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Cryptographically Signed. Isolated. 100% Free of Bloatware.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Every package in the Softrova App Store undergoes strict static binary analysis, runtime vulnerability sandboxing, and zero telemetry auditing before reaching your device.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                <ShieldCheck size={32} />
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 3. Sleek 3D App Detail Slide-Over / Modal */}
      <AppDetailModal
        app={activeModalApp}
        onClose={() => setActiveModalApp(null)}
        onDownload={handleDownload}
        isDownloading={downloadingAppId === activeModalApp?.id}
        downloadProgress={downloadProgress}
      />

      {/* 4. Footer (Semantic <footer>) */}
      <Footer />
    </div>
  );
}
