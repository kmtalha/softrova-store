# 🌐 Softrova App Store

> Futuristic, high-performance, dark-mode application store frontend built with Next.js 14, Tailwind CSS, and Framer Motion. Engineered for static deployment on **Cloudflare Pages** at `store.softrova.com`.

---

## 🎨 Design Language & Color Palette

- **Brand Navy Blue**: `#1A1B41` & `#0B0D21` (Strict Dark Mode)
- **Vibrant Cyan**: `#00E5FF` (Gradients, glowing pill buttons, active borders)
- **Golden-Yellow**: `#FFD700` (Ratings, verified badges, sparkles)
- **Crisp White & Slate**: `#FFFFFF` & `#94A3B8` (High readability typography)

---

## ✨ Features

1. **Futuristic 3D Storefront**:
   - Dynamic 3D Hero Carousel with spotlight showcase, ambient cyber glow, and direct install triggers.
   - Real-time search with keyboard shortcut (`/`), category filters (AI, Productivity, Games, Tools, Security, Design), and multi-criteria sorting (Featured, Rating, Name).
   - Interactive 3D tilt app cards with mouse-tracking specular reflection, verified developer badge, and download progress animation.

2. **App Detail 3D Modal**:
   - High-resolution 3D perspective screenshot gallery.
   - Comprehensive technical specifications (Package ID, Architecture, System Requirements, Permissions).
   - Verified SHA-256 Checksum with one-click copy.
   - Version history and changelog notes.

3. **Admin Publishing Route (`/admin/upload`)**:
   - Restricted route with cyber-security visual cues (TLS 1.3 encryption badge, JWT token status).
   - Drag-and-drop file upload for APKs, ZIPs, EXEs, and DMGs.
   - Client-side SHA-256 checksum generation.
   - Form inputs for app metadata, category, version, and architecture.
   - Architecture documentation & ready-to-run FastAPI + Cloudflare R2 code snippet.

4. **SEO & Static Site Generation (SSG)**:
   - Compatible with Cloudflare Pages free tier (`output: 'export'`).
   - Semantic HTML5 tags (`<main>`, `<article>`, `<header>`, `<nav>`, `<footer>`).
   - Schema.org JSON-LD structured data and Open Graph / Twitter meta tags.
   - Pre-configured `public/_headers` file with strict Content Security Policy (CSP).

---

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production static export (outputs to /out)
npm run build
```

See [DEPLOYMENT.md](file:///c:/Users/K%20M%20Talha/Downloads/Softrova/DEPLOYMENT.md) for full Cloudflare Pages and FastAPI instructions.
