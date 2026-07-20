'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { CHATBOT_FAQ_DEFAULT } from '@/lib/data';

interface FaqItem { pregunta: string; respuesta: string; }
interface Message { from: 'bot' | 'user'; text: string; }

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>(CHATBOT_FAQ_DEFAULT);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: '¡Hola! 👋 Soy el asistente de SnapPage. ¿En qué te puedo ayudar?' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load FAQ from Supabase if available
    fetch('/api/chatbot').then(r => r.json()).then(data => {
      if (data?.faqs?.length) setFaqs(data.faqs);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFaq = (faq: FaqItem) => {
    setMessages(prev => [
      ...prev,
      { from: 'user', text: faq.pregunta },
      { from: 'bot', text: faq.respuesta },
    ]);
  };

  const keywordFallback = (query: string): string => {
    const match = faqs.find(f =>
      f.pregunta.toLowerCase().includes(query) ||
      query.includes(f.pregunta.toLowerCase().split(' ')[1] ?? '')
    );
    return match
      ? match.respuesta
      : 'No encontré una respuesta exacta. ¡Escríbenos directamente por WhatsApp y te ayudamos! 💬';
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    const query = text.toLowerCase();
    const history = messages;
    setMessages(prev => [...prev, { from: 'user', text }]);
    setInput('');

    // Intenta responder con IA (usa las FAQ de Supabase como contexto); si no hay
    // ANTHROPIC_API_KEY o la llamada falla, el servidor devuelve source:'fallback'
    // y se usa el matching local por palabras clave — el chat nunca se rompe.
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { from: 'bot', text: data.reply ?? keywordFallback(query) }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: keywordFallback(query) }]);
    }
  };

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="chatbot-widget w-80 rounded-2xl shadow-2xl border flex flex-col overflow-hidden"
          style={{ height: '420px', background: 'var(--crema)', borderColor: 'var(--borde)' }}>
          {/* Header */}
          <div className="text-white px-4 py-3 flex items-center justify-between" style={{ background: 'var(--marron)' }}>
            <div>
              <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>Snap Page</p>
              <p className="text-xs opacity-80">Asistente virtual</p>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-70">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ background: 'var(--crema-2)' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={m.from === 'user'
                    ? { background: 'var(--marron)', color: '#fff', borderBottomRightRadius: 4 }
                    : { background: '#fff', color: 'var(--tinta)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid var(--borde)', borderBottomLeftRadius: 4 }}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Quick FAQ buttons (show after first bot message only) */}
            {messages.length === 1 && (
              <div className="space-y-1.5">
                {faqs.map((faq, i) => (
                  <button key={i} onClick={() => handleFaq(faq)}
                    className="w-full text-left text-xs px-3 py-2 rounded-xl transition-colors"
                    style={{ border: '1px solid rgba(123,58,30,0.2)', color: 'var(--marron)', background: '#fff' }}>
                    {faq.pregunta}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--borde)', background: 'var(--crema)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 text-sm rounded-full px-4 py-2 outline-none"
              style={{ border: '1.5px solid var(--borde-2)', background: '#fff' }}
            />
            <button onClick={handleSend}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0"
              style={{ background: 'var(--marron)' }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-24 z-40 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-200"
        style={{ background: 'var(--marron)' }}
        aria-label="Chatbot"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </>
  );
}
