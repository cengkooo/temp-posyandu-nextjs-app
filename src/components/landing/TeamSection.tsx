'use client';

import React from 'react';
import { User } from 'lucide-react';

export default function TeamSection() {
  const teamMembers = [
    { name: 'Rosnayah', role: 'Ketua Kader', photo: null },
    { name: 'Siti Kurningsih', role: 'Sekretaris', photo: null },
    { name: 'Hudriyah', role: 'Bendahara', photo: null },
    { name: 'Astriani', role: 'Ketua Bidang Kesehatan', photo: null },
    { name: 'Naenah', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Suhariyah', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Masrifah', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Saminah', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Asmah', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Widya Anita', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Suiyah', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Nur Afni Sukaesih', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Nova Wati', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Betri Yenti', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Neti Sartika', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Saiyah Nurfadilah', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Siti Sa’adiyah', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Sugi Hariati', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Sri Astuti', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Susanti', role: 'Kader Bidang Kesehatan', photo: null },
    { name: 'Sunaenah', role: 'Kader Bidang Kesehatan', photo: null },
    // Menambahkan personel ke-22 (Contoh, karena di data Anda tadi baru 21)
    { name: 'Umi Kulsum', role: 'Kader Bidang Kesehatan', photo: null },
  ];

  return (
    <section id="tim" className="team-section py-12 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Badge */}
        <div className="flex justify-center mb-4">
            <span className="section-badge inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
                Tim Kami
            </span>
        </div>

        {/* Section Title */}
        <div className="text-center mb-12">
            <h2 className="section-title text-3xl font-bold text-slate-800 mb-2">Tim Kader Posyandu</h2>
            <p className="section-subtitle text-slate-600 max-w-2xl mx-auto">
            Didukung oleh tim kader yang berdedikasi dan berpengalaman dalam pelayanan kesehatan masyarakat
            </p>
        </div>

        {/* PERUBAHAN UTAMA DI SINI:
            1. Menggunakan 'flex flex-wrap' agar item membungkus ke baris baru.
            2. Menggunakan 'justify-center' agar item (termasuk baris terakhir) berada di tengah.
            3. Menggunakan 'gap-6' atau 'gap-8' untuk jarak.
        */}
        <div className="flex flex-wrap justify-center gap-8">
          {teamMembers.map((member, index) => (
            /* Set lebar kartu (w-64 atau w-72) agar ukurannya seragam 
               karena kita tidak menggunakan Grid column lagi.
            */
            <div key={index} className="team-card w-64 flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="team-photo mb-4 relative">
                {member.photo ? (
                  <img 
                    src={member.photo} 
                    alt={member.name} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-emerald-50"
                  />
                ) : (
                  <div className="photo-placeholder w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                    <User size={48} />
                  </div>
                )}
              </div>
              <div className="team-info">
                <h3 className="team-name font-bold text-slate-800 text-lg">{member.name}</h3>
                <p className="team-role text-emerald-600 text-sm font-medium">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}