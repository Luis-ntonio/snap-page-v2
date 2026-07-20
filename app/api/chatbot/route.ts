import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { DATOS_GENERALES, WHATSAPP } from '@/lib/data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data } = await supabase
    .from('chatbot_faq')
    .select('pregunta, respuesta')
    .eq('activo', true)
    .order('orden');
  return NextResponse.json({ faqs: data ?? [] });
}

interface ChatTurn {
  from: 'user' | 'bot';
  text: string;
}

// Modelo elegido por costo: gpt-4o-mini es, a la fecha, el más económico entre los
// modelos con calidad suficiente para responder FAQ ($0.15 / $0.60 por 1M tokens
// input/output — ver COSTOS_CHATBOT.md para el detalle y el estimado de mensajes por USD).
const OPENAI_MODEL = 'gpt-4o-mini';

// Respuesta con IA (contexto = FAQ de Supabase + datos generales del negocio).
// Degrada con gracia: si falta OPENAI_API_KEY o la llamada falla, el cliente
// (Chatbot.tsx) cae a su propio matching por palabras clave — nunca se rompe el chat.
export async function POST(req: Request) {
  const { message, history } = (await req.json()) as { message?: string; history?: ChatTurn[] };
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Falta el mensaje' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: null, source: 'fallback' });
  }

  try {
    const { data: faqs } = await supabase
      .from('chatbot_faq')
      .select('pregunta, respuesta')
      .eq('activo', true)
      .order('orden');

    const faqContext = (faqs ?? [])
      .map((f) => `P: ${f.pregunta}\nR: ${f.respuesta}`)
      .join('\n\n');

    const system = `Eres el asistente virtual de Snap Page, un negocio peruano de fotolibros/photobooks personalizados en Lima.
Responde SIEMPRE en español, en tono cercano y breve (máximo 3-4 líneas).
Responde solo con información del contexto de abajo. Si la pregunta no está cubierta por el contexto,
dilo honestamente y sugiere escribir por WhatsApp al ${WHATSAPP} para más detalles — no inventes datos.

## Datos generales del producto
Tamaño: ${DATOS_GENERALES.tamano}
Material: ${DATOS_GENERALES.material}
Tapa: ${DATOS_GENERALES.tapa}
Cantidad: ${DATOS_GENERALES.cantidad}

## Preguntas frecuentes
${faqContext || '(sin preguntas frecuentes cargadas)'}`;

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      max_tokens: 400,
      messages: [
        { role: 'system', content: system },
        ...(history ?? []).slice(-6).map((h) => ({
          role: h.from === 'user' ? ('user' as const) : ('assistant' as const),
          content: h.text,
        })),
        { role: 'user', content: message },
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? null;
    if (!reply) return NextResponse.json({ reply: null, source: 'fallback' });

    return NextResponse.json({ reply, source: 'ai' });
  } catch (err) {
    console.error('Chatbot AI error:', err);
    return NextResponse.json({ reply: null, source: 'fallback' });
  }
}
