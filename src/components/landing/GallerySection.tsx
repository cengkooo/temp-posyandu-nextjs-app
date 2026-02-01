'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

const galleryItems = [
  {
    id: 1,
    src: "/Dokumentasi/Penyuluhan-Bayi.jpeg",
    title: "Pemberian suntik imunisasi",
    desc: "Memberikan imunisasi pada bayi 9 bulan melalui layanan posyandu."
  },
  {
    id: 2,
    src: "/Dokumentasi/Dokum_2.jpeg",
    title: "Pengecekan ibu hamil",
    desc: "Mengecek usia kandungan dan pemberian vitamin."
  },
  {
    id: 3,
    src: "/Dokumentasi/Dokum_7.jpeg",
    title: "Imunisasi Rutin",
    desc: "Pemberian vaksin dasar lengkap."
  },
];

export default function GallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [currentIndex]);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? galleryItems.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === galleryItems.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        
        {/* Styled Header matching the theme */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest mb-4">
              <Camera className="w-4 h-4" /> Dokumentasi Kegiatan
            </div>
            <h2 className="text-4xl font-bold text-slate-900">Potret Pelayanan Kami</h2>
            <p className="text-slate-500 mt-4 font-medium">Melihat lebih dekat interaksi hangat dan profesionalisme kader dalam melayani kesehatan warga desa.</p>
          </div>
        </div>

        {/* Carousel Container with new rounded corners and shadow */}
        <div className="max-w-6xl mx-auto relative group">
            <div className="relative w-full h-[300px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 bg-slate-100">
               <Image
                 src={galleryItems[currentIndex].src}
                 alt={galleryItems[currentIndex].title}
                 fill
                 className="object-cover transition-transform duration-1000 ease-in-out hover:scale-105"
                 priority
                 unoptimized
               />
               
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent p-10 flex flex-col justify-end h-1/2">
                 <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                    {galleryItems[currentIndex].title}
                 </h3>
                 <p className="text-slate-200 text-sm md:text-base max-w-2xl font-medium">
                    {galleryItems[currentIndex].desc}
                 </p>
               </div>
            </div>

            {/* Tombol Navigasi dengan style Teal */}
            <button 
                onClick={prevSlide}
                className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 left-6 w-12 h-12 items-center justify-center rounded-full bg-white/20 hover:bg-teal-600 backdrop-blur-md text-white transition-all duration-300 shadow-lg border border-white/20"
            >
                <ChevronLeft size={24} />
            </button>

            <button 
                onClick={nextSlide}
                className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 right-6 w-12 h-12 items-center justify-center rounded-full bg-white/20 hover:bg-teal-600 backdrop-blur-md text-white transition-all duration-300 shadow-lg border border-white/20"
            >
                <ChevronRight size={24} />
            </button>

            {/* Indikator */}
            <div className="flex justify-center mt-8 gap-2">
                {galleryItems.map((_, slideIndex) => (
                    <button
                      key={slideIndex}
                      onClick={() => goToSlide(slideIndex)}
                      className={`transition-all duration-300 h-1.5 rounded-full ${
                          currentIndex === slideIndex 
                          ? 'bg-teal-500 w-8' 
                          : 'bg-slate-200 w-2 hover:bg-teal-200'
                      }`}
                    />
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}