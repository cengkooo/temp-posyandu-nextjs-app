import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import ServicesSection from '@/components/landing/ServicesSection';
import ScheduleSection from '@/components/landing/ScheduleSection';
import TeamSection from '@/components/landing/TeamSection';
import FAQSection from '@/components/landing/FAQSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="beranda">
        <HeroSection />
        <ScheduleSection />
        <AboutSection />
        <ServicesSection />
        <TeamSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
