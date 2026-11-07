'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Mail,
  Lock,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '@/data/settings';
import { SiteSettings } from '@/types/settings';
import { getSupabase } from '@/lib/supabase';

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    async function loadFooterSettings() {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const { data } = await supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle();
          if (data) {
            setSettings({
              storeName: DEFAULT_SITE_SETTINGS.storeName,
              tagline: data.tagline || DEFAULT_SITE_SETTINGS.tagline,
              supportEmail: data.support_email || DEFAULT_SITE_SETTINGS.supportEmail,
              copyrightText: data.copyright_text || DEFAULT_SITE_SETTINGS.copyrightText,
              socials: data.socials || DEFAULT_SITE_SETTINGS.socials,
            });
            return;
          }
        }
        const stored = localStorage.getItem('softrova_site_settings');
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } catch {
        // Fallback to default
      }
    }
    loadFooterSettings();
  }, []);

  return (
    <footer className="w-full border-t border-cyan-500/20 bg-gradient-to-b from-[#0B0D21] via-[#080918] to-[#04050D] text-slate-400 text-xs py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 4-Column Professional Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-cyan-400/40 shadow-neon-cyan shrink-0 bg-[#0B0D21]">
                <img
                  src="/softrova-logo.png"
                  alt="Softrova"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <Sparkles size={10} className="fill-amber-400 text-amber-400 absolute top-0.5 right-0.5 pointer-events-none drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
              </div>
              <div className="flex flex-col justify-center leading-none">
                <span className="text-xl font-black text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  Softrova
                </span>
                <span className="text-[10px] font-extrabold text-cyan-400 tracking-[0.26em] uppercase mt-1">
                  SOLUTIONS
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {settings.tagline}
            </p>

            {/* Operational Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Global Edge Network Operational (99.99%)</span>
            </div>
          </div>

          {/* Col 2: Platform Ecosystem (2-3 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/?category=AI" className="hover:text-cyan-300 transition-colors">
                  Softrova AI Studio
                </Link>
              </li>
              <li>
                <Link href="/?category=Security" className="hover:text-cyan-300 transition-colors">
                  CyberShield Sentinel
                </Link>
              </li>
              <li>
                <Link href="/?category=Tools" className="hover:text-cyan-300 transition-colors">
                  HyperFlow Terminal
                </Link>
              </li>
              <li>
                <Link href="/?category=Productivity" className="hover:text-cyan-300 transition-colors">
                  Quantum Flow Notes
                </Link>
              </li>
              <li>
                <Link href="/?category=Design" className="hover:text-cyan-300 transition-colors">
                  Prism 3D Spatial
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Governance (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Resources & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" onClick={(e) => e.preventDefault()} className="hover:text-cyan-300 transition-colors">
                  Security & Integrity Protocol
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => e.preventDefault()} className="hover:text-cyan-300 transition-colors">
                  Developer Documentation
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => e.preventDefault()} className="hover:text-cyan-300 transition-colors">
                  Privacy Policy & Zero Telemetry
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => e.preventDefault()} className="hover:text-cyan-300 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => e.preventDefault()} className="hover:text-cyan-300 transition-colors">
                  Brand Guidelines & Press Kit
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Social Channels (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Official Channels
            </h4>
            <p className="text-[11px] text-slate-400">
              Stay informed with product updates, developer builds, and ecosystem releases.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Twitter / X */}
              {settings.socials.twitter && (
                <a
                  href={settings.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#15173B] hover:bg-[#1A1B41] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all shadow-sm"
                  aria-label="Softrova on X / Twitter"
                  title="X (Twitter)"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}

              {/* LinkedIn */}
              {settings.socials.linkedin && (
                <a
                  href={settings.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#15173B] hover:bg-[#1A1B41] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all shadow-sm"
                  aria-label="Softrova LinkedIn"
                  title="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}

              {/* GitHub */}
              {settings.socials.github && (
                <a
                  href={settings.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#15173B] hover:bg-[#1A1B41] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all shadow-sm"
                  aria-label="Softrova GitHub"
                  title="GitHub"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              )}

              {/* Discord */}
              {settings.socials.discord && (
                <a
                  href={settings.socials.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#15173B] hover:bg-[#1A1B41] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all shadow-sm"
                  aria-label="Softrova Discord Community"
                  title="Discord"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 chip 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
              )}

              {/* YouTube */}
              {settings.socials.youtube && (
                <a
                  href={settings.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#15173B] hover:bg-[#1A1B41] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all shadow-sm"
                  aria-label="Softrova YouTube"
                  title="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}

              {/* Website */}
              {settings.socials.website && (
                <a
                  href={settings.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#15173B] hover:bg-[#1A1B41] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all shadow-sm"
                  aria-label="Softrova Main Website"
                  title="Official Website"
                >
                  <Globe size={16} />
                </a>
              )}

              {/* Email */}
              {settings.supportEmail && (
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="p-2.5 rounded-xl bg-[#15173B] hover:bg-[#1A1B41] border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all shadow-sm"
                  aria-label="Contact Softrova Support"
                  title="Contact Support"
                >
                  <Mail size={16} />
                </a>
              )}
            </div>

            <p className="text-[11px] text-slate-500 pt-1 font-mono">
              Inquiries: {settings.supportEmail}
            </p>
          </div>

        </div>

        {/* Bottom Clean Copyright Bar with Subtle Lock Line */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>{settings.copyrightText}</p>

          <div className="flex items-center gap-4">
            {/* Discreet Admin Lock Link */}
            <Link
              href="/admin/upload/"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-cyan-400 transition-colors group"
              title="Authorized Personnel Console"
            >
              <Lock size={12} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
              <span className="group-hover:underline">Admin Console</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
