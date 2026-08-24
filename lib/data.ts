import type { Plantilla, Portada, FaqItem, TextStylePreset } from '@/types';

export const WHATSAPP = '51922272439';
export const EMAIL_ADMIN = 'fotolibros.snap@gmail.com';
export const GOOGLE_CALENDAR = 'https://calendar.app.google/fEiWSvwmP6NPRJar5';

export const waLink = (msg: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

export const WA_MESSAGES = {
  minimal: '¡Hola! Quiero realizar un pedido del Plan Minimal 📸',
  minimalConPdf: (viewerUrl: string) =>
    `¡Hola! Quiero realizar un pedido del Plan Minimal 📸\nMira mi PDF: ${viewerUrl}`,
  personalizado: (plantilla: string, portada: string) =>
    `¡Hola! Quiero el Plan Personalizado con la plantilla "${plantilla}" y portada "${portada}" 💛`,
  tengoDiseno: '¡Hola! Tengo mi diseño listo y quiero imprimirlo con ustedes 🎨',
  tengoDisenoConPdf: (pdfUrl: string) =>
    `¡Hola! Tengo mi diseño listo y quiero imprimirlo con ustedes 🎨\nAquí puedes ver mi PDF: ${pdfUrl}`,
  canvaLink: (link: string) =>
    `¡Hola! Aquí está mi link de Canva para mi photobook: ${link}`,
  premium: '¡Hola! Me interesa el Plan Premium y quisiera agendar una reunión ✨',
  general: '¡Hola! Estoy interesada en crear un photobook 📖',
  pedido: (numero: string) =>
    `¡Hola! Quiero proceder con el pago de mi pedido N° ${numero} 💳`,
  pedidoPersonalizado: (numero: string, viewerUrl: string) =>
    `¡Hola! Mi pedido N° ${numero} del Plan Personalizado está listo 🎉\nAquí puedes ver mi diseño: ${viewerUrl}`,
};

// imagen_preview/imagen_muestra son claves relativas al bucket público `assets` (Supabase
// Storage), no rutas de /public — se resuelven con mediaUrl() (lib/media.ts). Administrables
// desde /admin/contenido; ver lib/mediaSlots.ts para la lista completa de espacios.
export const PLANTILLAS: Plantilla[] = [
  {
    id: 'parejas-1',
    nombre: 'Mi Pareja',
    categoria: 'parejas',
    hojas: 10,
    fotos: 32,
    imagen_preview: 'plantillas/parejas-1-preview.jpg',
    imagen_muestra: 'plantillas/parejas-1-muestra.jpg',
    imagenes_interiores: [],
  },
  {
    id: 'parejas-2',
    nombre: 'Amor Eterno',
    categoria: 'parejas',
    hojas: 10,
    fotos: 30,
    imagen_preview: 'plantillas/parejas-2-preview.jpg',
    imagen_muestra: 'plantillas/parejas-2-muestra.jpg',
    imagenes_interiores: [],
  },
  {
    id: 'cumpleanos-1',
    nombre: 'Feliz Cumpleaños',
    categoria: 'cumpleanos',
    hojas: 10,
    fotos: 24,
    imagen_preview: 'plantillas/cumple-1-preview.jpg',
    imagen_muestra: 'plantillas/cumple-1-muestra.jpg',
    imagenes_interiores: [],
  },
  {
    id: 'viajes-1',
    nombre: 'Aventuras',
    categoria: 'viajes',
    hojas: 10,
    fotos: 60,
    imagen_preview: 'plantillas/viajes-1-preview.jpg',
    imagen_muestra: 'plantillas/viajes-1-muestra.jpg',
    imagenes_interiores: [],
  },
];

// Álbum de ejemplo REAL (diseñado por Malú, con fotos curadas), pre-rasterizado a JPEGs — se muestra
// en /plantillas/[categoria] en vez del lienzo con fotos genéricas de picsum. Las imágenes viven en
// plantillas-ejemplo/{categoria}/{1..count}.jpg dentro del bucket `assets`, generadas una sola vez con
// scripts/render-plantilla-pdfs.mjs a partir de los PDF que envió Malú (no versionados en git, pesan
// 30-45MB) — pre-rasterizar en vez de cargar el PDF completo en el navegador de cada visitante evita
// ~60-90s de espera por render de pdfjs-dist en cliente.
export const PLANTILLA_EJEMPLO_PAGINAS: Record<string, number> = {
  parejas: 20,
  cumpleanos: 20,
  viajes: 20,
};

// Presets de tipografía/color para los textos del álbum Personalizado — selector limitado (no
// tipografía libre) para poder resolver el pedido más frecuente de "cambiar la letra/color" sin
// necesitar un pedido manual por WhatsApp. Usa solo las 3 familias ya cargadas en app/layout.tsx.
export const TEXT_STYLE_PRESETS: TextStylePreset[] = [
  { id: 'clasico', nombre: 'Clásico', fontFamily: "'Raleway', Arial, sans-serif" },
  { id: 'elegante', nombre: 'Elegante', fontFamily: "'Gloock', serif", color: '#5B3A29' },
  { id: 'manuscrito', nombre: 'Manuscrito', fontFamily: "'Caveat', cursive", color: '#C0392B' },
  { id: 'moderno', nombre: 'Moderno', fontFamily: "'Raleway', Arial, sans-serif", color: '#1a1410' },
];

// Paleta de colores para pintar UN bloque de texto a la vez en el editor del álbum Personalizado
// (a diferencia de TEXT_STYLE_PRESETS.color, que repinta todo el álbum de una).
export const TEXT_COLOR_PALETTE: { nombre: string; color: string }[] = [
  { nombre: 'Tinta', color: '#2B211C' },
  { nombre: 'Marrón', color: '#7E451B' },
  { nombre: 'Coral', color: '#E8795A' },
  { nombre: 'Vino', color: '#C0392B' },
  { nombre: 'Verde', color: '#7C9A72' },
  { nombre: 'Azul noche', color: '#2C3E50' },
  { nombre: 'Gris cálido', color: '#6E5D52' },
  { nombre: 'Blanco', color: '#FFFFFF' },
];

// imagen es una clave relativa al bucket público `assets` — ver comentario de PLANTILLAS arriba.
export const PORTADAS: Portada[] = [
  {
    id: 'portada-1',
    nombre: 'The Story of Us',
    imagen: 'portadas/portada-1.jpg',
    categorias: ['parejas'],
  },
  {
    id: 'portada-2',
    nombre: 'I\'m in Love',
    imagen: 'portadas/portada-2.jpg',
    categorias: ['parejas'],
  },
  {
    id: 'portada-3',
    nombre: 'Aventuras',
    imagen: 'portadas/portada-3.jpg',
    categorias: ['viajes'],
  },
  {
    id: 'portada-4',
    nombre: 'Feliz Día',
    imagen: 'portadas/portada-4.jpg',
    categorias: ['cumpleanos'],
  },
];

export const FAQ_DEFAULT: FaqItem[] = [
  {
    id: '1',
    pregunta: '¿Hacen delivery?',
    respuesta:
      '¡Sí! El envío a domicilio tiene un costo adicional entre 10 a 15 soles según distrito. Puedes recoger de forma gratuita en la estación Matellini previa coordinación.',
    orden: 1,
  },
  {
    id: '2',
    pregunta: '¿En cuánto tiempo llega mi libro?',
    respuesta:
      'El tiempo de elaboración es de una semana. Las entregas son los días domingos.',
    orden: 2,
  },
  {
    id: '3',
    pregunta: '¿Puedo realizarlo con plastificado mate?',
    respuesta: 'Sí, con un precio adicional de 10 soles.',
    orden: 3,
  },
  {
    id: '4',
    pregunta: '¿Y si quiero más páginas?',
    respuesta: 'Puedes realizarlo con un precio adicional. ¡Escríbenos y cotiza!',
    orden: 4,
  },
];

export const CHATBOT_FAQ_DEFAULT = [
  {
    pregunta: '¿Cuánto demora?',
    respuesta: 'Una semana.',
  },
  {
    pregunta: '¿Dónde están?',
    respuesta:
      'Nos ubicamos en Chorrillos. Hacemos delivery a todo Lima. También hacemos envíos con Olva y Shalom. Puedes recoger de forma gratuita en Chorrillos previa coordinación.',
  },
  {
    pregunta: '¿Cómo pago?',
    respuesta: 'Aceptamos transferencia, Yape y Plin.',
  },
];

export const DATOS_GENERALES = {
  tamano: 'A4 (29.7 x 21 cm)',
  material: 'Papel couché 300gr con plastificado brillante',
  tapa: 'Dura',
  cantidad: '10 hojas (20 páginas llenas de recuerdos)',
};

// Distritos de Lima Metropolitana, para el selector de dirección de envío (registro / Mi cuenta).
export const DISTRITOS_LIMA = [
  'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chorrillos', 'Cieneguilla', 'Comas',
  'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lima Cercado',
  'Lince', 'Los Olivos', 'Lurigancho (Chosica)', 'Lurín', 'Magdalena del Mar', 'Miraflores',
  'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa', 'Punta Negra',
  'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho',
  'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel',
  'Santa Anita', 'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco', 'Surquillo',
  'Villa El Salvador', 'Villa María del Triunfo',
];

export const PASOS = [
  {
    numero: '1.',
    titulo: 'Elige tu plan',
    desc: 'Minimal, Personalizado, tu propio diseño o Premium: el que mejor cuente tu historia.',
  },
  {
    numero: '2.',
    titulo: 'Envía tus fotos',
    desc: 'Súbelas online o mándalas por WhatsApp, enumeradas y en alta calidad.',
  },
  {
    numero: '3.',
    titulo: 'Revisa tu preview',
    desc: 'Te enviamos un PDF de cómo quedará tu photobook antes de imprimir.',
  },
  {
    numero: '4.',
    titulo: 'Confirma y listo',
    desc: 'Pagas el 50% para empezar. En una semana tu revista está en tus manos.',
  },
];
