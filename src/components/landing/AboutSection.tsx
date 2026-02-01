'use client';

import React from 'react';
import { Eye, Target, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="tentang" className="py-32 relative overflow-hidden bg-[#F8FAFC]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-full mb-6">TENTANG KAMI</div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Mengenal Posyandu</h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            "Terwujudnya Posyandu Rajabasa Desa Way Kalam yang aktif, mandiri, dan berkelanjutan."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visi Card */}
          <div className="group bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-teal-200 transition-all hover:-translate-y-2">
            <div className="w-16 h-16 bg-teal-100 rounded-3xl flex items-center justify-center text-teal-600 mb-8 group-hover:rotate-12 transition-transform">
              <Eye size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Visi Kami</h3>
            <p className="text-slate-600 leading-relaxed">
              Meningkatkan derajat kesehatan ibu, bayi, balita, dan masyarakat Desa Way Kalam melalui pelayanan yang aktif dan berkualitas.
            </p>
          </div>

          {/* Misi Card */}
          <div className="group bg-teal-600 p-10 rounded-[2.5rem] shadow-xl shadow-teal-200 text-white transition-all hover:-translate-y-2">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-white mb-8 group-hover:-rotate-12 transition-transform">
              <Target size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Misi Kami</h3>
            <ul className="space-y-6 text-teal-50 text-sm font-medium">
              <li className="flex gap-3"><span className="w-1.5 h-1.5 rounded-full bg-teal-200 mt-2 shrink-0"/> Pelayanan kesehatan rutin ibu & anak</li>
              <li className="flex gap-3"><span className="w-1.5 h-1.5 rounded-full bg-teal-200 mt-2 shrink-0"/> Pencegahan stunting sejak dini</li>
              <li className="flex gap-3"><span className="w-1.5 h-1.5 rounded-full bg-teal-200 mt-2 shrink-0"/> Edukasi gizi keluarga</li>
              <li className="flex gap-3"><span className="w-1.5 h-1.5 rounded-full bg-teal-200 mt-2 shrink-0"/> Kerjasama dengan Puskesmas</li>
            </ul>
          </div>

          {/* Contact Card (Modified) */}
          <div className="group bg-slate-900 p-10 rounded-[2.5rem] shadow-xl text-white transition-all hover:-translate-y-2 flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-teal-400 mb-8">
                <Phone size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-6">Kontak & Jadwal</h3>
              <div className="space-y-4 text-slate-400 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="shrink-0 text-teal-500" size={18} />
                  <span>Balai Desa Way Kalam, Kec. Penengahan, Lampung Selatan</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="shrink-0 text-teal-500" size={18} />
                  <span>Permatasarilinda368@gmail.com</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800">
              {/* Header Jadwal */}
              <div className="flex items-center gap-2 text-teal-400 font-bold mb-3">
                <Clock size={18} /> 
                <span>Jadwal Rutin</span>
              </div>

              <div className="space-y-3">
                {/* Waktu Pelaksanaan */}
                <div>
                  <p className="text-slate-200 font-medium">Tanggal 18 Setiap Bulan</p>
                  <p className="text-xs text-slate-500">Pukul 07:30 - 12:00 WIB</p>
                </div>

                {/* Info Box untuk Catatan */}
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-800/50">
                  <div className="flex gap-2">
                    <div className="shrink-0 w-1 h-full min-h-[20px] bg-teal-500/30 rounded-full"></div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                      <span className="text-teal-500 font-bold not-italic">Catatan:</span> Jika tanggal 18 bertepatan dengan hari libur/tanggal merah, kegiatan dijadwalkan pada hari Senin berikutnya.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}