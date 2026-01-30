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
    <footer className="w-full bg-emerald-50 border-t border-emerald-100 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-emerald-100 p-2.5 rounded-xl group-hover:bg-emerald-200 transition-colors">
                <Heart size={24} className="text-emerald-600 fill-emerald-600" />
              </div>
              <div>
                <span className="text-xl font-bold text-emerald-900 leading-none">
                  Posyandu Sehat
                </span>
                <span className="block text-sm font-medium text-emerald-600">
                  Mandiri & Terpercaya
                </span>
              </div>
            </Link>

            <p className="text-emerald-700 leading-relaxed text-sm md:text-base max-w-sm">
              Melayani dengan sepenuh hati untuk kesehatan ibu dan anak Indonesia.
              Pelayanan kesehatan terpadu yang ramah, aman, dan berkelanjutan.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {[Facebook, Instagram, Youtube, Video].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-full
                  bg-white border border-emerald-100 text-emerald-600
                  hover:bg-emerald-600 hover:text-white hover:border-emerald-600
                  transition-all shadow-sm hover:shadow-md"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <h4 className="text-lg font-bold text-emerald-900 mb-6 relative inline-block">
              Jelajahi
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-emerald-500 rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              
              {[
                { label: 'Tentang Kami', href: '#tentang' },
                { label: 'Layanan Kesehatan', href: '#layanan' },
                { label: 'Jadwal Posyandu', href: '#jadwal' },
                { label: 'Galeri', href: '#galeri' },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href} // Ambil link dari properti .href
                    className="text-emerald-700 hover:text-emerald-600 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 group-hover:bg-emerald-600 transition-colors"></span>
                    {item.label} {/* Ambil teks dari properti .label */}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-lg font-bold text-emerald-900 mb-6 relative inline-block">
              Hubungi Kami
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-emerald-500 rounded-full"></span>
            </h4>

            <ul className="space-y-5 text-emerald-700">
              <li className="flex items-start gap-3">
                <MapPin className="text-emerald-600 mt-1" />
                <p className="text-sm">
                  Balai Desa Way Kalam, Kec. Penengahan<br />
                  Kabupaten Lampung Selatan, Lampung 35592
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-emerald-600 mt-1" />
                <p className="text-sm font-mono">0812-3456-7890</p>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="text-emerald-600 mt-1" />
                <p className="text-sm">posyandu.sehat@example.com</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px w-full bg-emerald-200 my-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-emerald-600">
          <p>© {new Date().getFullYear()} Tim Kuliah Kerja Nyata Institut Teknologi Sumatera </p>

          <div className="flex gap-4">
            <span>Dikembangkan Oleh :</span>
            <a href="https://www.instagram.com/jefrisembiring5/" className="hover:text-emerald-800 flex items-center gap-1">
              Jefri Wahyu Fernando Sembiring
              <ExternalLink size={12} />
            </a>
            <a href="https://www.instagram.com/andryanolimbong/" className="hover:text-emerald-800 flex items-center gap-1">
              Andryano Shevchenko Limbong
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
