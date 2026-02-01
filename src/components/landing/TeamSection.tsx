'use client';

import React from 'react';
import { Users, ShieldCheck } from 'lucide-react';

export default function TeamSection() {
  const teamMembers = [
    { name: 'Rosnayah', role: 'Ketua Kader' },
    { name: 'Siti Kurningsih', role: 'Sekretaris' },
    { name: 'Hudriyah', role: 'Bendahara' },
    { name: 'Astriani', role: 'Ketua Bidang Kesehatan' },
    { name: 'Naenah', role: 'Kader' },
    { name: 'Suhariyah', role: 'Kader' },
    { name: 'Masrifah', role: 'Kader' },
    { name: 'Saminah', role: 'Kader' },
    { name: 'Asmah', role: 'Kader' },
    { name: 'Widya Anita', role: 'Kader' },
    { name: 'Suiyah', role: 'Kader' },
    { name: 'Nur Afni S.', role: 'Kader' },
    { name: 'Nova Wati', role: 'Kader' },
    { name: 'Betri Yenti', role: 'Kader' },
    { name: 'Neti Sartika', role: 'Kader' },
    { name: 'Saiyah N.', role: 'Kader' },
    { name: 'Siti Sa’adiyah', role: 'Kader' },
    { name: 'Sugi Hariati', role: 'Kader' },
    { name: 'Sri Astuti', role: 'Kader' },
    { name: 'Susanti', role: 'Kader' },
    { name: 'Sunaenah', role: 'Kader' },
    { name: 'Umi Kulsum', role: 'Kader' },
  ];

  return (
    <section id="tim" className="py-32 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black mb-6 italic tracking-tighter">Pahlawan Kesehatan Desa</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 mx-auto rounded-full mb-8"></div>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium">
            Inilah para ibu kader yang mendedikasikan waktu dan tenaga untuk menjaga kesehatan warga Desa Way Kalam.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-16">
          {teamMembers.map((member, i) => (
            <div key={i} className="flex flex-col items-center group">
              <div className="relative mb-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-800 rounded-[2rem] flex items-center justify-center border border-slate-700 shadow-2xl transition-all duration-500 group-hover:bg-teal-600 group-hover:rotate-6 group-hover:scale-110">
                  <Users className="w-10 h-10 text-slate-500 group-hover:text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform delay-100">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-center mb-1 text-slate-200 group-hover:text-teal-400 transition-colors">{member.name}</h4>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] text-center">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}