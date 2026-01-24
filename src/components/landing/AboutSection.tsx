'use client';

import React from 'react';
import { Eye, Target, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="tentang" className="about-section">
      <div className="container">
        {/* Section Badge */}
        <div className="section-badge">Tentang Kami</div>

        {/* Section Title */}
        <h2 className="section-title">Mengenal Posyandu Sehat Mandiri</h2>
        <p className="section-subtitle">
          Berdedikasi melayani kesehatan masyarakat sejak 2010
        </p>

        <div className="about-grid">
          {/* Left Column - Visi & Misi */}
          <div className="about-left">
            {/* Visi Card */}
            <div className="info-card">
              <div className="card-icon visi">
                <Eye size={28} />
              </div>
              <div className="card-content">
                <h3 className="card-title">Visi</h3>
                <p className="card-text">
                  Menjadi pos pelayanan terpadu yang terdepan dalam memberikan
                  layanan kesehatan berkualitas untuk ibu, anak, dan seluruh masyarakat
                  desa menuju Indonesia sehat dan sejahtera.
                </p>
              </div>
            </div>

            {/* Misi Card */}
            <div className="info-card">
              <div className="card-icon misi">
                <Target size={28} />
              </div>
              <div className="card-content">
                <h3 className="card-title">Misi</h3>
                <ol className="misi-list">
                  <li>Memberikan pelayanan kesehatan dasar yang terjangkau dan berkualitas</li>
                  <li>Meningkatkan kesadaran masyarakat tentang pentingnya kesehatan</li>
                  <li>Melakukan pemantauan tumbuh kembang balita secara berkala</li>
                  <li>Memberikan edukasi gizi dan pola hidup sehat</li>
                  <li>Membangun kemitraan dengan berbagai pihak untuk kesehatan masyarakat</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div className="about-right">
            {/* Location Card */}
            <div className="contact-card">
              <div className="contact-icon">
                <MapPin size={24} />
              </div>
              <div className="contact-content">
                <h4 className="contact-title">Lokasi</h4>
                <p className="contact-text">
                  Jl. Kesehatan No. 123, Desa Sukamaju<br />
                  Kecamatan Harapan Jaya<br />
                  Kabupaten Sejahtera, Jawa Barat 12345
                </p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="contact-card">
              <div className="contact-icon">
                <Phone size={24} />
              </div>
              <div className="contact-content">
                <h4 className="contact-title">Telepon</h4>
                <p className="contact-text">
                  (021) 1234-5678<br />
                  WhatsApp: 0812-3456-7890
                </p>
              </div>
            </div>

            {/* Email Card */}
            <div className="contact-card">
              <div className="contact-icon">
                <Mail size={24} />
              </div>
              <div className="contact-content">
                <h4 className="contact-title">Email</h4>
                <p className="contact-text">
                  posyandu.sehatmandiri@gmail.com
                </p>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="contact-card">
              <div className="contact-icon">
                <Clock size={24} />
              </div>
              <div className="contact-content">
                <h4 className="contact-title">Jadwal Operasional</h4>
                <div className="schedule-list">
                  <div className="schedule-item">
                    <span className="schedule-day">Senin - Rabu</span>
                    <span className="schedule-time">08:00 - 12:00 WIB</span>
                  </div>
                  <div className="schedule-item">
                    <span className="schedule-day">Kamis</span>
                    <span className="schedule-time">08:00 - 14:00 WIB</span>
                  </div>
                  <div className="schedule-item">
                    <span className="schedule-day">Jumat</span>
                    <span className="schedule-time">08:00 - 11:00 WIB</span>
                  </div>
                  <div className="schedule-item">
                    <span className="schedule-day">Sabtu - Minggu</span>
                    <span className="schedule-time closed">Tutup</span>
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
