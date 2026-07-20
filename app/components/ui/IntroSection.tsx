export default function IntroSection() {
  return (
    <section style={{ padding: '88px 32px 72px', textAlign: 'center' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: 24, color: 'var(--coral)', margin: '0 0 8px' }}>
          ¿qué es Snap Page?
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem,3.2vw,2.6rem)', lineHeight: 1.2, margin: '0 0 18px', color: 'var(--tinta)' }}>
          Revistas de tu propia vida.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--texto-2)', margin: 0 }}>
          Creemos que tus recuerdos no deberían quedarse en la galería del celular. Los imprimimos, los cuidamos y los convertimos en un objeto que se regala, se hojea y se guarda para siempre.
        </p>
      </div>
    </section>
  );
}
