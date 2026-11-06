'use client';

import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Compass,
  Box,
  Terminal,
  Gamepad2,
  PenTool,
  Lock,
  Layers,
  Cpu
} from 'lucide-react';

interface AppIconProps {
  iconType: string;
  iconBg: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glowColor?: string;
  className?: string;
}

export default function AppIcon({
  iconType,
  iconBg,
  size = 'md',
  glowColor,
  className = '',
}: AppIconProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl p-2',
    md: 'w-16 h-16 rounded-2xl p-3.5',
    lg: 'w-24 h-24 rounded-3xl p-5',
    xl: 'w-32 h-32 rounded-[2rem] p-7',
  }[size];

  const iconSizes = {
    sm: 18,
    md: 28,
    lg: 44,
    xl: 60,
  }[size];

  const renderIcon = () => {
    const props = { size: iconSizes, className: 'text-white drop-shadow-md' };
    switch (iconType) {
      case 'sparkles':
        return <Sparkles {...props} />;
      case 'shield':
        return <ShieldCheck {...props} />;
      case 'canvas':
        return <Compass {...props} />;
      case 'box':
        return <Box {...props} />;
      case 'terminal':
        return <Terminal {...props} />;
      case 'gamepad':
        return <Gamepad2 {...props} />;
      case 'pen-tool':
        return <PenTool {...props} />;
      case 'lock':
        return <Lock {...props} />;
      case 'cpu':
        return <Cpu {...props} />;
      default:
        return <Layers {...props} />;
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center bg-gradient-to-br ${iconBg} ${sizeClasses} shadow-lg transition-transform duration-300 transform-gpu ${className}`}
      style={{
        boxShadow: glowColor
          ? `0 12px 30px -4px ${glowColor}, inset 0 1px 1px 0 rgba(255,255,255,0.4)`
          : '0 12px 25px -4px rgba(0, 229, 255, 0.35), inset 0 1px 1px 0 rgba(255,255,255,0.4)',
      }}
    >
      {/* 3D Glass Sheen Highlight */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/25 to-transparent pointer-events-none opacity-80" />
      
      {/* Center Icon */}
      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
        {renderIcon()}
      </div>
    </div>
  );
}
