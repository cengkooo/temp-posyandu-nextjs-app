'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Youtube, 
  Video,
  ExternalLink 
} from 'lucide-react';

export default function Footer() {
  return (
    // UBAH: bg-slate-800 (Dark) dan text-slate-300
    <footer className="w-full bg-slate-800 text-slate-300 border-t border-slate-700/50 pt-16 pb-0 font-sans">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              {/* Icon Box: bg-emerald-500 dengan opacity 20% */}
              <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                <Heart size={24} className="text-emerald-400 fill-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white leading-none">
                  Posyandu Sehat
                </span>
                <span className="text-sm font-medium text-emerald-400 mt-1">
                  Mandiri & Terpercaya
                </span>
              </div>
            </Link>

            <p className="text-slate-400 leading-relaxed text-sm md:text-base max-w-sm">
              Melayani dengan sepenuh hati untuk kesehatan ibu dan anak Indonesia.
              Pelayanan kesehatan terpadu yang ramah, aman, dan berkelanjutan.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {[Facebook, Instagram, Youtube, Video].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-full
                  bg-white/5 border border-white/10 text-slate-400
                  hover:bg-emerald-600 hover:text-white hover:border-emerald-600
                  transition-all shadow-sm hover:-translate-y-1"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <h4 className="text-lg font-bold text-white mb-6 relative inline-block">
              Jelajahi
              {/* Garis bawah hijau */}
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-emerald-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Tentang Kami', href: '#tentang' },
                { label: 'Layanan Kesehatan', href: '#layanan' },
                { label: 'Jadwal Posyandu', href: '#jadwal' },
                { label: 'Galeri', href: '#galeri' },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-emerald-400 transition-all flex items-center gap-2 group hover:pl-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-lg font-bold text-white mb-6 relative inline-block">
              Hubungi Kami
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-emerald-500 rounded-full"></span>
            </h4>

            <ul className="space-y-5 text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="text-emerald-500 mt-1 shrink-0" size={20} />
                <p className="text-sm leading-relaxed">
                  Balai Desa Way Kalam, Kec. Penengahan<br />
                  Kabupaten Lampung Selatan, Lampung 35592
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-emerald-500 mt-1 shrink-0" size={20} />
                <p className="text-sm font-mono">0812-3456-7890</p>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="text-emerald-500 mt-1 shrink-0" size={20} />
                <p className="text-sm">posyandu.sehat@example.com</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom (Darker Background) */}
      <div className="w-full bg-black/20 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p className="text-center md:text-left">
              © {new Date().getFullYear()} Tim Kuliah Kerja Nyata Institut Teknologi Sumatera 
            </p>

            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
              <span>Dikembangkan Oleh :</span>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/jefrisembiring5/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:text-emerald-400 hover:underline flex items-center gap-1 font-medium transition-colors"
                >
                  Jefri Wahyu Fernando Sembiring
                  <ExternalLink size={12} />
                </a>
                <a 
                  href="https://www.instagram.com/andryanolimbong/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:text-emerald-400 hover:underline flex items-center gap-1 font-medium transition-colors"
                >
                  Andryano Shevchenko Limbong
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}