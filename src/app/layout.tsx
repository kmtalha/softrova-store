import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0B0D21",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://store.softrova.com"),
  title: {
    default: "Softrova App Store | Next-Gen AI & Futuristic Applications",
    template: "%s | Softrova Store",
  },
  description:
    "Explore the official Softrova App Store. Discover high-performance, cryptographically verified AI suites, developer tools, security engines, and creative workstations.",
  applicationName: "Softrova Store",
  keywords: [
    "Softrova",
    "App Store",
    "Futuristic Applications",
    "AI Studio",
    "CyberSecurity",
    "Developer Shell",
    "Cloudflare Pages Store",
    "Zero Telemetry Software",
    "Next.js App Store",
  ],
  authors: [{ name: "Softrova Labs", url: "https://softrova.com" }],
  creator: "Softrova Labs",
  publisher: "Softrova Inc.",
  alternates: {
    canonical: "https://store.softrova.com/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://store.softrova.com",
    siteName: "Softrova App Store",
    title: "Softrova App Store | Next-Gen Futuristic Applications",
    description:
      "Modern, futuristic application store featuring zero-bloatware verified binaries, AI models, and developer tools.",
    images: [
      {
        url: "/softrova-banner.png",
        width: 1200,
        height: 630,
        alt: "Softrova Store Futuristic Interface Preview",
      },
      {
        url: "/softrova-logo.png",
        width: 512,
        height: 512,
        alt: "Softrova Official Emblem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Softrova App Store | Next-Gen Futuristic Applications",
    description:
      "Modern, futuristic application store featuring zero-bloatware verified binaries, AI models, and developer tools.",
    images: ["/softrova-banner.png"],
    creator: "@softrova",
    site: "@softrova",
  },
  icons: {
    icon: [
      { url: "/softrova-logo.png" },
      { url: "/softrova-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/softrova-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/softrova-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/softrova-logo.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org Structured Data: WebSite & Organization
  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Softrova App Store",
    url: "https://store.softrova.com",
    description:
      "Official futuristic application store for Softrova AI Studio, CyberShield, and creative tools.",
    publisher: {
      "@type": "Organization",
      name: "Softrova Labs",
      logo: {
        "@type": "ImageObject",
        url: "https://store.softrova.com/softrova-logo.png",
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://store.softrova.com/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className="bg-[#0B0D21] text-white antialiased min-h-screen selection:bg-cyan-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
