export type AppCategory = string;

export interface AppChangelog {
  version: string;
  date: string;
  notes: string[];
}

export interface AppSpecs {
  packageId: string;
  architecture: string;
  minOs: string;
  sha256: string;
  permissions: string[];
}

export interface AppItem {
  id: string;
  name: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  developer: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  category: string;
  badge?: 'Editor\'s Choice' | 'Trending' | 'New' | 'Featured' | 'Softrova Original';
  featured?: boolean;
  heroHeadline?: string;
  heroSubheadline?: string;
  price: string;
  size: string;
  version: string;
  updatedAt: string;
  iconBg: string;
  iconType: string;
  iconUrl?: string;
  accentGlow: string;
  screenshots: string[];
  features: string[];
  changelog: AppChangelog[];
  specs: AppSpecs;
  downloadUrl: string;
}
