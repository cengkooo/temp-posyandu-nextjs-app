'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { question: "Apa itu Posyandu?", answer: "Posyandu merupakan salah satu bentuk Upaya Kesehatan Bersumberdaya Masyarakat (UKBM) yang dikelola dan diselenggarakan dari, oleh, untuk dan bersama masyarakat dalam rangka meningkatkan derajat kesehatan masyarakat." },
    { question: "Siapa saja yang bisa mendapatkan layanan di Posyandu?", answer: "Layanan utama ditujukan untuk bayi, balita, ibu hamil, ibu menyusui, pasangan usia subur, dan lansia." },
    { question: "Apa saja dokumen yang perlu dibawa saat ke Posyandu?", answer: "Umumnya cukup membawa Buku KIA (Kesehatan Ibu dan Anak) atau KMS (Kartu Menuju Sehat) serta kartu identitas (KTP/KK)." },
    { question: "Apakah layanan Posyandu berbayar?", answer: "Tidak, layanan kesehatan di Posyandu Way Kalam diberikan secara gratis untuk seluruh warga." }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Informasi Tambahan</h2>
            <p className="text-slate-500 font-medium">Hal-hal yang sering ditanyakan oleh warga mengenai pelayanan kami.</p>
          </div>

          <div className="grid gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className={`rounded-3xl border transition-all duration-300 ${openFaq === i ? 'border-teal-200 bg-teal-50/30' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'}`}>
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-bold text-slate-800 pr-8 text-lg">{faq.question}</span>
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${openFaq === i ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 shadow-sm'}`}>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-8 pb-8 pt-2 text-slate-600 leading-relaxed font-medium">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}