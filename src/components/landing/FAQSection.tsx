'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Apa itu Posyandu?',
      answer: 'Posyandu (Pos Pelayanan Terpadu) adalah pusat kegiatan masyarakat dalam upaya pelayanan kesehatan dan keluarga berencana. Posyandu merupakan salah satu bentuk Upaya Kesehatan Bersumber Daya Masyarakat (UKBM) yang dikelola dan diselenggarakan dari, oleh, untuk dan bersama masyarakat.',
    },
    {
      question: 'Siapa saja yang bisa mendapatkan layanan di Posyandu?',
      answer: 'Layanan Posyandu terbuka untuk semua anggota masyarakat, terutama: Bayi dan Balita (0-5 tahun) untuk imunisasi dan pemantauan tumbuh kembang, Ibu Hamil untuk pemeriksaan kehamilan rutin, Ibu Menyusui untuk konsultasi dan edukasi, Pasangan Usia Subur untuk layanan KB, dan Lansia untuk pemeriksaan kesehatan.',
    },
    {
      question: 'Apa saja dokumen yang perlu dibawa saat ke Posyandu?',
      answer: 'Dokumen yang perlu dibawa: KTP/Kartu Keluarga, Buku KIA (Kesehatan Ibu dan Anak) untuk ibu hamil dan balita, Kartu Imunisasi untuk balita, Kartu BPJS/asuransi kesehatan (jika ada). Untuk kunjungan pertama, cukup membawa KTP dan dokumen identitas lainnya.',
    },
    {
      question: 'Apakah layanan Posyandu berbayar?',
      answer: 'Tidak, layanan Posyandu GRATIS untuk seluruh masyarakat. Semua pelayanan dasar seperti penimbangan, pengukuran, imunisasi, pemeriksaan ibu hamil, dan konseling kesehatan tidak dipungut biaya. Posyandu didukung oleh pemerintah dan dikelola oleh kader kesehatan masyarakat.',
    },
    {
      question: 'Bagaimana jadwal imunisasi untuk bayi?',
      answer: 'Jadwal imunisasi dasar lengkap untuk bayi: Usia 0 bulan (Hepatitis B, Polio 0), Usia 1 bulan (BCG, Polio 1), Usia 2 bulan (DPT-HB-Hib 1, Polio 2), Usia 3 bulan (DPT-HB-Hib 2, Polio 3), Usia 4 bulan (DPT-HB-Hib 3, Polio 4, IPV), Usia 9 bulan (Campak/MR). Imunisasi lanjutan diberikan pada usia 18 bulan dan 5 tahun.',
    },
    {
      question: 'Apakah Posyandu buka setiap hari?',
      answer: 'Posyandu umumnya buka pada hari dan jam tertentu sesuai jadwal yang telah ditentukan. Posyandu Sehat Mandiri buka: Senin-Rabu (08:00-12:00), Kamis (08:00-14:00), Jumat (08:00-11:00). Untuk jadwal kegiatan khusus seperti imunisasi massal atau penyuluhan, silakan cek jadwal kegiatan kami.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        {/* Section Badge */}
        <div className="section-badge">FAQ</div>

        {/* Section Title */}
        <h2 className="section-title">Pertanyaan yang Sering Diajukan</h2>
        <p className="section-subtitle">
          Temukan jawaban untuk pertanyaan umum seputar layanan Posyandu
        </p>

        {/* FAQ List */}
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className={`faq-question ${openIndex === index ? 'active' : ''}`}
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`faq-icon ${openIndex === index ? 'rotate' : ''}`}
                />
              </button>
              <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
