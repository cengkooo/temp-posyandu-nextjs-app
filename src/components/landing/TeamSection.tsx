'use client';

import React from 'react';
import { User } from 'lucide-react';

export default function TeamSection() {
  const teamMembers = [
    {
      name: 'Ibu Siti Rahayu',
      role: 'Ketua Kader',
      photo: null,
    },
    {
      name: 'Ibu Dewi Lestari',
      role: 'Bidan Desa',
      photo: null,
    },
    {
      name: 'Ibu Ani Wulandari',
      role: 'Kader Posyandu',
      photo: null,
    },
    {
      name: 'Ibu Ratna Sari',
      role: 'Kader Posyandu',
      photo: null,
    },
    {
      name: 'Ibu Maya Putri',
      role: 'Kader Posyandu',
      photo: null,
    },
    {
      name: 'Ibu Fitri Handayani',
      role: 'Kader Posyandu',
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
