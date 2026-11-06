import { SiteSettings } from '@/types/settings';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  storeName: 'Softrova App Store',
  tagline: 'The premier futuristic software platform engineered for AI creators, developers, and power users.',
  supportEmail: 'contact@softrova.com',
  copyrightText: `© ${new Date().getFullYear()} Softrova Labs Inc. All rights reserved.`,
  socials: {
    twitter: 'https://twitter.com/softrova',
    linkedin: 'https://linkedin.com/company/softrova',
    github: 'https://github.com/softrova',
    discord: 'https://discord.gg/softrova',
    youtube: 'https://youtube.com/@softrova',
    website: 'https://softrova.com',
    email: 'mailto:contact@softrova.com',
  },
};
