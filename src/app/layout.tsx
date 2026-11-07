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
    default: "Softrova Solutions | Official Next-Gen Software & AI App Store",
    template: "%s | Softrova Solutions",
  },
  description:
    "Explore the official Softrova Solutions App Store. Discover high-performance, cryptographically verified AI suites, developer tools, cybersecurity engines, and creative workstations with zero telemetry.",
  applicationName: "Softrova Solutions",
  keywords: [
    "Softrova",
    "Softrova Solutions",
    "Softrova Store",
    "Futuristic Applications",
    "AI Studio",
    "CyberSecurity Tools",
    "Developer Workstations",
    "Cloudflare Pages Store",
    "Zero Telemetry Software",
    "Encrypted Backup",
    "Next.js App Store",
  ],
  authors: [{ name: "Softrova Solutions", url: "https://softrova.com" }],
  creator: "Softrova Solutions",
  publisher: "Softrova Labs Inc.",
  alternates: {
    canonical: "https://store.softrova.com/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://store.softrova.com",
    siteName: "Softrova Solutions",
    title: "Softrova Solutions | Official Next-Gen Software & AI App Store",
    description:
      "Modern, futuristic application store featuring zero-bloatware verified binaries, AI models, and developer tools by Softrova Solutions.",
    images: [
      {
        url: "/softrova-banner.png",
        width: 1200,
        height: 630,
        alt: "Softrova Solutions Futuristic Interface Preview",
      },
      {
        url: "/softrova-logo.png",
        width: 512,
        height: 512,
        alt: "Softrova Solutions Official Emblem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Softrova Solutions | Official Next-Gen Software & AI App Store",
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
  // Schema.org Structured Data: WebSite, Organization & FAQ for AI / AGO & Google Search
  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://store.softrova.com/#website",
        name: "Softrova Solutions",
        alternateName: ["Softrova", "Softrova App Store", "Softrova Solutions Store"],
        url: "https://store.softrova.com",
        description:
          "Official next-gen application store by Softrova Solutions featuring verified AI models, developer tools, and security engines.",
        publisher: {
          "@id": "https://store.softrova.com/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://store.softrova.com/?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://store.softrova.com/#organization",
        name: "Softrova Solutions",
        legalName: "Softrova Labs Inc.",
        url: "https://store.softrova.com",
        logo: {
          "@type": "ImageObject",
          url: "https://store.softrova.com/softrova-logo.png",
          width: 512,
          height: 512,
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: "support@softrova.com",
          contactType: "Customer Support",
        },
        sameAs: [
          "https://softrova.com",
          "https://github.com/softrova",
          "https://twitter.com/softrova",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://store.softrova.com/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is Softrova Solutions?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Softrova Solutions is an advanced software platform and decentralized application store delivering cryptographically verified AI suites, developer tools, cybersecurity engines, and creative workstations with a strict zero-telemetry and anti-bloatware policy.",
            },
          },
          {
            "@type": "Question",
            name: "How does Softrova Solutions verify application safety?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Every application on Softrova Solutions undergoes strict static binary analysis, runtime vulnerability sandboxing, and zero-telemetry auditing. All packages include verified SHA-256 cryptographic checksums.",
            },
          },
          {
            "@type": "Question",
            name: "What platforms are supported by Softrova Solutions applications?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Applications on Softrova Solutions support modern 64-bit operating systems including Windows 10/11, macOS 12+ (Apple Silicon and Intel), Linux distributions, and Android.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: https://*.supabase.co wss://*.supabase.co; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className="bg-[#0B0D21] text-white antialiased min-h-screen selection:bg-cyan-400 selection:text-slate-950 pb-[env(safe-area-inset-bottom)]">
        {children}
      </body>
    </html>
  );
}
