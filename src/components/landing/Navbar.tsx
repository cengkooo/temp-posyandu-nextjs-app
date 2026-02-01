'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const scrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-3 px-4 md:px-8' : 'py-6 px-6 md:px-12'}`}>
      <div className={`mx-auto max-w-7xl flex items-center justify-between transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg px-6 py-2 rounded-full' : ''}`}>
        
        {/* Logo */}
        <div onClick={() => scrollTo('#beranda')} className="flex items-center gap-3 cursor-pointer group">
          <div className="bg-gradient-to-tr  p-2.5 rounded-xl shadow-lg shadow-teal-200 transition-transform group-hover:rotate-12">
            <img src="/Dinkes.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="flex flex-col">
          
            <span className={`font-bold text-lg leading-tight transition-colors ${isScrolled ? 'text-slate-900' : 'text-white'}`}>Way Kalam</span>
            <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold transition-colors ${isScrolled ? 'text-teal-600' : 'text-teal-200'}`}>Posyandu Terpadu</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              className={`px-5 py-2 text-sm font-semibold transition-all rounded-full hover:bg-teal-50 ${isScrolled ? 'text-slate-600 hover:text-teal-600' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            >
              {item.label}
            </button>
          ))}
          <Link 
            href="/login"
            className={`ml-4 px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 ${isScrolled ? 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-teal-100' : 'bg-white text-teal-700 hover:bg-teal-50'}`}
          >
            Masuk <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`lg:hidden p-2 rounded-full transition-colors ${isScrolled ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 p-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 lg:hidden flex flex-col gap-2">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              className="text-left px-4 py-3 rounded-xl font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="h-px bg-slate-100 my-2"></div>
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-center px-4 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
          >
            Masuk Akun
          </Link>
        </div>
      )}
    </nav>
  );
}