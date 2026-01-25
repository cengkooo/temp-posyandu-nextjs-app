'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export type StatusType = 'good' | 'warning' | 'danger' | 'info';

interface StatusIndicatorBadgeProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, {
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  good: {
    icon: <CheckCircle className="w-4 h-4" />,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  danger: {
    icon: <XCircle className="w-4 h-4" />,
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export default function StatusIndicatorBadge({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = '',
}: StatusIndicatorBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeConfig[size]}
        ${className}
      `}
    >
      {showIcon && config.icon}
      {label}
    </span>
  );
}

// Preset badges for common use cases
export function GiziBaikBadge() {
  return <StatusIndicatorBadge status="good" label="Gizi Baik" />;
}

export function GiziKurangBadge() {
  return <StatusIndicatorBadge status="warning" label="Gizi Kurang" />;
}

export function GiziBurukBadge() {
  return <StatusIndicatorBadge status="danger" label="Gizi Buruk" />;
}

export function StuntingBadge() {
  return <StatusIndicatorBadge status="danger" label="Stunting" />;
}

export function WastingBadge() {
  return <StatusIndicatorBadge status="danger" label="Wasting" />;
}

export function NormalBadge() {
  return <StatusIndicatorBadge status="good" label="Normal" />;
}

export function RisikoKEKBadge() {
  return <StatusIndicatorBadge status="warning" label="Risiko KEK" />;
}
