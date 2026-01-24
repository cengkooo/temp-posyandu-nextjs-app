'use client';

import React from 'react';
import { Syringe, Scale, Baby, Users, HeartPulse, Apple } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      icon: <Syringe size={32} />,
      title: 'Imunisasi Balita',
      description: 'Layanan imunisasi lengkap untuk balita sesuai jadwal Kemenkes RI, termasuk vaksin BCG, DPT, Polio, Campak, dan Hepatitis B.',
      color: 'teal',
    },
    {
      icon: <Scale size={32} />,
      title: 'Penimbangan & Pengukuran',
      description: 'Pemantauan berat badan, tinggi badan, dan lingkar kepala balita untuk memastikan tumbuh kembang yang optimal.',
      color: 'blue',
    },
    {
      icon: <Baby size={32} />,
      title: 'Pemeriksaan Ibu Hamil',
      description: 'Pemeriksaan kehamilan rutin meliputi tekanan darah, berat badan, tinggi fundus, dan pemantauan kondisi janin.',
      color: 'pink',
    },
    {
      icon: <Users size={32} />,
      title: 'Keluarga Berencana (KB)',
      description: 'Konsultasi dan pelayanan KB dengan berbagai pilihan metode kontrasepsi yang aman dan sesuai kebutuhan.',
      color: 'cyan',
    },
    {
      icon: <HeartPulse size={32} />,
      title: 'Pemeriksaan Lansia',
      description: 'Pemeriksaan kesehatan rutin untuk lansia termasuk cek tekanan darah, gula darah, dan kolesterol.',
      color: 'green',
    },
    {
      icon: <Apple size={32} />,
      title: 'Konseling Gizi',
      description: 'Konsultasi gizi dan edukasi pola makan sehat untuk ibu hamil, menyusui, balita, dan seluruh keluarga.',
      color: 'orange',
    },
  ];

  return (
    <section id="layanan" className="services-section">
      <div className="container">
        {/* Section Badge */}
        <div className="section-badge">Layanan Kami</div>

        {/* Section Title */}
        <h2 className="section-title">Layanan Kesehatan Terpadu</h2>
        <p className="section-subtitle">
          Berbagai layanan kesehatan untuk memenuhi kebutuhan Anda dan keluarga
        </p>

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className={`service-card ${service.color}`}>
              <div className={`service-icon ${service.color}`}>
                {service.icon}
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
