'use client';

import React from 'react';
import { Eye, Target, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="tentang" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm mb-4">
            Tentang Kami
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Mengenal Posyandu Rajabasa
          </h2>
          <p className="text-slate-600 text-lg">
            Berdedikasi melayani kesehatan masyarakat dengan sepenuh hati.
          </p>
        </div>

        {/* GRID LAYOUT 
            HAPUS 'items-start' agar grid otomatis stretch (sama tinggi)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN (VISI & MISI) --- */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Visi Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-emerald-100 hover:border-emerald-200 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <Eye size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Visi Kami</h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                "Terwujudnya Posyandu Rajabasa Desa Way Kalam yang aktif, mandiri, dan berkelanjutan dalam meningkatkan derajat kesehatan ibu, bayi, balita, dan masyarakat."
              </p>
            </div>

            {/* Misi Card - Menggunakan flex-1 agar mengisi sisa ruang jika ada */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-emerald-100 hover:border-emerald-200 transition-all duration-300 flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <Target size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Misi Kami</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Meningkatkan pelayanan kesehatan ibu hamil, ibu menyusui, bayi, dan balita secara rutin dan berkualitas",
                  "Mendorong peran aktif kader posyandu dalam kegiatan pelayanan dan penyuluhan kesehatan",
                  "Meningkatkan kesadaran masyarakat akan pentingnya kesehatan dan gizi keluarga",
                  "Mendukung pencegahan stunting melalui pemantauan tumbuh kembang anak secara berkala",
                  "Menjalin kerja sama dengan puskesmas, pemerintah desa, dan pihak terkait"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-bold text-sm border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* --- RIGHT COLUMN (CONTACT INFO) --- */}
          <div className="lg:col-span-1 h-full">
            {/* Tambahkan 'h-full' agar tinggi kartu mengikuti kolom sebelah.
                Tambahkan 'flex flex-col justify-between' agar isinya menyebar rapi.
            */}
            <div className="bg-emerald-900 rounded-2xl p-8 text-white shadow-lg h-full flex flex-col justify-between">
              
              {/* Bagian Atas: Header & Info Utama */}
              <div>
                <h3 className="text-xl font-bold mb-8 border-b border-emerald-700 pb-4">Informasi Kontak</h3>
                
                <div className="space-y-8">
                  {/* Lokasi */}
                  <div className="flex gap-4">
                    <MapPin className="text-emerald-400 shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold text-emerald-100 mb-2">Lokasi</h4>
                      <p className="text-emerald-50/80 text-sm leading-relaxed">
                        Balai Desa Way Kalam, Kec. Penengahan, Kabupaten Lampung Selatan, Lampung 35592
                      </p>
                    </div>
                  </div>

                  {/* Telepon */}
                  <div className="flex gap-4">
                    <Phone className="text-emerald-400 shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold text-emerald-100 mb-2">Hubungi Kami</h4>
                      <p className="text-emerald-50/80 text-sm">
                        WA: +62 821-8038-5856
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4">
                    <Mail className="text-emerald-400 shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="font-semibold text-emerald-100 mb-2">Email</h4>
                      <p className="text-emerald-50/80 text-sm break-all">
                        Permatasarilinda368@gmail.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian Bawah: Jadwal (Akan terdorong ke paling bawah) */}
                <div className="mt-8 rounded-xl border border-emerald-700/40 bg-gradient-to-br from-emerald-800/60 to-emerald-900/60 p-5 backdrop-blur">
                  <div className="mb-4 flex items-center gap-2 text-emerald-300">
                    <Clock size={20} />
                    <h4 className="font-semibold tracking-wide">Waktu Operasional</h4>
                  </div>

                  <div className="space-y-4 text-sm text-emerald-100/90">
                    <div className="flex items-center justify-between rounded-lg bg-emerald-700/20 px-3 py-2">
                      <span className="font-medium">Tanggal 18 setiap bulan</span>
                      <span className="font-mono text-emerald-300">07:30 – 12:00</span>
                    </div>

                    <div className="rounded-lg bg-emerald-700/10 px-3 py-2 text-xs leading-relaxed text-emerald-200/80">
                      <span className="block font-medium text-emerald-300 mb-1">
                        Catatan:
                      </span>
                      Jika tanggal 18 bertepatan dengan hari libur nasional, jadwal
                      dipindahkan ke hari Senin setelah tanggal 18.
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