'use client';
import { memo, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowLeftRight, Plus, X } from 'lucide-react';
import type { AlbumPageLayout, DecorationLayer, PhotoSlot, TextSlot, TextStylePreset } from '@/types';

const F: React.CSSProperties = { fontFamily: "'Raleway', Arial, sans-serif" };
const BROWN = '#7E451B';

// Fondo de corazones (patrón CSS ligero) para páginas con pattern:'hearts'.
export const HEARTS_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ctext x='8' y='24' font-size='16'%3E%E2%9D%A4%EF%B8%8F%3C/text%3E%3C/svg%3E\")";

// Fondo de paisaje (gradiente CSS, sin foto real) para páginas con pattern:'landscape' —
// simula un fondo fijo de diseño (no editable) detrás de fotos que no cubren toda la página.
export const LANDSCAPE_BG =
  'linear-gradient(180deg, #9fd0e0 0%, #cbe8ec 30%, #f6d9a8 55%, #e8b978 72%, #c98a53 100%)';

// Renderiza una página del álbum (fondo + slots fijos + textos).
// editable=true → subir/quitar fotos y editar textos. editable=false → vista previa de solo lectura.
export const AlbumPageCanvas = memo(function AlbumPageCanvas({
  page,
  urls = {},
  texts = {},
  editable,
  onSlot,
  onRemove,
  onText,
  onDropFile,
  reorderMode = false,
  selectedSlot = null,
  onSelectSlot,
  textStyle,
  textColors = {},
  textSizes = {},
  onTextFocus,
  maxWidth = 380,
}: {
  page: AlbumPageLayout;
  urls?: Record<number, string>;
  texts?: Record<string, string>;
  editable: boolean;
  onSlot?: (n: number) => void;
  onRemove?: (n: number) => void;
  onText?: (key: string, value: string) => void;
  onDropFile?: (n: number, file: File) => void;
  /** Modo "ordenar fotos": el clic en un recuadro selecciona/intercambia en vez de abrir el selector de archivo. */
  reorderMode?: boolean;
  selectedSlot?: number | null;
  onSelectSlot?: (n: number) => void;
  /** Preset de tipografía/color elegido (null = estilo original de la plantilla). */
  textStyle?: TextStylePreset | null;
  /** Color elegido para UN bloque de texto en particular (key → color), pisa textStyle.color. */
  textColors?: Record<string, string>;
  /** Multiplicador de tamaño para UN bloque de texto en particular (key → factor, ej. 1.25). */
  textSizes?: Record<string, number>;
  /** Avisa qué bloque de texto se está editando, para mostrar la paleta de color/tamaño de ESE bloque. */
  onTextFocus?: (slot: TextSlot) => void;
  maxWidth?: number;
}) {
  const back = (page.decorations ?? []).filter((d) => d.layer === 'back');
  const front = (page.decorations ?? []).filter((d) => d.layer === 'front');
  // 'frame' (marcos/*.svg) suele ser la imagen de fondo COMPLETA de la página (blanco opaco + borde
  // decorativo) — va detrás de las fotos, que se dibujan encima cubriendo el centro y dejando ver el
  // borde alrededor. frame.onTop es la excepción: un SVG del mismo marco pero sin su fondo blanco (ver
  // marcos/14-overlay.svg), genuinamente transparente — ese sí va ENCIMA de la foto.
  const frameOnTop = page.frame?.onTop;
  const frameStyle = page.frame
    ? { backgroundImage: `url(${page.frame.src})`, backgroundSize: page.frame.size, backgroundPosition: page.frame.position, backgroundRepeat: 'no-repeat' as const }
    : null;
  const bgDecor = page.frame && !frameOnTop
    ? frameStyle
    : page.pattern === 'hearts'
      ? { backgroundImage: HEARTS_BG }
      : page.pattern === 'landscape'
        ? { backgroundImage: LANDSCAPE_BG }
        : null;
  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth, aspectRatio: '0.707',
      containerType: 'size', // habilita la unidad cqh en los textos
      background: page.bg ?? '#fff', borderRadius: 4, overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      ...bgDecor,
    }}>
      {back.map((d, i) => <Decoration key={`back-${i}`} d={d} />)}
      {page.slots.map((s) => (
        <Slot key={s.n} slot={s} url={urls[s.n]} editable={editable} onSlot={onSlot} onRemove={onRemove} onDropFile={onDropFile}
          reorderMode={reorderMode} selected={selectedSlot === s.n} onSelectSlot={onSelectSlot} />
      ))}
      {frameOnTop && frameStyle && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...frameStyle }} />
      )}
      {(page.texts ?? []).map((t) => (
        <TextBox key={t.key} slot={t} value={texts[t.key] ?? ''} editable={editable} onText={onText} textStyle={textStyle}
          color={textColors[t.key]} sizeScale={textSizes[t.key]} onFocus={onTextFocus ? () => onTextFocus(t) : undefined} />
      ))}
      {front.map((d, i) => <Decoration key={`front-${i}`} d={d} />)}
    </div>
  );
});

function Decoration({ d }: { d: DecorationLayer }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={d.src} alt="" style={{
      position: 'absolute', left: `${d.x * 100}%`, top: `${d.y * 100}%`,
      width: `${d.w * 100}%`, height: `${d.h * 100}%`,
      transform: d.rotate ? `rotate(${d.rotate}deg)` : undefined,
      pointerEvents: 'none', objectFit: 'contain',
    }} />
  );
}

const Slot = memo(function Slot({ slot, url, editable, onSlot, onRemove, onDropFile, reorderMode = false, selected = false, onSelectSlot }: {
  slot: PhotoSlot; url?: string; editable: boolean;
  onSlot?: (n: number) => void; onRemove?: (n: number) => void; onDropFile?: (n: number, file: File) => void;
  reorderMode?: boolean; selected?: boolean; onSelectSlot?: (n: number) => void;
}) {
  const isPolaroid = slot.shape === 'polaroid';
  const isCamera = slot.shape === 'camera';
  const { getRootProps, isDragActive } = useDropzone({
    disabled: !editable || reorderMode,
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: { 'image/*': [] },
    onDrop: (accepted) => {
      const f = accepted[0];
      if (f) onDropFile?.(slot.n, f);
    },
  });
  return (
    <div style={{
      position: 'absolute',
      left: `${slot.x * 100}%`, top: `${slot.y * 100}%`,
      width: `${slot.w * 100}%`, height: `${slot.h * 100}%`,
      transform: slot.rotate ? `rotate(${slot.rotate}deg)` : undefined,
      background: isPolaroid ? '#fff' : isCamera ? '#1c1c1c' : 'transparent',
      padding: isPolaroid ? '4%' : isCamera ? '13% 9%' : 0,
      paddingBottom: isPolaroid ? '14%' : isCamera ? '17%' : 0,
      boxShadow: isPolaroid || isCamera ? '0 2px 8px rgba(0,0,0,0.25)' : undefined,
      borderRadius: isCamera ? 6 : 0,
    }}>
      <div
        {...getRootProps()}
        onClick={editable ? () => (reorderMode ? onSelectSlot?.(slot.n) : onSlot?.(slot.n)) : undefined}
        style={{
          width: '100%', height: '100%', cursor: editable ? 'pointer' : 'default', position: 'relative',
          background: url ? undefined : isDragActive ? 'rgba(126,69,27,0.15)' : 'rgba(0,0,0,0.06)',
          border: selected ? '2.5px solid var(--coral)' : url ? 'none' : `1.5px dashed rgba(126,69,27,${isDragActive ? 0.9 : editable ? 0.4 : 0.25})`,
          boxShadow: selected ? '0 0 0 3px rgba(255,111,74,0.25)' : undefined,
          borderRadius: isPolaroid ? 0 : isCamera ? 2 : 4, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: isCamera ? '#fff' : BROWN, opacity: editable ? 0.7 : 0.5 }}>
            {editable && !reorderMode && <Plus size={16} />}
            <span style={{ ...F, fontSize: 11, fontWeight: 800 }}>{slot.n}</span>
          </div>
        )}
        {editable && url && !reorderMode && (
          <button onClick={(e) => { e.stopPropagation(); onRemove?.(slot.n); }}
            aria-label="Quitar foto"
            style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
            <X size={11} />
          </button>
        )}
        {editable && reorderMode && (
          <div style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%',
            background: selected ? 'var(--coral)' : 'rgba(0,0,0,0.55)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <ArrowLeftRight size={10} />
          </div>
        )}
        {isCamera && <CameraViewfinderOverlay />}
      </div>
      {isCamera && <CameraBodyButtons />}
    </div>
  );
});

// Marco tipo visor de cámara (POV de quien toma la foto): esquinas de enfoque + indicador de batería,
// dibujados sobre la propia foto (como el HUD de la pantalla de una cámara).
function CameraViewfinderOverlay() {
  const bracket = (pos: React.CSSProperties, borders: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute', width: '14%', height: '14%', ...pos, ...borders,
  });
  const edge = '2px solid rgba(255,255,255,0.85)';
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={bracket({ top: '6%', left: '6%' }, { borderTop: edge, borderLeft: edge })} />
      <div style={bracket({ top: '6%', right: '6%' }, { borderTop: edge, borderRight: edge })} />
      <div style={bracket({ bottom: '6%', left: '6%' }, { borderBottom: edge, borderLeft: edge })} />
      <div style={bracket({ bottom: '6%', right: '6%' }, { borderBottom: edge, borderRight: edge })} />
      <div style={{ position: 'absolute', top: '5%', right: '5%', width: 16, height: 8, border: '1px solid rgba(255,255,255,0.85)', borderRadius: 2 }} />
    </div>
  );
}

// Botones físicos del cuerpo de la cámara (marco/bezel), como en la referencia: MENU, REC, AF-ON,
// rueda/joystick, reproducción y disparador — todos decorativos, pointerEvents:none.
function CameraBodyButtons() {
  const btn = (pos: React.CSSProperties, extra?: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute', background: '#3a3a3a', pointerEvents: 'none', ...pos, ...extra,
  });
  return (
    <>
      <div style={btn({ top: '3%', left: '7%', width: '20%', height: '9%' }, { borderRadius: 2 })} />
      <div style={btn({ top: '2%', left: '50%' }, { transform: 'translateX(-50%)', width: '11%', aspectRatio: '1', borderRadius: '50%', background: '#333', border: '1px solid #555' })}>
        <div style={{ position: 'absolute', inset: '30%', borderRadius: '50%', background: '#e53935' }} />
      </div>
      <div style={btn({ top: '3%', right: '7%', width: '13%', height: '9%' }, { borderRadius: '50%' })} />
      <div style={btn({ top: '40%', right: '2%', width: '13%', aspectRatio: '1' }, { borderRadius: '50%', background: '#2a2a2a', border: '2px solid #454545' })} />
      <div style={btn({ bottom: '4%', left: '7%', width: '13%', height: '8%' }, { borderRadius: 2 })} />
      <div style={btn({ bottom: '4%', right: '7%', width: '10%', height: '8%' }, { borderRadius: 2 })} />
      <div style={btn({ bottom: '2%', left: '50%' }, {
        transform: 'translateX(-50%)', width: '13%', aspectRatio: '1', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #fff, #ccc 60%, #999)', border: '1px solid #888',
      })} />
    </>
  );
}

const TEXT_SAVE_DEBOUNCE_MS = 400;

const TextBox = memo(function TextBox({ slot, value, editable, onText, textStyle, color, sizeScale, onFocus }: {
  slot: TextSlot; value: string; editable: boolean; onText?: (key: string, value: string) => void;
  textStyle?: TextStylePreset | null;
  /** Color elegido para ESTE bloque en particular — pisa textStyle.color y slot.color. */
  color?: string;
  /** Multiplicador sobre slot.size para ESTE bloque en particular (ej. 1.25 = 25% más grande). */
  sizeScale?: number;
  onFocus?: () => void;
}) {
  // Estado local para que la escritura sea instantánea (independiente del re-render del resto del
  // libro); el valor solo se propaga al padre (y de ahí al autoguardado) con un pequeño debounce.
  const [local, setLocal] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ajuste de estado derivado durante el render (no en un efecto) cuando `value` cambia desde afuera
  // (p.ej. al hidratar el borrador) — ver https://react.dev/learn/you-might-not-need-an-effect
  if (value !== syncedValue) {
    setSyncedValue(value);
    setLocal(value);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const flush = (next: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
    onText?.(slot.key, next);
  };

  const handleChange = (next: string) => {
    setLocal(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => flush(next), TEXT_SAVE_DEBOUNCE_MS);
  };

  const base: React.CSSProperties = {
    position: 'absolute',
    left: `${slot.x * 100}%`, top: `${slot.y * 100}%`,
    width: `${slot.w * 100}%`, height: `${slot.h * 100}%`,
    fontFamily: textStyle?.fontFamily ?? "'Raleway', Arial, sans-serif",
    fontSize: `${(slot.size ?? 0.03) * (sizeScale ?? 1) * 100}cqh`,
    fontStyle: slot.italic ? 'italic' : 'normal',
    fontWeight: slot.weight ?? 400,
    color: color ?? textStyle?.color ?? slot.color ?? '#333',
    textAlign: slot.align ?? 'left',
    lineHeight: 1.25,
    whiteSpace: 'pre-line',
  };

  // Texto de diseño fijo (no editable): se muestra siempre igual.
  if (!slot.editable) {
    return (
      <div style={{ ...base, display: 'flex', alignItems: 'center',
        justifyContent: slot.align === 'center' ? 'center' : slot.align === 'right' ? 'flex-end' : 'flex-start',
        pointerEvents: 'none' }}>
        {slot.preset}
      </div>
    );
  }

  // Texto editable en modo preview, sin que el cliente lo haya tocado todavía: si el diseño trae
  // un valor de fábrica (preset, ej. "Feliz aniversario"), se muestra tal cual en vez de quedar en
  // blanco; si es un campo pensado para que el cliente lo llene desde cero, se ve el placeholder tenue.
  if (!editable) {
    return (
      <div style={{ ...base, opacity: value || slot.preset ? 1 : 0.6, display: 'flex', alignItems: 'flex-start',
        justifyContent: slot.align === 'center' ? 'center' : slot.align === 'right' ? 'flex-end' : 'flex-start',
        pointerEvents: 'none' }}>
        {value || slot.preset || slot.placeholder}
      </div>
    );
  }

  // Texto editable en el editor.
  return (
    <textarea
      value={local}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={(e) => flush(e.target.value)}
      onFocus={onFocus}
      placeholder={slot.placeholder ?? slot.preset ?? ''}
      style={{ ...base, background: 'transparent', border: 'none', resize: 'none', outline: 'none', padding: 0 }}
    />
  );
});
