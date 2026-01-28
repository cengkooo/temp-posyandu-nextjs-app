import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Phone, Share2, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import '@/styles/landing.css';
import '@/styles/event-detail.css';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];

// Extended type for runtime schedule properties
interface ExtendedSchedule extends Schedule {
  subtitle?: string;
  duration?: string;
  full_address?: string;
  map_link?: string;
  capacity?: number;
  price?: string;
  price_note?: string;
  coordinator_name?: string;
  coordinator_role?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  requirements?: string[];
  important_note_title?: string;
  important_note_message?: string;
  tags?: string[];
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  
  // Fetch real schedule data
  const { data: schedule, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('id', id)
    .single();

  // Fallback data if not found
  if (error || !schedule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Jadwal tidak ditemukan</h1>
          <Link href="/#jadwal" className="text-teal-600 hover:text-teal-700">
            Kembali ke Jadwal
          </Link>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Parse time to display format
  const formatTime = (time: string | null) => {
    if (!time) return '';
    return time;
  };

  const event = {
    id: schedule.id,
    title: schedule.title,
    subtitle: (schedule as ExtendedSchedule).subtitle || schedule.description || 'Program Layanan Posyandu',
    date: formatDate(schedule.date),
    time: schedule.time || '08:00 - 12:00 WIB',
    duration: (schedule as ExtendedSchedule).duration || '4 Jam',
    location: schedule.location || 'Posyandu Sehat Mandiri',
    fullAddress: (schedule as ExtendedSchedule).full_address || schedule.location || 'Jl. Kesehatan No. 45, Kec. Sukamaju, Kab. Sejahtera',
    mapLink: (schedule as ExtendedSchedule).map_link || '#',
    capacity: `${(schedule as ExtendedSchedule).capacity || 50} Peserta`,
    price: (schedule as ExtendedSchedule).price || 'GRATIS',
    priceNote: (schedule as ExtendedSchedule).price_note || 'Didukung oleh Pemerintah',
    description: schedule.description || 'Program layanan kesehatan Posyandu Sehat Mandiri untuk memberikan pelayanan kesehatan optimal bagi masyarakat.',
    coordinator: {
      name: (schedule as ExtendedSchedule).coordinator_name || 'dr. Siti Nurhaliza',
      role: (schedule as ExtendedSchedule).coordinator_role || 'Bidan Kepala',
    },
    contact: {
      phone: (schedule as ExtendedSchedule).contact_phone || '0812-3456-7890',
      whatsapp: (schedule as ExtendedSchedule).contact_whatsapp || 'WhatsApp tersedia',
    },
    requirements: (schedule as ExtendedSchedule).requirements || [
      'Membawa kartu identitas (KTP/KK)',
      'Datang tepat waktu sesuai jadwal',
      'Mengikuti protokol kesehatan yang berlaku',
      'Untuk pelayanan khusus, harap mendaftar terlebih dahulu',
    ],
    importantNote: {
      title: (schedule as ExtendedSchedule).important_note_title || 'Catatan Penting',
      message: (schedule as ExtendedSchedule).important_note_message || 'Jika memiliki kondisi kesehatan khusus, harap konsultasikan dengan petugas kesehatan terlebih dahulu.',
    },
    tags: (schedule as ExtendedSchedule).tags || [schedule.title],
  };

  return (
    <div className="event-page-wrapper">
      <Navbar />
      
      <div className="event-detail-page">
        {/* Hero Section with Back Button */}
        <section className="event-hero">
          <div className="hero-overlay">
            <div className="container">
              <Link href="/#jadwal" className="back-link-hero">
                <ArrowLeft size={20} />
                <span>Kembali ke Beranda</span>
              </Link>
              
              <div className="hero-content">
                <h1 className="event-title">{event.title}</h1>
                <p className="event-subtitle">{event.subtitle}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="event-main">
          <div className="container">
            <div className="event-grid">
              {/* Left Column - Main Content */}
              <div className="event-left">
                {/* Tags */}
                <div className="event-tags">
                  {event.tags.map((tag: string, _index: number) => (
                    <span key={_index} className="event-tag">{tag}</span>
                  ))}
                  <button className="share-button">
                    <Share2 size={16} />
                  </button>
                </div>

                {/* Description */}
                <div className="event-section">
                  <h2 className="section-heading">Deskripsi Kegiatan</h2>
                  <div className="event-description">
                    {event.description.split('\n\n').map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* Coordinator */}
                <div className="event-section">
                  <h3 className="subsection-heading">Penanggung Jawab</h3>
                  <div className="coordinator-card">
                    <div className="coordinator-icon">
                      <Users size={24} />
                    </div>
                    <div className="coordinator-info">
                      <p className="coordinator-name">{event.coordinator.name}</p>
                      <p className="coordinator-role">{event.coordinator.role}</p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="event-section">
                  <h3 className="subsection-heading">Kontak</h3>
                  <div className="contact-card">
                    <div className="contact-icon">
                      <Phone size={24} />
                    </div>
                    <div className="contact-info">
                      <p className="contact-number">{event.contact.phone}</p>
                      <p className="contact-note">{event.contact.whatsapp}</p>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="event-section">
                  <h2 className="section-heading">Syarat & Ketentuan</h2>
                  <ul className="requirements-list">
                    {event.requirements.map((req: string, index: number) => (
                      <li key={index} className="requirement-item">
                        <CheckCircle size={20} />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Important Note */}
                <div className="important-note">
                  <div className="note-icon">
                    <AlertCircle size={20} />
                  </div>
                  <div className="note-content">
                    <h4 className="note-title">{event.importantNote.title}</h4>
                    <p className="note-message">{event.importantNote.message}</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Info Card */}
              <div className="event-right">
                <div className="info-card">
                  <h3 className="info-card-title">Informasi Kegiatan</h3>

                  <div className="info-item">
                    <div className="info-icon">
                      <Calendar size={20} />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Tanggal</p>
                      <p className="info-value">{event.date}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <Clock size={20} />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Waktu</p>
                      <p className="info-value">{event.time}</p>
                      <p className="info-note">Durasi: {event.duration}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <MapPin size={20} />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Lokasi</p>
                      <p className="info-value">{event.location}</p>
                      <p className="info-address">{event.fullAddress}</p>
                      <a href={event.mapLink} className="map-link">Lihat Peta</a>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <Users size={20} />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Kapasitas</p>
                      <p className="info-value">{event.capacity}</p>
                      <p className="info-note">Kuota tersedia</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon">
                      <span className="price-icon">💰</span>
                    </div>
                    <div className="info-content">
                      <p className="info-label">Biaya</p>
                      <p className="info-price">{event.price}</p>
                      <p className="info-note">{event.priceNote}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
