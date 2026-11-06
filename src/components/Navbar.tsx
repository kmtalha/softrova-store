'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Shield,
  User,
  Sparkles,
  UploadCloud,
  X,
  Menu,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AppCategory } from '@/types/app';
import { sanitizeString } from '@/lib/security';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: AppCategory;
  onSelectCategory: (category: AppCategory) => void;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}: NavbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories: AppCategory[] = [
    'All',
    'AI',
    'Productivity',
    'Games',
    'Tools',
    'Security',
    'Design',
  ];

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizeString(e.target.value, 100);
    onSearchChange(clean);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B0D21]/85 border-b border-cyan-500/20 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Logo & Brand Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-2xl"
            aria-label="Softrova Home"
          >
            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-[#1A1B41] border border-cyan-400/40 shadow-neon-cyan transition-all duration-300 group-hover:border-cyan-300 group-hover:scale-105 group-hover:shadow-neon-cyan-lg">
              <img
                src="/softrova-logo.png"
                alt="Softrova Official Logo"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                width={48}
                height={48}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                  SOFTROVA
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  STORE
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide hidden xs:inline">
                Next-Gen Applications
              </span>
            </div>
          </Link>

          {/* Interactive Search Bar (Tablet & Desktop) */}
          <div className="flex-1 max-w-lg mx-2 hidden md:block">
            <div
              className={`relative flex items-center w-full rounded-full transition-all duration-300 ${
                isSearchFocused
                  ? 'bg-[#15173B] ring-2 ring-cyan-400/80 shadow-[0_0_25px_rgba(0,229,255,0.25)]'
                  : 'bg-[#10122E]/90 border border-cyan-500/20 hover:border-cyan-500/40'
              }`}
            >
              <Search
                size={17}
                className={`ml-4 shrink-0 transition-colors ${
                  isSearchFocused ? 'text-cyan-400' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                maxLength={100}
                placeholder="Search futuristic apps, AI models, tools..."
                className="w-full py-2.5 px-3 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search query"
                  className="mr-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  <X size={14} />
                </button>
              )}
              <div className="mr-3 hidden lg:flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/50">
                <span>/</span>
              </div>
            </div>
          </div>

          {/* Right Actions: Admin Upload, Account, & Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Upload Route Link */}
            <Link
              href="/admin/upload/"
              className="relative group hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1A1B41] to-[#24265A] border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:text-white hover:border-cyan-400 hover:shadow-neon-cyan transition-all"
            >
              <UploadCloud size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Admin Portal</span>
              <span className="inline-flex w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </Link>

            {/* Simulated User Account Badge */}
            <div className="hidden sm:flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#10122E] border border-slate-700/60 text-slate-200">
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-cyan-400 to-indigo-600 p-[1px]">
                <div className="w-full h-full rounded-[7px] bg-[#0B0D21] flex items-center justify-center">
                  <User size={15} className="text-cyan-300" />
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  Talha
                </span>
                <span className="text-[10px] text-amber-300 flex items-center gap-1 font-medium">
                  <Sparkles size={9} className="fill-amber-300" /> Verified
                </span>
              </div>
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-[#10122E] border border-cyan-500/30 text-slate-200 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Visible on mobile/tablet) */}
        <div className="pb-3 md:hidden">
          <div className="relative flex items-center w-full rounded-full bg-[#10122E] border border-cyan-500/25 px-3 py-2">
            <Search size={16} className="text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              maxLength={100}
              placeholder="Search apps, AI tools, games..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 text-slate-400"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-3 bg-[#0B0D21]/95 animate-fade-in">
            <Link
              href="/admin/upload/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-[#15173B] border border-cyan-500/30 text-sm font-bold text-cyan-300"
            >
              <div className="flex items-center gap-2.5">
                <UploadCloud size={18} />
                <span>Admin Upload Portal</span>
              </div>
              <ChevronRight size={16} />
            </Link>

            <div className="p-3 rounded-xl bg-[#10122E] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Shield size={16} className="text-cyan-400" />
                <span>Zero Telemetry Guarantee</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Active
              </span>
            </div>
          </div>
        )}

        {/* Category Pills Navigation Sub-bar */}
        <nav
          aria-label="App Categories"
          className="flex items-center gap-2 py-2.5 overflow-x-auto no-scrollbar border-t border-slate-800/60"
        >
          <span className="text-xs font-semibold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1.5 mr-1 hidden sm:flex">
            <SlidersHorizontal size={12} className="text-cyan-400" /> Filters:
          </span>
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`relative px-4 py-2 sm:py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 min-h-[36px] sm:min-h-0 flex items-center justify-center ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-neon-cyan-pill border border-cyan-300/40'
                    : 'text-slate-300 bg-[#15173B]/70 border border-slate-700/50 hover:border-cyan-400/40 hover:text-white hover:bg-[#1A1B41]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
