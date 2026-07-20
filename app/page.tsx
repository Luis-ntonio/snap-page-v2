import HeroSection from './components/ui/HeroSection';
import CarruselSection from './components/ui/CarruselSection';
import IntroSection from './components/ui/IntroSection';
import PlanesResumenSection from './components/ui/PlanesResumenSection';
import PasosSection from './components/ui/PasosSection';
import ComoEnviarSection from './components/ui/ComoEnviarSection';
import DatosYFaqSection from './components/ui/DatosYFaqSection';
import CtaFinalSection from './components/ui/CtaFinalSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CarruselSection />
      <IntroSection />
      <PlanesResumenSection />
      <PasosSection />
      <ComoEnviarSection />
      <DatosYFaqSection />
      <CtaFinalSection />
    </main>
  );
}
