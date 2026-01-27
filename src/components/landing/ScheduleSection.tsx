'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  created_at: string;
}

interface ScheduleDisplay {
  id: string;
  date: string;
  month: string;
  title: string;
  description: string;
  time: string;
  location: string;
  status: string;
}

export default function ScheduleSection() {
  const [schedules, setSchedules] = useState<ScheduleDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules?upcoming=true&limit=4');
      const result = await response.json();
      
      if (result.data) {
        const formattedSchedules = result.data.map((schedule: Schedule) => {
          const scheduleDate = new Date(schedule.date);
          const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
          
          return {
            id: schedule.id,
            date: scheduleDate.getDate().toString(),
            month: monthNames[scheduleDate.getMonth()],
            title: schedule.title,
            description: schedule.description || 'Tidak ada deskripsi',
            time: schedule.time || 'Waktu belum ditentukan',
            location: schedule.location || 'Lokasi belum ditentukan',
            status: 'Mendatang',
          };
        });
        setSchedules(formattedSchedules);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="jadwal" className="schedule-section">
      <div className="container">
        {/* Section Badge */}
        <div className="section-badge">Jadwal & Kegiatan</div>

        {/* Section Title */}
        <h2 className="section-title">Jadwal Kegiatan Posyandu</h2>
        <p className="section-subtitle">
          Informasi jadwal kegiatan dan layanan dari Posyandu Sehat Mandiri
        </p>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-gray-600">Memuat jadwal...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && schedules.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Belum ada jadwal kegiatan tersedia</p>
          </div>
        )}

        {/* Schedules List */}
        {!loading && schedules.length > 0 && (
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
        )}
      </div>
    </section>
  );
}
