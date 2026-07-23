import type { Plantilla, Portada, FaqItem } from '@/types';

export const WHATSAPP = '51922272439';
export const EMAIL_ADMIN = 'fotolibros.snap@gmail.com';
export const GOOGLE_CALENDAR = 'https://calendar.app.google/fEiWSvwmP6NPRJar5';

export const waLink = (msg: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

export const WA_MESSAGES = {
  minimal: '¡Hola! Quiero realizar un pedido del Plan Minimal 📸',
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
  pedidoPersonalizado: (numero: string, pdfUrl: string) =>
    `¡Hola! Mi pedido N° ${numero} del Plan Personalizado está listo 🎉\nAquí puedes ver mi diseño: ${pdfUrl}`,
};

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'parejas-1',
    nombre: 'Mi Pareja',
    categoria: 'parejas',
    hojas: 10,
    fotos: 39,
    imagen_preview: '/images/plantillas/parejas-1-preview.jpg',
    imagenes_interiores: [],
  },
  {
    id: 'parejas-2',
    nombre: 'Amor Eterno',
    categoria: 'parejas',
    hojas: 10,
    fotos: 30,
    imagen_preview: '/images/plantillas/parejas-2-preview.jpg',
    imagenes_interiores: [],
  },
  {
    id: 'cumpleanos-1',
    nombre: 'Feliz Cumpleaños',
    categoria: 'cumpleanos',
    hojas: 10,
    fotos: 25,
    imagen_preview: '/images/plantillas/cumple-1-preview.jpg',
    imagenes_interiores: [],
  },
  {
    id: 'viajes-1',
    nombre: 'Aventuras',
    categoria: 'viajes',
    hojas: 10,
    fotos: 35,
    imagen_preview: '/images/plantillas/viajes-1-preview.jpg',
    imagenes_interiores: [],
  },
];

export const PORTADAS: Portada[] = [
  {
    id: 'portada-1',
    nombre: 'The Story of Us',
    imagen: '/images/portadas/portada-1.jpg',
    categorias: ['parejas'],
  },
  {
    id: 'portada-2',
    nombre: 'I\'m in Love',
    imagen: '/images/portadas/portada-2.jpg',
    categorias: ['parejas'],
  },
  {
    id: 'portada-3',
    nombre: 'Aventuras',
    imagen: '/images/portadas/portada-3.jpg',
    categorias: ['viajes'],
  },
  {
    id: 'portada-4',
    nombre: 'Feliz Día',
    imagen: '/images/portadas/portada-4.jpg',
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
