import { AppItem } from '@/types/app';

export const INITIAL_APPS: AppItem[] = [
  {
    id: 'softrova-ai-studio',
    name: 'Softrova AI Studio',
    tagline: 'Autonomous Generative Intelligence Suite',
    shortDescription: 'Next-generation multimodal AI workstation with local LLM acceleration and agent orchestration.',
    fullDescription: 'Softrova AI Studio is the flagship workspace for AI developers, researchers, and creators. Featuring zero-latency neural pipeline orchestration, hybrid cloud & on-device tensor operations, and direct integration with local models. Transform multimodal workflows into high-speed automated pipelines.',
    developer: 'Softrova Labs',
    verified: true,
    rating: 4.95,
    reviewsCount: 3840,
    category: 'AI',
    badge: 'Softrova Original',
    featured: true,
    heroHeadline: 'The Next Era of Generative Intelligence',
    heroSubheadline: 'Unleash autonomous agent pipelines with hardware-accelerated local tensor cores.',
    price: 'Free',
    size: '184 MB',
    version: '3.4.0',
    updatedAt: 'Nov 2026',
    iconBg: 'from-cyan-400 via-blue-600 to-indigo-900',
    iconType: 'sparkles',
    accentGlow: 'rgba(0, 229, 255, 0.6)',
    screenshots: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&auto=format&fit=crop&q=80'
    ],
    features: [
      'Local on-device inference with WebGPU & TensorRT support',
      'Multi-agent workflow DAG builder with real-time telemetry',
      'Encrypted local vector memory with zero telemetry leak',
      'Seamless deployment to Cloudflare Workers & R2'
    ],
    changelog: [
      {
        version: 'v3.4.0',
        date: 'November 2026',
        notes: [
          'Added native quantized INT4 engine support',
          'Enhanced 3D graph visualization for agent threads',
          'Resolved memory spike during multi-gigabyte document indexing'
        ]
      },
      {
        version: 'v3.3.2',
        date: 'October 2026',
        notes: [
          'Introduced streaming token inspector',
          'Added Dark Glassmorphism 2.0 UI layout'
        ]
      }
    ],
    specs: {
      packageId: 'com.softrova.aistudio',
      architecture: 'Universal x86_64 / arm64',
      minOs: 'Windows 11 / macOS 13+ / Linux kernel 6.0+',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      permissions: ['Hardware Acceleration', 'Local Storage Read/Write', 'Network Access']
    },
    downloadUrl: '#'
  },
  {
    id: 'cybershield-sentinel',
    name: 'CyberShield Sentinel',
    tagline: 'Zero-Trust Endpoint Security & Threat Telemetry',
    shortDescription: 'Autonomous defensive cybersecurity engine protecting network traffic and runtime process integrity.',
    fullDescription: 'CyberShield Sentinel provides real-time behavioral protection against zero-day exploit payloads, malicious kernel injections, and unauthorized telemetry extraction. Designed for maximum security with minimal system overhead.',
    developer: 'Softrova CyberSec',
    verified: true,
    rating: 4.9,
    reviewsCount: 2190,
    category: 'Security',
    badge: 'Editor\'s Choice',
    featured: true,
    heroHeadline: 'Zero-Trust Autonomous Cyber Defense',
    heroSubheadline: 'Real-time proactive runtime defense powered by behavioral deep heuristics.',
    price: 'Free',
    size: '64 MB',
    version: '2.8.1',
    updatedAt: 'Nov 2026',
    iconBg: 'from-emerald-400 via-teal-600 to-navy-950',
    iconType: 'shield',
    accentGlow: 'rgba(0, 255, 178, 0.6)',
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80'
    ],
    features: [
      'Hardware-enforced memory isolation guards',
      'Cryptographic process signature verification',
      'Real-time DNS-over-HTTPS inspection with anomaly alerting',
      'Zero telemetry logging policy'
    ],
    changelog: [
      {
        version: 'v2.8.1',
        date: 'November 2026',
        notes: [
          'Added detection for memory-only heuristic payloads',
          'Optimized background CPU usage to under 0.2%'
        ]
      }
    ],
    specs: {
      packageId: 'com.softrova.cybershield',
      architecture: 'x64, arm64',
      minOs: 'Windows 10/11, Ubuntu 22.04 LTS',
      sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      permissions: ['Kernel Driver Filter', 'Network Filtering', 'Process Monitoring']
    },
    downloadUrl: '#'
  },
  {
    id: 'quantum-flow-notes',
    name: 'Quantum Flow',
    tagline: 'Bionic Markdown & Bi-Directional Mind Canvas',
    shortDescription: 'Supercharged holographic note-taking app with dynamic knowledge graph indexing and offline sync.',
    fullDescription: 'Quantum Flow breaks notes out of static folders and into a dynamic, 3D interactive knowledge galaxy. Seamlessly connects your code snippets, voice memos, and architectural drawings with automatic semantic linking.',
    developer: 'Softrova Labs',
    verified: true,
    rating: 4.88,
    reviewsCount: 1540,
    category: 'Productivity',
    badge: 'Trending',
    featured: true,
    heroHeadline: 'Connect Ideas at the Speed of Thought',
    heroSubheadline: 'Infinite visual canvases and neural graph linking engineered for deep work.',
    price: 'Free',
    size: '92 MB',
    version: '4.1.0',
    updatedAt: 'Oct 2026',
    iconBg: 'from-amber-400 via-rose-500 to-purple-900',
    iconType: 'canvas',
    accentGlow: 'rgba(255, 215, 0, 0.6)',
    screenshots: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80'
    ],
    features: [
      'Interactive 3D WebGL knowledge constellation',
      'Native LaTeX, Mermaid diagrams, and code execution runners',
      'End-to-end encrypted offline-first synchronization',
      'Instant command palette with fuzzy matching'
    ],
    changelog: [
      {
        version: 'v4.1.0',
        date: 'October 2026',
        notes: [
          'Added WebGL 3D graph view rotation and filtering',
          'Instant bidirectional backlink preview on hover'
        ]
      }
    ],
    specs: {
      packageId: 'com.softrova.quantumflow',
      architecture: 'Universal',
      minOs: 'Windows 10/11, macOS 12+, Web',
      sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      permissions: ['Local File Storage', 'Clipboard Access']
    },
    downloadUrl: '#'
  },
  {
    id: 'prism-3d-studio',
    name: 'Prism 3D Studio',
    tagline: 'Real-Time Spatial Model View & VFX Sculptor',
    shortDescription: 'Lightweight GPU-accelerated 3D viewport, shader authoring environment, and GLTF/USDZ packaging tool.',
    fullDescription: 'Prism 3D Studio empowers visual artists and game developers to inspect, tweak, and bake PBR materials and high-poly spatial meshes in milliseconds. Features real-time ray-traced preview with zero render lag.',
    developer: 'Softrova Creative',
    verified: true,
    rating: 4.82,
    reviewsCount: 980,
    category: 'Design',
    badge: 'New',
    featured: false,
    price: 'Free',
    size: '240 MB',
    version: '1.9.4',
    updatedAt: 'Nov 2026',
    iconBg: 'from-fuchsia-500 via-purple-600 to-cyan-500',
    iconType: 'box',
    accentGlow: 'rgba(217, 70, 239, 0.6)',
    screenshots: [
      'https://images.unsplash.com/photo-1633493763260-935df6f7caef?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
    ],
    features: [
      'Real-time PBR material and ray-tracing preview',
      'Direct USDZ / GLTF / FBX export for Web & AR',
      'Procedural node shader graph editor',
      'Preset studio lighting environments'
    ],
    changelog: [
      {
        version: 'v1.9.4',
        date: 'November 2026',
        notes: [
          'Vulkan API rendering pipeline optimizations',
          'Added automatic normal map generation from roughness maps'
        ]
      }
    ],
    specs: {
      packageId: 'com.softrova.prism3d',
      architecture: 'x64, Direct3D 12 / Metal / Vulkan',
      minOs: 'Windows 11, macOS Sonoma',
      sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
      permissions: ['GPU Direct Access', 'File System Read/Write']
    },
    downloadUrl: '#'
  },
  {
    id: 'hyperflow-terminal',
    name: 'HyperFlow Terminal',
    tagline: 'AI-Infused GPU Accelerated Shell & Multiplexer',
    shortDescription: 'Next-generation terminal emulator with predictive auto-complete, split paning, and integrated SSH vault.',
    fullDescription: 'HyperFlow Terminal renders at 120 FPS via Metal/DirectX rendering. Packed with contextual inline AI suggestions, git branch status overlays, and a hardware-isolated SSH credential manager.',
    developer: 'Softrova DevTools',
    verified: true,
    rating: 4.92,
    reviewsCount: 3120,
    category: 'Tools',
    badge: 'Trending',
    featured: false,
    price: 'Free',
    size: '48 MB',
    version: '2.1.2',
    updatedAt: 'Nov 2026',
    iconBg: 'from-cyan-500 via-teal-600 to-blue-900',
    iconType: 'terminal',
    accentGlow: 'rgba(0, 229, 255, 0.6)',
    screenshots: [
      'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80'
    ],
    features: [
      '120 FPS GPU-accelerated glyph rendering',
      'Intelligent autocomplete powered by command history analysis',
      'Encrypted remote session vault with biometric unlock',
      'Native split panes, tabs, and customizable glass themes'
    ],
    changelog: [
      {
        version: 'v2.1.2',
        date: 'November 2026',
        notes: [
          'Added support for custom shaders on cursor movement',
          'Fixed occasional terminal flicker on window resize'
        ]
      }
    ],
    specs: {
      packageId: 'com.softrova.hyperflow',
      architecture: 'Universal x86_64 / arm64',
      minOs: 'Windows 10/11, macOS, Linux',
      sha256: 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2',
      permissions: ['Process Spawning', 'Network Sockets']
    },
    downloadUrl: '#'
  },
  {
    id: 'nova-drift-arcade',
    name: 'Nova Drift: Cyber Strike',
    tagline: 'High-Octane Anti-Gravity Combat Racer',
    shortDescription: 'Defy gravity in neon-drenched cyberpunk tracks with intense weaponized hovercraft racing.',
    fullDescription: 'Experience blistering speed in this futuristic arcade racer built specifically for Softrova Gaming. Compete in global leaderboards, tune your vehicle physics, and master anti-gravity wall-riding maneuvers in 4K 144Hz.',
    developer: 'Softrova Interactive',
    verified: true,
    rating: 4.87,
    reviewsCount: 4520,
    category: 'Games',
    badge: 'Editor\'s Choice',
    featured: false,
    price: 'Free',
    size: '1.2 GB',
    version: '1.4.0',
    updatedAt: 'Oct 2026',
    iconBg: 'from-yellow-400 via-orange-500 to-red-700',
    iconType: 'gamepad',
    accentGlow: 'rgba(255, 215, 0, 0.7)',
    screenshots: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80'
    ],
    features: [
      'Ultra high-speed 144 FPS anti-gravity physics simulator',
      'Cross-platform multiplayer with zero-lag rollback netcode',
      'Original electronic synthwave audio score with spatial sound',
      'Deep hovercraft tuning and customizable glowing neon liveries'
    ],
    changelog: [
      {
        version: 'v1.4.0',
        date: 'October 2026',
        notes: [
          'Added "Neo-Tokyo Skyline" night circuit',
          'Introduced Photon Pulse weapon system'
        ]
      }
    ],
    specs: {
      packageId: 'com.softrova.novadrift',
      architecture: 'x64, Game Controller Recommended',
      minOs: 'Windows 10/11 64-bit',
      sha256: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
      permissions: ['DirectX 12 Hardware', 'Network Gaming Multiplayer']
    },
    downloadUrl: '#'
  },
  {
    id: 'neural-vector-illustrator',
    name: 'Neural Vector Pro',
    tagline: 'Infinite Scalable Generative Vector Canvas',
    shortDescription: 'SVG and icon design suite with integrated AI bezier curve optimization and palette synthesis.',
    fullDescription: 'Neural Vector Pro combines traditional precision pen tools with generative geometry algorithms. Perfect for creating sleek app icons, responsive UI components, and futuristic tech illustrations with clean mathematics.',
    developer: 'Softrova Creative',
    verified: true,
    rating: 4.79,
    reviewsCount: 840,
    category: 'Design',
    badge: 'New',
    featured: false,
    price: 'Free',
    size: '115 MB',
    version: '2.0.5',
    updatedAt: 'Nov 2026',
    iconBg: 'from-cyan-400 via-sky-500 to-indigo-800',
    iconType: 'pen-tool',
    accentGlow: 'rgba(0, 229, 255, 0.5)',
    screenshots: [
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop&q=80'
    ],
    features: [
      'One-click node path simplification with preserved curvature',
      'Smart color harmony synthesizer for neon and dark themes',
      'Direct copy-paste clean React/Next.js SVG components',
      'Variable font editor and vector typography tools'
    ],
    changelog: [
      {
        version: 'v2.0.5',
        date: 'November 2026',
        notes: [
          'Added automatic icon export in 16x16 to 1024x1024 resolutions',
          'Performance boost on canvas zooming beyond 50,000%'
        ]
      }
    ],
    specs: {
      packageId: 'com.softrova.neuralvector',
      architecture: 'Universal',
      minOs: 'Windows 11, macOS 13+',
      sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      permissions: ['Local File Storage']
    },
    downloadUrl: '#'
  },
  {
    id: 'vault-sync-core',
    name: 'VaultSync Core',
    tagline: 'Cryptographic Decentralized Cloud Storage Bridge',
    shortDescription: 'Zero-knowledge client-side encrypted backup utility syncing with Cloudflare R2 and S3 buckets.',
    fullDescription: 'Take back ownership of your files. VaultSync automatically fragments, encrypts with ChaCha20-Poly1305, and mirrors your sensitive data across Cloudflare R2, distributed IPFS nodes, and personal drives.',
    developer: 'Softrova CyberSec',
    verified: true,
    rating: 4.93,
    reviewsCount: 1680,
    category: 'Security',
    badge: 'Softrova Original',
    featured: false,
    price: 'Free',
    size: '56 MB',
    version: '1.7.0',
    updatedAt: 'Oct 2026',
    iconBg: 'from-blue-600 via-indigo-700 to-navy-950',
    iconType: 'lock',
    accentGlow: 'rgba(0, 153, 255, 0.6)',
    screenshots: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80'
    ],
    features: [
      'Client-side ChaCha20-Poly1305 & AES-256-GCM encryption',
      'Native direct pipe to Cloudflare R2 with zero egress fees',
      'Differential file chunking for lightning fast delta sync',
      'Self-destruct timer options for temporary shared links'
    ],
    changelog: [
      {
        version: 'v1.7.0',
        date: 'October 2026',
        notes: [
          'Direct Cloudflare R2 S3-compatible API token wizard',
          'Added automatic deduplication saving up to 40% storage'
        ]
      }
    ],
    specs: {
      packageId: 'com.softrova.vaultsync',
      architecture: 'Universal x86_64 / arm64',
      minOs: 'Windows 10/11, macOS, Linux',
      sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      permissions: ['Encrypted Network Sockets', 'File System Access']
    },
    downloadUrl: '#'
  }
];
