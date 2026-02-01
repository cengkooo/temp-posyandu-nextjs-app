'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, MapPin, ChevronRight, Calendar } from 'lucide-react';

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
            date: scheduleDate.getDate().toString().padStart(2, '0'),
            month: monthNames[scheduleDate.getMonth()],
            title: schedule.title,
            description: schedule.description || 'Kegiatan rutin posyandu',
            time: schedule.time || '08:00 - Selesai',
            location: schedule.location || 'Balai Desa Way Kalam',
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
    <section id="jadwal" className="py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#F1F5F9] to-transparent"></div>
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          
          {/* Left Text */}
          <div className="w-full lg:w-1/3 sticky top-32">
            <h2 className="text-4xl font-bold mb-6 leading-tight tracking-tight text-slate-900">Agenda <br/>Bulan Ini</h2>
            <p className="text-slate-500 mb-8 leading-relaxed font-medium">
              Jangan lewatkan pemeriksaan rutin. Kami hadir untuk membantu memantau kesehatan Anda dan keluarga.
            </p>
            <div className="bg-teal-50 p-8 rounded-3xl border border-teal-100">
              <div className="flex items-center gap-4 text-teal-700 font-bold mb-4">
                <MapPin className="w-6 h-6" />
                Lokasi Utama
              </div>
              <p className="text-sm text-teal-800/70 font-medium">Balai Desa Way Kalam, Kec. Penengahan, Kabupaten Lampung Selatan.</p>
            </div>
          </div>

          {/* Right List */}
          <div className="w-full lg:w-2/3 grid gap-6">
            {loading && (
               <div className="p-8 text-center text-slate-500">Memuat jadwal...</div>
            )}

            {!loading && schedules.length === 0 && (
                <div className="p-8 bg-slate-50 rounded-3xl text-center border border-slate-100">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Belum ada jadwal kegiatan.</p>
                </div>
            )}

            {schedules.map((schedule) => (
              <Link key={schedule.id} href={`/jadwal/${schedule.id}`} className="group block">
                <div className="relative flex flex-col sm:flex-row items-center gap-8 p-8 bg-[#F8FAFC] border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl hover:border-teal-100 transition-all duration-300">
                  
                  {/* Date Box */}
                  <div className="w-24 h-24 bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm shrink-0 border border-slate-100 group-hover:border-teal-400 group-hover:text-teal-600 transition-colors">
                    <span className="text-4xl font-black text-slate-900 leading-none group-hover:text-teal-600">{schedule.date}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 group-hover:text-teal-400">{schedule.month}</span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left w-full">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">{schedule.title}</h3>
                    <p className="text-slate-500 text-sm mb-4 font-medium line-clamp-1">{schedule.description}</p>
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-100">
                        <Clock className="w-3.5 h-3.5 text-teal-500" /> {schedule.time}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> {schedule.location}
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="hidden sm:flex w-12 h-12 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all shadow-sm">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}