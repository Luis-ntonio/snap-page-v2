import HeroSection from './components/ui/HeroSection';
import CarruselSection from './components/ui/CarruselSection';
import IntroSection from './components/ui/IntroSection';
import ComoEnviarSection from './components/ui/ComoEnviarSection';
import PasosSection from './components/ui/PasosSection';
import DatosYFaqSection from './components/ui/DatosYFaqSection';
import CtaFinalSection from './components/ui/CtaFinalSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CarruselSection />
      <IntroSection />
      <ComoEnviarSection />
      <PasosSection />
      <DatosYFaqSection />
      <CtaFinalSection />
    </main>
  );
}
