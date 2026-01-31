'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

// Data Dummy (Bisa Anda ganti dengan foto asli kegiatan Posyandu)
const galleryItems = [
  {
    id: 1,
    src: "/Dokumentasi/Penyuluhan-Bayi.jpeg",
    title: "Pemberian suntik imunisasi pada bayi",
    desc: "Memberikan imunisasi pada bayi 9 bulan melalui layanan posyandu."
  },
  {
    id: 2,
    src: "/Dokumentasi/Dokum_2.jpeg",
    title: "Pengecekan ibu hamil",
    desc: "Mengecek sudah berapa bulan ibu hamil, dan memberikan vitamin kepada ibu hamil."
  },
  {
    id: 3,
    src: "/Dokumentasi/Dokum_7.jpeg",
    title: "Imunisasi Rutin",
    desc: "Pemberian vaksin dasar lengkap untuk meningkatkan kekebalan tubuh."
  },
];

export default function GallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Efek Auto Slide (Bergeser setiap 5 detik)
  useEffect(() => {
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    // Membersihkan interval saat komponen di-unmount agar tidak memakan memori
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
    <section id="galeri" className="py-16 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Camera className="text-primary" size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Galeri Kegiatan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dokumentasi visual kegiatan pelayanan kesehatan dan pemberdayaan masyarakat yang telah kami laksanakan.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="max-w-5xl mx-auto relative group px-2">
            {/* Main Image Frame */}
            <div className="relative w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg bg-gray-200">
               <Image
                 src={galleryItems[currentIndex].src}
                 alt={galleryItems[currentIndex].title}
                 fill
                 className="object-cover transition-transform duration-700 ease-in-out hover:scale-105"
                 priority
                 unoptimized
               />
               
               {/* Overlay Text (Gradient Hitam di Bawah) */}
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-8 text-white">
                 <h3 className="text-xl md:text-2xl font-bold mb-2 drop-shadow-md">
                    {galleryItems[currentIndex].title}
                 </h3>
                 <p className="text-sm md:text-base text-gray-100 max-w-2xl drop-shadow-sm">
                    {galleryItems[currentIndex].desc}
                 </p>
               </div>
            </div>

            {/* Tombol Navigasi Kiri */}
            <button 
                onClick={prevSlide}
                className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 left-4 md:left-6 w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-white/20 hover:bg-primary backdrop-blur-sm text-white transition-all duration-300 shadow-md"
                aria-label="Previous Slide"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Tombol Navigasi Kanan */}
            <button 
                onClick={nextSlide}
                className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 right-4 md:right-6 w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-white/20 hover:bg-primary backdrop-blur-sm text-white transition-all duration-300 shadow-md"
                aria-label="Next Slide"
            >
                <ChevronRight size={24} />
            </button>

            {/* Indikator Titik (Dots) */}
            <div className="flex justify-center mt-6 gap-2">
                {galleryItems.map((_, slideIndex) => (
                    <button
                      key={slideIndex}
                      onClick={() => goToSlide(slideIndex)}
                      className={`transition-all duration-300 h-2 rounded-full ${
                          currentIndex === slideIndex 
                          ? 'bg-primary w-8' 
                          : 'bg-gray-300 w-2 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${slideIndex + 1}`}
                    />
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}