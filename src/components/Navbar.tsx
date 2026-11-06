'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  SlidersHorizontal,
  Shield,
  User,
  Sparkles,
  UploadCloud,
  X,
  ExternalLink
} from 'lucide-react';
import { AppCategory } from '@/types/app';

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
  const [logoError, setLogoError] = useState(false);

  const categories: AppCategory[] = [
    'All',
    'AI',
    'Productivity',
    'Games',
    'Tools',
    'Security',
    'Design',
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B0D21]/80 border-b border-cyan-500/20 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Brand Identity */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group shrink-0 focus:outline-none"
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden bg-[#1A1B41] border border-cyan-400/40 shadow-neon-cyan transition-all duration-300 group-hover:border-cyan-300 group-hover:scale-105 group-hover:shadow-neon-cyan-lg">
              <img
                src="/softrova-logo.png"
                alt="Softrova Brand Logo"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                  SOFTROVA
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  STORE
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Next-Gen Applications
              </span>
            </div>
          </Link>

          {/* Interactive Search Bar */}
          <div className="flex-1 max-w-xl mx-2 hidden sm:block">
            <div
              className={`relative flex items-center w-full rounded-full transition-all duration-300 ${
                isSearchFocused
                  ? 'bg-[#15173B] ring-2 ring-cyan-400/80 shadow-[0_0_25px_rgba(0,229,255,0.25)]'
                  : 'bg-[#10122E]/90 border border-cyan-500/20 hover:border-cyan-500/40'
              }`}
            >
              <Search
                size={18}
                className={`ml-4 transition-colors ${
                  isSearchFocused ? 'text-cyan-400' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search futuristic apps, AI models, developer tools..."
                className="w-full py-2.5 px-3 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="mr-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  <X size={14} />
                </button>
              )}
              <div className="mr-3 hidden md:flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/50">
                <span>/</span>
              </div>
            </div>
          </div>

          {/* Right Actions: Admin Upload & Account Button */}
          <div className="flex items-center gap-3">
            {/* Admin Upload Route Link */}
            <Link
              href="/admin/upload"
              className="relative group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1A1B41] to-[#24265A] border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:text-white hover:border-cyan-400 hover:shadow-neon-cyan transition-all"
            >
              <UploadCloud size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline">Admin Upload</span>
              <span className="inline-flex w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </Link>

            {/* Simulated User Account Button */}
            <button
              type="button"
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#10122E] border border-slate-700/60 hover:border-amber-400/50 text-slate-200 hover:text-white transition-all group"
            >
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-cyan-400 to-indigo-600 p-[1px]">
                <div className="w-full h-full rounded-[7px] bg-[#0B0D21] flex items-center justify-center">
                  <User size={16} className="text-cyan-300 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  Talha
                </span>
                <span className="text-[10px] text-amber-300 flex items-center gap-1 font-medium">
                  <Sparkles size={10} className="fill-amber-300" /> Pro Developer
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3.5 sm:hidden">
          <div className="relative flex items-center w-full rounded-full bg-[#10122E] border border-cyan-500/20 px-3 py-2">
            <Search size={16} className="text-slate-400 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search apps, tools & AI..."
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

        {/* Category Pills Navigation Sub-bar */}
        <nav aria-label="App Categories" className="flex items-center gap-2 py-2.5 overflow-x-auto no-scrollbar border-t border-slate-800/60">
          <span className="text-xs font-semibold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <SlidersHorizontal size={12} className="text-cyan-400" /> Filters:
          </span>
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 ${
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
