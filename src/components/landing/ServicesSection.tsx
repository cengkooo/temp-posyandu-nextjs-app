'use client';

import React from 'react';
import { Syringe, Scale, Baby, Users, HeartPulse, Apple, ChevronRight } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      icon: <Syringe className="w-8 h-8" />,
      title: 'Imunisasi Balita',
      description: 'Layanan imunisasi lengkap untuk balita sesuai jadwal Kemenkes RI (BCG, DPT, Polio, dll).',
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      icon: <Scale className="w-8 h-8" />,
      title: 'Penimbangan',
      description: 'Pemantauan berat badan, tinggi badan untuk memastikan tumbuh kembang optimal.',
      gradient: "from-teal-500 to-emerald-400",
    },
    {
      icon: <Baby className="w-8 h-8" />,
      title: 'Ibu Hamil',
      description: 'Pemeriksaan kehamilan rutin, cek tensi, dan pemantauan kondisi janin.',
      gradient: "from-rose-500 to-pink-400",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Keluarga Berencana',
      description: 'Konsultasi dan pelayanan KB dengan berbagai pilihan metode kontrasepsi.',
      gradient: "from-indigo-500 to-violet-400",
    },
    {
      icon: <HeartPulse className="w-8 h-8" />,
      title: 'Pemeriksaan Lansia',
      description: 'Cek kesehatan rutin lansia termasuk tensi, gula darah, dan kolesterol.',
      gradient: "from-amber-500 to-orange-400",
    },
    {
      icon: <Apple className="w-8 h-8" />,
      title: 'Konseling Gizi',
      description: 'Edukasi pola makan sehat untuk ibu hamil, menyusui, dan balita.',
      gradient: "from-green-500 to-lime-400",
    },
  ];

  return (
    <section id="layanan" className="py-32 bg-[#F1F5F9]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Layanan Kesehatan</h2>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">
            Program kesehatan terpadu untuk mendukung setiap fase kehidupan keluarga Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <div key={i} className="group bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-teal-100/50 hover:-translate-y-3 transition-all duration-500">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{service.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">
                {service.description}
              </p>
              
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}