'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, Check, X, GripVertical } from 'lucide-react';

interface FaqItem { id: string; pregunta: string; respuesta: string; orden: number; }

export default function AdminChatbotPage() {
  const supabase = createClient();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [editP, setEditP] = useState('');
  const [editR, setEditR] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('chatbot_faq').select('*').order('orden');
    setFaqs((data ?? []) as FaqItem[]);
    setLoading(false);
  };

  useEffect(() => { Promise.resolve().then(() => { load(); }); }, []);

  const startEdit = (faq: FaqItem) => {
    setEditingId(faq.id);
    setEditP(faq.pregunta);
    setEditR(faq.respuesta);
  };

  const startNew = () => {
    setEditingId('new');
    setEditP('');
    setEditR('');
  };

  const save = async () => {
    setSaving(true);
    if (editingId === 'new') {
      const { data } = await supabase.from('chatbot_faq')
        .insert({ pregunta: editP, respuesta: editR, orden: faqs.length + 1 })
        .select().single();
      if (data) setFaqs(prev => [...prev, data as FaqItem]);
    } else {
      await supabase.from('chatbot_faq').update({ pregunta: editP, respuesta: editR }).eq('id', editingId);
      setFaqs(prev => prev.map(f => f.id === editingId ? { ...f, pregunta: editP, respuesta: editR } : f));
    }
    setEditingId(null);
    setSaving(false);
  };

  const deleteFaq = async (id: string) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    await supabase.from('chatbot_faq').delete().eq('id', id);
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-semibold text-lg text-[var(--tinta)]" style={{ fontFamily: 'var(--font-display)' }}>Chatbot · Preguntas frecuentes</h2>
          <p className="text-sm text-[var(--texto-3)] mt-0.5">Las respuestas del chatbot se editan aquí en tiempo real</p>
        </div>
        <button onClick={startNew} className="btn-primary" style={{ background: 'var(--marron)', padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Agregar
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {/* New item form */}
          {editingId === 'new' && (
            <EditForm p={editP} r={editR} onP={setEditP} onR={setEditR}
              onSave={save} onCancel={() => setEditingId(null)} saving={saving} isNew />
          )}

          {faqs.map(faq => (
            <div key={faq.id} className="bg-white border border-[var(--borde)] rounded-2xl p-4">
              {editingId === faq.id ? (
                <EditForm p={editP} r={editR} onP={setEditP} onR={setEditR}
                  onSave={save} onCancel={() => setEditingId(null)} saving={saving} />
              ) : (
                <div className="flex gap-3">
                  <GripVertical size={16} className="text-[var(--borde-2)] mt-0.5 flex-shrink-0 cursor-grab" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--tinta)] mb-1">{faq.pregunta}</p>
                    <p className="text-sm text-[var(--texto-2)] leading-relaxed">{faq.respuesta}</p>
                  </div>
                  <div className="flex items-start gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(faq)}
                      className="p-1.5 text-[var(--texto-3)] hover:text-[var(--marron)] transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteFaq(faq.id)}
                      className="p-1.5 text-[var(--texto-3)] hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {faqs.length === 0 && editingId !== 'new' && (
            <p className="text-center text-sm text-[var(--texto-3)] py-8">
              No hay preguntas. Agrega la primera.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function EditForm({ p, r, onP, onR, onSave, onCancel, saving, isNew }: {
  p: string; r: string; onP: (v: string) => void; onR: (v: string) => void;
  onSave: () => void; onCancel: () => void; saving: boolean; isNew?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl p-4 space-y-3 ${isNew ? 'border-2' : 'border border-[var(--borde)]'}`} style={isNew ? { borderColor: 'rgba(123,58,30,0.2)' } : undefined}>
      <input value={p} onChange={e => onP(e.target.value)} placeholder="Pregunta"
        className="w-full border border-[var(--borde-2)] rounded-xl px-3 py-2.5 text-sm outline-none" />
      <textarea value={r} onChange={e => onR(e.target.value)} placeholder="Respuesta" rows={3}
        className="w-full border border-[var(--borde-2)] rounded-xl px-3 py-2.5 text-sm outline-none resize-none" />
      <div className="flex gap-2">
        <button onClick={onSave} disabled={!p || !r || saving} className="btn-primary" style={{ background: 'var(--marron)', padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: (!p || !r || saving) ? 0.5 : 1 }}>
          <Check size={13} /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button onClick={onCancel} className="btn-outline" style={{ padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <X size={13} /> Cancelar
        </button>
      </div>
    </div>
  );
}
