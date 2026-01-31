'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Deteksi scroll untuk mengubah style navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Beranda', href: '#beranda' },
    { label: 'Tentang', href: '#tentang' },
    { label: 'Layanan', href: '#layanan' },
    { label: 'Jadwal', href: '#jadwal' },
    { label: 'Tim', href: '#tim' },
  ];

  // Logic warna teks: Putih saat di atas (transparent), Gelap saat di-scroll (putih)
  const textColorClass = isScrolled ? "text-slate-800" : "text-white drop-shadow-md";
  const hoverColorClass = isScrolled ? "hover:text-emerald-600" : "hover:text-emerald-200";
  const burgerColorClass = isScrolled ? "text-slate-700 hover:bg-emerald-50" : "text-white hover:bg-white/10";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-emerald-100/50 shadow-sm py-2'
          : 'bg-gradient-to-b from-black/50 to-transparent border-transparent py-4'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Heart size={20} fill="white" className="text-white" />
          </div>
          <span className={`text-lg font-bold tracking-wide transition-colors duration-300 ${textColorClass}`}>
            Posyandu Sehat
          </span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden items-center gap-8 md:flex">
          {menuItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`relative text-sm font-medium transition-all duration-300 group ${textColorClass} ${hoverColorClass}`}
              >
                {item.label}
                {/* Animasi Garis Bawah (Underline) */}
                <span className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-300 w-0 group-hover:w-full ${
                    isScrolled ? "bg-emerald-500" : "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                }`} />
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-4">
          
          {/* Login Button Premium */}
          <Link
            href="/login"
            className={`hidden md:flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg group ${
                isScrolled
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white hover:shadow-emerald-500/30"
                : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:shadow-white/10"
            }`}
          >
            Masuk
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`rounded-lg p-2 transition-colors md:hidden ${burgerColorClass}`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Animated */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-emerald-100 shadow-xl transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-5 invisible"
        }`}
      >
        <div className="flex flex-col p-4 space-y-2">
          {menuItems.map((item, idx) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:translate-x-2"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {item.label}
            </a>
          ))}

          <div className="pt-2 mt-2 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-emerald-600 active:scale-95"
            >
              Masuk Akun
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}