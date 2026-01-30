'use client';

import React from 'react';
import { User } from 'lucide-react';

export default function TeamSection() {
  const teamMembers = [
    {
      name: 'Rosnayah',
      role: 'Ketua Kader',
      photo: null,
    },
    {
      name: 'Siti Kurningsih',
      role: 'Sekretaris',
      photo: null,
    },
    {
      name: 'Hudriyah',
      role: 'Bendahara',
      photo: null,
    },
    {
      name: 'Astriani',
      role: 'Ketua Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Naenah',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Suhariyah',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Masrifah',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Saminah',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Asmah',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Widya Anita',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Suiyah',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Nur Afni Sukaesih',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Nova Wati',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Betri Yenti',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Neti Sartika',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Saiyah Nurfadilah',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Siti Sa’adiyah',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Sugi Hariati',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Sri Astuti',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Susanti',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Sunaenah',
      role: 'Kader Bidang Kesehatan',
      photo: null,
    },
    {
      name: 'Umi Kulsum',
      role: 'Ketua Bidang Pendidikan',
      photo: null,
    },
    {
      name: 'Leli Sodikin',
      role: 'Ketua Bidang Linmas',
      photo: null,
    },
    {
      name: 'Zakaria',
      role: 'Ketua Bidang Pekerjaan Umum',
      photo: null,
    },
    {
      name: 'Sobri',
      role: 'Ketua Bidang Perumahan Rakyat',
      photo: null,
    },
    {
      name: 'Mulyono',
      role: 'Ketua Bidang Sosial',
      photo: null,
    },
  ];



  return (
    <section id="tim" className="team-section">
      <div className="container">
        {/* Section Badge */}
        <div className="section-badge">Tim Kami</div>

        {/* Section Title */}
        <h2 className="section-title">Tim Kader Posyandu</h2>
        <p className="section-subtitle">
          Didukung oleh tim kader yang berdedikasi dan berpengalaman dalam pelayanan kesehatan masyarakat
        </p>

        {/* Team Grid */}
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-photo">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} />
                ) : (
                  <div className="photo-placeholder">
                    <User size={48} />
                  </div>
                )}
              </div>
              <div className="team-info">
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
