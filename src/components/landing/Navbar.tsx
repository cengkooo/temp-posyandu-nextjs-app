'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
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

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <div className="logo-icon">
            <Heart size={24} fill="white" />
          </div>
          <span className="logo-text">Posyandu Sehat</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="navbar-menu desktop-menu">
          {menuItems.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="menu-link">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Login Button */}
        <div className="navbar-actions">
          
          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <ul className="mobile-menu-list">
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
