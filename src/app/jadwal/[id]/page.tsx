import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Phone, Share2, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import '@/styles/landing.css';
import '@/styles/event-detail.css';


export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Mock data - in real app, fetch based on id
  const event = {
    id: id,
    title: 'Imunisasi Bulanan',
    subtitle: 'Program Vaksinasi Balita',
    date: 'Senin, 27 Januari 2025',
    time: '08:00 - 12:00 WIB',
    duration: '4 Jam',
    location: 'Balai Desa Sukamaju',
    fullAddress: 'Jl. Kesehatan No. 45, Kec. Sukamaju, Kab. Sejahtera',
    mapLink: '#',
    capacity: '50 Peserta',
    registered: '32 terdaftar (18 tersisa)',
    price: 'GRATIS',
    priceNote: 'Didukung oleh Pemerintah',
    description: 'Program imunisasi lengkap rutin Posyandu Sehat Mandiri untuk memberikan perlindungan kesehatan optimal bagi balita. Kegiatan ini meliputi pemberian vaksin lengkap sesuai jadwal yang telah ditetapkan oleh Kementerian Kesehatan RI.\n\nDalam kegiatan ini, setiap balita akan mendapatkan pemeriksaan kesehatan dasar, konsultasi mengenai tumbuh kembang, pemberian vaksin yang sesuai dengan usia dan kondisi kesehatan anak. Orang tua juga akan mendapatkan edukasi tentang pentingnya imunisasi dan cara merawat anak pasca vaksinasi.',
    coordinator: {
      name: 'dr. Siti Nurhaliza',
      role: 'Bidan Kepala',
    },
    contact: {
      phone: '0812-3456-7890',
      whatsapp: 'WhatsApp tersedia',
    },
    requirements: [
      'Membawa Kartu Menuju Sehat (KMS) atau buku kesehatan anak',
      'Anak dalam kondisi sehat (tidak demam atau sakit)',
      'Membawa fotokopi Kartu Keluarga (KK)',
      'Orang tua/wali mendampingi anak',
      'Datang 15 menit sebelum jadwal untuk registrasi',
      'Mengikuti protokol kesehatan yang berlaku',
    ],
    importantNote: {
      title: 'Catatan Penting',
      message: 'Jika anak memiliki riwayat alergi atau kondisi kesehatan khusus, harap konsultasikan dengan petugas kesehatan sebelum imunisasi.',
    },
    tags: ['Imunisasi', '0-5 Tahun'],
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
                  {event.tags.map((tag, index) => (
                    <span key={index} className="event-tag">{tag}</span>
                  ))}
                  <button className="share-button">
                    <Share2 size={16} />
                  </button>
                </div>

                {/* Description */}
                <div className="event-section">
                  <h2 className="section-heading">Deskripsi Kegiatan</h2>
                  <div className="event-description">
                    {event.description.split('\n\n').map((paragraph, index) => (
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
                    {event.requirements.map((req, index) => (
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
                      <p className="info-registered">{event.registered}</p>
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

                  <div className="info-actions">
                    <button className="btn-register">
                      Daftar Sekarang
                    </button>
                    <button className="btn-save">
                      Simpan Kegiatan
                    </button>
                  </div>

                  <p className="info-disclaimer">
                    * Pendaftaran akan dikonfirmasi
                  </p>
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
