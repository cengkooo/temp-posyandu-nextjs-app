'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';

export default function ScheduleSection() {
  const schedules = [
    {
      id: 1,
      date: '27',
      month: 'JAN',
      title: 'Imunisasi Bulanan',
      description: 'Pemberian vaksin lengkap untuk balita sesuai jadwal Kemenkes RI.',
      time: '08:00 - 12:00 WIB',
      location: 'Balai Desa Sukamaju',
      status: 'Mendatang',
    },
    {
      id: 2,
      date: '29',
      month: 'JAN',
      title: 'Penimbangan Balita',
      description: 'Pemantauan tumbuh kembang balita dengan penimbangan dan pengukuran.',
      time: '09:00 - 11:00 WIB',
      location: 'Posyandu Sehat Mandiri',
      status: 'Mendatang',
    },
    {
      id: 3,
      date: '3',
      month: 'FEB',
      title: 'Pemeriksaan Ibu Hamil',
      description: 'Pemeriksaan kesehatan rutin untuk ibu hamil dan konsultasi kehamilan.',
      time: '08:00 - 14:00 WIB',
      location: 'Posyandu Sehat Mandiri',
      status: 'Mendatang',
    },
    {
      id: 4,
      date: '10',
      month: 'FEB',
      title: 'Pemeriksaan Lansia',
      description: 'Cek kesehatan lansia termasuk tekanan darah dan gula darah.',
      time: '08:00 - 12:00 WIB',
      location: 'Balai Desa Sukamaju',
      status: 'Mendatang',
    },
  ];

  return (
    <section id="jadwal" className="schedule-section">
      <div className="container">
        {/* Section Badge */}
        <div className="section-badge">Jadwal & Kegiatan</div>

        {/* Section Title */}
        <h2 className="section-title">  </h2>
        <p className="section-subtitle">
          Informasi jadwal kegiatan dan layanan dari Posyandu Sehat Mandiri
        </p>

        {/* Schedules List */}
        <div className="schedules-list">
          {schedules.map((schedule) => (
            <Link 
              key={schedule.id} 
              href={`/jadwal/${schedule.id}`}
              className="schedule-card-link"
            >
              <div className="schedule-card">
                <div className="schedule-date">
                  <span className="date-number">{schedule.date}</span>
                  <span className="date-month">{schedule.month}</span>
                </div>
                <div className="schedule-info">
                  <h3 className="schedule-title">{schedule.title}</h3>
                  <p className="schedule-description">{schedule.description}</p>
                  <div className="schedule-details">
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>{schedule.time}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{schedule.location}</span>
                    </div>
                  </div>
                </div>
                <div className="schedule-actions">
                  <div className="status-badge">{schedule.status}</div>
                  <div className="detail-link">
                    <span>Lihat Detail</span>
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
        </div>
      </div>
    </section>
  );
}
