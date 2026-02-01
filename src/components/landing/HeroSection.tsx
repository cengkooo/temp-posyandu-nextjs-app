'use client';

import React from 'react';
import { Calendar, Phone, Users, Clock, Award, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="beranda" className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20 bg-[#0F172A]">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -ml-24 -mb-24"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 backdrop-blur-md rounded-full mb-8 animate-bounce-slow">
            <Award className="w-4 h-4 text-teal-400" />
            <span className="text-teal-100 text-[11px] font-bold uppercase tracking-widest">Pelayanan Kesehatan Masyarakat</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tight leading-[1.1]">
            Posyandu <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">Way Kalam.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
            Melayani dengan Hati untuk Kesehatan Keluarga Indonesia. <br/>
            <span className="text-sm opacity-70">Balai Desa Way Kalam, Kec. Penengahan, Lampung Selatan.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16">
            <button 
              onClick={() => scrollTo('jadwal')}
              className="group w-full sm:w-auto px-10 py-5 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-bold shadow-2xl shadow-teal-900/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              Lihat Jadwal <Calendar className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
            </button>
            <button
               onClick={() => window.open('https://wa.me/6282180385856?text=Halo%20saya%20ingin%20bertanya%20tentang%20layanan%20posyandu%20di%20Way%20Kalam', '_blank')}
               className="group w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold backdrop-blur-sm transition-all flex items-center justify-center gap-3"
            >
              Hubungi Kami <Phone className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                <Users size={20} />
              </div>
              <div className="text-left">
                <p className="text-white text-lg font-bold leading-tight">3.500+</p>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Pasien Terlayani</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock size={20} />
              </div>
              <div className="text-left">
                <p className="text-white text-lg font-bold leading-tight">15+</p>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Tahun Melayani</p>
              </div>
            </div>

            <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Award size={20} />
              </div>
              <div className="text-left">
                <p className="text-white text-lg font-bold leading-tight">100%</p>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Kepuasan</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}