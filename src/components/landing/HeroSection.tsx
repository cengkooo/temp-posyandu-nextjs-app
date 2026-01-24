'use client';

import React from 'react';
import { Calendar, Phone, Users, Clock, Award } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-overlay">
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <span className="badge-icon">💚</span>
            <span>Pelayanan Kesehatan Masyarakat</span>
          </div>

          {/* Main Title */}
          <h1 className="hero-title">Posyandu Sehat Mandiri</h1>
          
          {/* Subtitle */}
          <p className="hero-subtitle">
            Melayani dengan Hati untuk Kesehatan Keluarga Indonesia
          </p>

          {/* Location */}
          <div className="hero-location">
            <span className="location-icon">📍</span>
            <span>Desa Sukamaju, Kecamatan Harapan Jaya, Kabupaten Sejahtera</span>
          </div>

          {/* CTA Buttons */}
          <div className="hero-cta">
            <button className="btn-primary">
              <Calendar size={20} />
              <span>Lihat Jadwal Kegiatan</span>
            </button>
            <button className="btn-secondary">
              <Phone size={20} />
              <span>Hubungi Kami</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={32} />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">2,500+</h3>
                <p className="stat-label">Pasien Terlayani</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={32} />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">15+</h3>
                <p className="stat-label">Tahun Melayani</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Award size={32} />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">100%</h3>
                <p className="stat-label">Kepuasan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="mouse"></div>
        </div>
      </div>
    </section>
  );
}
