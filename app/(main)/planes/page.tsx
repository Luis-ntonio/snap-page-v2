import PlanesSection from '@/app/components/ui/PlanesSection';

export const metadata = {
  title: 'Planes · Snap Page',
  description: 'Elige el photobook perfecto para tu historia. Desde S/.70',
};

export default function PlanesPage() {
  return (
    <main>
      <section style={{ padding: '64px 32px 48px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: 26, color: 'var(--coral)', margin: '0 0 8px', transform: 'rotate(-1deg)' }}>
          cuatro formas de contar tu historia
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,4vw,3.4rem)', margin: '0 0 14px', color: 'var(--tinta)' }}>
          Elige tu plan
        </h1>
        <p style={{ fontSize: 15.5, color: 'var(--texto-2)', margin: 0 }}>
          Todos incluyen tapa dura · A4 · 20 páginas · Listo en 1 semana
        </p>
      </section>
      <PlanesSection />
    </main>
  );
}
