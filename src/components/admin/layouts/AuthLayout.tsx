import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import BackgroundDecoration from './BackgroundDecoration';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  backButtonText?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showBackButton = true,
  backButtonHref = '/',
  backButtonText = 'Kembali ke Beranda',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <BackgroundDecoration />

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        {showBackButton && (
          <Link
            href={backButtonHref}
            className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{backButtonText}</span>
          </Link>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-teal-100/50 p-8 border border-teal-50">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-200/50">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 Posyandu Melati. All rights reserved.
        </p>
      </div>
    </div>
  );
}
