'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPlantillaLayout } from '@/lib/plantillas';
import AlbumEditor from '@/app/components/ui/AlbumEditor';

export default function EditorPage() {
  const { plantillaId } = useParams() as { plantillaId: string };
  const layout = getPlantillaLayout(plantillaId);

  if (!layout) {
    return (
      <main style={{ background: '#faf9f7', minHeight: '100vh', paddingTop: 120, textAlign: 'center' }}>
        <p style={{ fontFamily: "'Raleway', sans-serif", color: '#666', fontSize: 15, marginBottom: 16 }}>
          El editor de esta plantilla estará disponible pronto.
        </p>
        <Link href="/plantillas" style={{ fontFamily: "'Raleway', sans-serif", color: '#7B3A1E', fontWeight: 700, fontSize: 13 }}>
          ← Ver plantillas
        </Link>
      </main>
    );
  }

  return (
    <main style={{ background: '#faf9f7', minHeight: '100vh', paddingTop: 92 }}>
      <AlbumEditor layout={layout} />
    </main>
  );
}
