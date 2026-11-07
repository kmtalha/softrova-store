'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import AppCard from '@/components/AppCard';
import AppDetailModal from '@/components/AppDetailModal';
import AppIcon from '@/components/AppIcon';
import Footer from '@/components/Footer';
import { DEFAULT_CATEGORIES } from '@/data/categories';
import { INITIAL_APPS } from '@/data/apps';
import { AppCategory, AppItem } from '@/types/app';
import { fetchSupabaseApps, fetchSupabaseCategories } from '@/lib/supabase';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Filter,
  ShieldCheck,
  SearchX,
  Lock,
  Cpu
} from 'lucide-react';

export default function StorefrontPage() {
  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalApp, setActiveModalApp] = useState<AppItem | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'name'>('featured');

  // Smooth scroll to catalog when top filter is clicked
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setTimeout(() => {
      const catalogEl = document.getElementById('apps-catalog');
      if (catalogEl) {
        const yOffset = -90;
        const y = catalogEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  // Load custom apps, dynamic categories & spotlight overrides from Supabase or localStorage
  useEffect(() => {
    async function loadStoreData() {
      try {
        // 1. Try loading categories from Supabase
        const sbCats = await fetchSupabaseCategories();
        if (sbCats && sbCats.length > 0) {
          setCategories(sbCats);
        } else {
          const storedCategories = localStorage.getItem('softrova_categories');
          if (storedCategories) {
            const parsedCats = JSON.parse(storedCategories);
            if (Array.isArray(parsedCats) && parsedCats.length > 0) {
              setCategories(parsedCats);
            }
          }
        }

        // 2. Load apps from Supabase or fallback
        let baseApps: AppItem[] = [];
        const sbApps = await fetchSupabaseApps();
        if (sbApps && sbApps.length > 0) {
          baseApps = sbApps;
        } else {
          const stored = localStorage.getItem('softrova_custom_apps');
          const customApps: AppItem[] = stored ? JSON.parse(stored) : [];
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

        // 5. Apply spotlight map
        try {
          const storedSpotlight = localStorage.getItem('softrova_spotlight_map');
          if (storedSpotlight) {
            const featMap: Record<string, boolean> = JSON.parse(storedSpotlight);
            baseApps = baseApps.map((app) => ({
              ...app,
              featured: featMap[app.id] !== undefined ? featMap[app.id] : app.featured,
            }));
          }
        } catch {}

        setApps(baseApps);
      } catch (e) {
        console.error('Failed to parse store data:', e);
      }
    }

    loadStoreData();
  }, []);

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
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [apps, selectedCategory, searchQuery, sortBy]);

  // Download simulation
  const [downloadingAppId, setDownloadingAppId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [installedAppBanner, setInstalledAppBanner] = useState<AppItem | null>(null);

  // Direct Clean Download Engine (Downloads direct APK from source, avoids blob warning)
  const handleDownload = async (app: AppItem) => {
    if (downloadingAppId) return;
    setDownloadingAppId(app.id);
    setDownloadProgress(20);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 15;
      });
    }, 150);

    const url = app.downloadUrl;
    if (!url || url === '#' || (!url.startsWith('https://') && !url.startsWith('http://'))) {
      clearInterval(interval);
      setDownloadingAppId(null);
      setDownloadProgress(0);
      alert('Application package is not yet available for download.');
      return;
    }

    const extMatch = url.match(/\.(apk|zip|exe|dmg|tar\.gz|deb)(\?.*)?$/i);
    const ext = extMatch ? extMatch[1] : 'apk';
    const cleanFilename = `${app.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_v${app.version}.${ext}`;

    // Format Supabase Storage URL with direct download parameter
    let directUrl = url;
    if (directUrl.includes('supabase.co/storage/v1/object/public/')) {
      const sep = directUrl.includes('?') ? '&' : '?';
      directUrl = `${directUrl}${sep}download=${encodeURIComponent(cleanFilename)}`;
    }

    // Trigger direct native download via hidden element
    // Direct URL download prevents the browser from showing the scary "from blob:..." alert
    const link = document.createElement('a');
    link.href = directUrl;
    link.setAttribute('download', cleanFilename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
    }, 2000);

    setTimeout(() => {
      clearInterval(interval);
      setDownloadProgress(100);
      setTimeout(() => {
        setDownloadingAppId(null);
        setDownloadProgress(0);
        setInstalledAppBanner(app);
      }, 700);
    }, 1200);
  };

  // Schema.org ItemList for Google App Store Carousel indexing
  const jsonLdCatalog = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: apps.map((app, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: app.name,
        operatingSystem: app.specs.minOs,
        applicationCategory: `${app.category}Application`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: app.rating.toFixed(1),
          ratingCount: app.reviewsCount,
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        publisher: {
          '@type': 'Organization',
          name: app.developer,
        },
        description: app.shortDescription,
        downloadUrl: `https://store.softrova.com/?app=${app.id}`,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#0B0D21] text-white flex flex-col bg-cyber-grid selection:bg-cyan-400 selection:text-slate-950">
      
      {/* Schema.org App Catalog JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCatalog) }}
      />

      {/* Semantic Header */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        categories={categories}
      />

      {/* Semantic Main Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 pb-16 sm:pb-20">
        
        {/* Hero Section */}
        {!searchQuery && (
          <HeroCarousel
            apps={apps}
            onSelectApp={setActiveModalApp}
            onDownloadClick={handleDownload}
          />
        )}

        {/* Store Catalog Header & Sort Controls */}
        <section id="apps-catalog" aria-labelledby="catalog-heading" className="space-y-5 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-cyan-500/20 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="catalog-heading"
                  className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight"
                >
                  {selectedCategory === 'All' ? 'All Applications' : `${selectedCategory} Applications`}
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {filteredApps.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Curated futuristic binaries verified for isolated sandbox execution and zero telemetry leaks.
              </p>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter size={12} className="text-cyan-400" /> Sort:
              </span>
              <div className="inline-flex rounded-xl bg-[#10122E] p-1 border border-slate-700/60">
                {(['featured', 'rating', 'name'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSortBy(s)}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all min-h-[30px] flex items-center justify-center ${
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
              <span className="text-slate-300 truncate mr-2">
                Results for: <strong className="text-cyan-300 font-mono">"{searchQuery}"</strong>
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:text-white font-semibold underline shrink-0"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredApps.length === 0 ? (
            <div className="py-16 sm:py-20 text-center rounded-3xl bg-[#10122E]/60 border border-slate-800 space-y-4 px-4">
              <div className="inline-flex p-4 rounded-3xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20 shadow-neon-cyan">
                <SearchX size={36} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white">No applications match your query</h3>
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
            /* Responsive Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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

        {/* Security & Architecture Guarantee Banner */}
        <section aria-label="Softrova Security Guarantee" className="pt-4 sm:pt-6">
          <div className="rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-[#1A1B41] via-[#10122E] to-[#0B0D21] border border-cyan-400/30 shadow-3d-card flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} className="fill-amber-300" />
                <span>Softrova Security Engine</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white">
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

      {/* App Detail Slide-Over Modal */}
      <AppDetailModal
        app={activeModalApp}
        onClose={() => setActiveModalApp(null)}
        onDownload={handleDownload}
        isDownloading={downloadingAppId === activeModalApp?.id}
        downloadProgress={downloadProgress}
      />

      {/* Mobile Download Complete Installation Helper Banner */}
      {installedAppBanner && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-4 rounded-2xl bg-[#0D0F24]/95 border border-cyan-400/50 shadow-neon-cyan backdrop-blur-md flex items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-3 min-w-0">
            <AppIcon
              iconUrl={installedAppBanner.iconUrl}
              iconType={installedAppBanner.iconType}
              iconBg={installedAppBanner.iconBg}
              size="sm"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">
                {installedAppBanner.name} Downloaded!
              </h4>
              <p className="text-[11px] text-cyan-300">
                Tap <strong>&ldquo;Open&rdquo;</strong> in your browser bar or notifications to Install.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInstalledAppBanner(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white shrink-0 text-xs"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Semantic Footer */}
      <Footer />
    </div>
  );
}
