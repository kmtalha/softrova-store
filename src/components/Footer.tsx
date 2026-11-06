'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Cloud, Server, Sparkles, Terminal, Github, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-cyan-500/20 bg-gradient-to-b from-[#0B0D21] to-[#060714] text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1A1B41] to-[#00E5FF]/30 border border-cyan-400/40 flex items-center justify-center font-bold text-white text-sm">
                S
              </div>
              <span className="text-base font-extrabold text-white tracking-wider">
                SOFTROVA
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              The premier futuristic application platform engineered for AI creators, developers, and power users.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[11px] text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (Edge 99.99%)</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Ecosystem
            </h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-cyan-300 transition-colors">AI & Autonomous Agents</Link></li>
              <li><Link href="/" className="hover:text-cyan-300 transition-colors">Developer & Terminal Tools</Link></li>
              <li><Link href="/" className="hover:text-cyan-300 transition-colors">Cybersecurity & Zero-Trust</Link></li>
              <li><Link href="/" className="hover:text-cyan-300 transition-colors">Spatial 3D & Creative Suites</Link></li>
            </ul>
          </div>

          {/* Architecture & Cloudflare */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Deployment Architecture
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <Cloud size={14} className="text-cyan-400" />
                <span>Cloudflare Pages (Global Edge SSG)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Server size={14} className="text-cyan-400" />
                <span>FastAPI Backend + Cloudflare R2</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck size={14} className="text-cyan-400" />
                <span>Strict CSP & Subresource Integrity</span>
              </div>
            </div>
          </div>

          {/* Admin & Security */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Administration
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin/upload"
                  className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-white font-semibold transition-colors"
                >
                  <Terminal size={13} />
                  <span>Admin Upload Portal</span>
                </Link>
              </li>
              <li><span className="text-slate-500">store.softrova.com</span></li>
              <li><span className="text-slate-500">PGP Key ID: 0x9F86D081</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Softrova Labs Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Strict Dark Mode Protocol</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">Color Palette: #1A1B41 • #00E5FF • #FFD700</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
