'use client';

import React from 'react';
import { Heart, MapPin, Phone, Mail, Facebook, Instagram, Youtube, Video, ChevronRight, ExternalLink } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 pt-32 pb-12 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-20 mb-24">
          
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-transparent p-2 rounded-xl">
                <img src="/dinkes.png" alt="Logo Posyandu Way Kalam" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-bold text-2xl tracking-tighter">Way <span className="text-teal-500">Kalam</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-xs font-medium">
              Melayani dengan sepenuh hati untuk masa depan generasi Desa Way Kalam yang lebih sehat dan cerdas.
            </p>
            {/* <div className="flex gap-4">
              {[Facebook, Instagram, Youtube, Video].map((Icon, i) => (
                <button key={i} className="group w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center hover:bg-teal-600 transition-all border border-slate-800">
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-white" />
                </button>
              ))}
            </div> */}
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-bold text-lg mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">Navigasi</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-semibold">
              {['Tentang', 'Layanan', 'Jadwal', 'Tim'].map(item => (
                 <li key={item}>
                    <button onClick={() => scrollTo(`#${item.toLowerCase()}`)} className="hover:text-white transition-colors flex items-center gap-2 group">
                        <ChevronRight className="w-3 h-3 text-teal-600 group-hover:translate-x-1 transition-transform" /> {item}
                    </button>
                 </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-lg mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">Kontak Kami</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex gap-4 p-6 bg-slate-900 rounded-3xl border border-slate-800 hover:border-teal-900 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-teal-500" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Balai Desa Way Kalam, Kec. Penengahan, Kab. Lampung Selatan, Lampung 35592</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-900 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">0821-8038-5856</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-emerald-900 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">Permatasarilinda368@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom - Layout Diperbaiki untuk Desktop */}
        <div className="pt-12 border-t border-slate-900 flex flex-col xl:flex-row justify-between items-center gap-8 text-center xl:text-left">
          <p className="text-xs text-slate-600 uppercase font-bold tracking-[0.2em]">
            © {new Date().getFullYear()} Tim KKN Institut Teknologi Sumatera
          </p>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest w-full xl:w-auto justify-center xl:justify-end">
            <span className="whitespace-nowrap">Dikembangkan Oleh</span>
            
            {/* Container Nama dengan Flex Wrap agar aman di desktop kecil */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center xl:justify-end gap-y-3 gap-x-6 items-center">
              <a 
                href="https://www.instagram.com/jefrisembiring5/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-teal-400 transition-colors flex items-center gap-2 group whitespace-nowrap"
              >
                Jefri Wahyu Fernando Sembiring 
                <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              
              <div className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full"></div>
              
              <a 
                href="https://www.instagram.com/andryanolimbong/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-teal-400 transition-colors flex items-center gap-2 group whitespace-nowrap"
              >
                Andryano Shevchenko Sembiring
                <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}