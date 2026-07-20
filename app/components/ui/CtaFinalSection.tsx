import Link from 'next/link';

export default function CtaFinalSection() {
  return (
    <section style={{ padding: '96px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', bottom: -90, left: -90, width: 300, height: 300,
        borderRadius: '50%', background: '#F3E3D7', opacity: 0.8,
      }} />
      <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
        <p style={{
          fontFamily: 'var(--font-hand)', fontSize: 26, color: 'var(--coral)',
          margin: '0 0 10px', transform: 'rotate(-1.5deg)',
        }}>
          tu historia ya está lista para imprimirse
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,3.4vw,2.9rem)', lineHeight: 1.15, margin: '0 0 30px', color: 'var(--tinta)' }}>
          Empieza tu photobook hoy.
        </h2>
        <Link href="/planes" className="btn-primary" style={{ background: 'var(--marron)', padding: '17px 40px', boxShadow: '0 10px 28px rgba(123,58,30,0.3)' }}>
          CREA EL TUYO — DESDE S/ 70
        </Link>
      </div>
    </section>
  );
}
