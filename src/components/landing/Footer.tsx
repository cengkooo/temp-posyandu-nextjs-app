'use client';

import React from 'react';
import { Heart, MapPin, Phone, Mail, Facebook, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          {/* Column 1 - Logo & Description */}
          <div className="footer-column">
            <div className="footer-logo">
              <div className="logo-icon">
                <Heart size={24} fill="white" />
              </div>
              <div>
                <h3 className="logo-title">Posyandu Sehat</h3>
                <p className="logo-subtitle">Mandiri</p>
              </div>
            </div>
            <p className="footer-description">
              Melayani dengan hati untuk kesehatan keluarga Indonesia. Bersama kita wujudkan generasi sehat dan sejahtera.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-link" aria-label="WhatsApp">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="footer-column">
            <h4 className="footer-heading">Menu Cepat</h4>
            <ul className="footer-links">
              <li><a href="#tentang">Tentang Kami</a></li>
              <li><a href="#layanan">Layanan</a></li>
              <li><a href="#jadwal">Jadwal</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#galeri">Galeri</a></li>
            </ul>
          </div>

          {/* Column 3 - Contact Info */}
          <div className="footer-column">
            <h4 className="footer-heading">Hubungi Kami</h4>
            <ul className="contact-info">
              <li className="contact-item">
                <MapPin size={18} />
                <div>
                  <strong>Jl. Kesehatan No. 123</strong>
                  <p>Desa Sukamaju, Kec. Harapan Jaya</p>
                </div>
              </li>
              <li className="contact-item">
                <Phone size={18} />
                <div>
                  <strong>(021) 1234-5678</strong>
                  <p>WA: 0812-3456-7890</p>
                </div>
              </li>
              <li className="contact-item">
                <Mail size={18} />
                <div>
                  <strong>posyandu.sehatmandiri@gmail.com</strong>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            © 2026 Posyandu Sehat Mandiri. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
