import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0B0D21",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://store.softrova.com"),
  title: "Softrova App Store | Next-Gen Futuristic Applications & AI Tools",
  description:
    "Explore the official Softrova App Store. Discover high-performance, cryptographically verified AI suites, developer tools, security engines, and creative workstations.",
  keywords: [
    "Softrova",
    "App Store",
    "Futuristic Applications",
    "AI Tools",
    "CyberSecurity",
    "Developer Tools",
    "Cloudflare Pages",
    "Dark Mode App Store",
  ],
  authors: [{ name: "Softrova Labs", url: "https://softrova.com" }],
  creator: "Softrova Labs",
  publisher: "Softrova",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://store.softrova.com",
    title: "Softrova App Store | Next-Gen Futuristic Applications",
    description:
      "Modern, futuristic application store featuring zero-bloatware verified binaries, AI models, and developer tools.",
    siteName: "Softrova App Store",
    images: [
      {
        url: "/softrova-banner.png",
        width: 1200,
        height: 630,
        alt: "Softrova App Store Hero Preview",
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
  },
  icons: {
    icon: "/softrova-logo.png",
    shortcut: "/softrova-logo.png",
    apple: "/softrova-logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Softrova App Store",
    operatingSystem: "Windows, macOS, Linux, Android",
    applicationCategory: "ApplicationStore",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "Softrova Labs",
      url: "https://softrova.com",
    },
    description:
      "The premier futuristic application platform engineered for AI creators, developers, and power users.",
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        {/* Semantic Content Security Policy (Mockup Meta Tag for static SSG) */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:; object-src 'none';"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0B0D21] text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
