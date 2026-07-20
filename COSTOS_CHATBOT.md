# Costos del chatbot con IA

Estimado de costo del chatbot (`app/api/chatbot/route.ts`) usando **OpenAI `gpt-4o-mini`**, el modelo más
económico evaluado (ver comparación abajo). Cifras de precio verificadas en julio 2026 vía búsqueda web —
confirma en [platform.openai.com/docs/pricing](https://platform.openai.com/docs/pricing) antes de presupuestar,
ya que los precios de los proveedores de IA cambian con frecuencia.

## Precio del modelo

| | Input (por 1M tokens) | Output (por 1M tokens) |
|---|---|---|
| **gpt-4o-mini** (el que usa el chatbot) | $0.15 | $0.60 |

## Por qué este modelo

Comparado contra otras opciones económicas al momento de decidir:

| Modelo | Proveedor | Input /1M | Output /1M |
|---|---|---|---|
| **gpt-4o-mini** ✅ | OpenAI | $0.15 | $0.60 |
| GPT-5 Mini | OpenAI | $0.25 | $2.00 |
| Claude Haiku 4.5 | Anthropic | $1.00 | $5.00 |
| Claude Opus 4.8 | Anthropic | $5.00 | $25.00 |

`gpt-4o-mini` es ~6-8x más barato que Haiku 4.5 y ~30x más barato que Opus 4.8, con calidad de sobra para
responder preguntas frecuentes de un negocio pequeño.

## Qué entra en cada mensaje (tokens)

Cada request al modelo incluye, en `app/api/chatbot/route.ts`:
- **System prompt fijo** (instrucciones + datos del producto: tamaño, material, tapa, cantidad) — ~225 tokens.
- **FAQ activas** de la tabla `chatbot_faq` (crecen si el admin agrega más desde `/admin/chatbot`) — hoy
  (3 preguntas semilla) ~220 tokens; con ~10 preguntas, ~700 tokens.
- **Historial** — hasta los últimos 6 turnos de la conversación actual (0 al inicio, crece con la charla).
- **Pregunta del usuario** — típicamente 15-30 tokens.
- **Respuesta** — el prompt pide "máximo 3-4 líneas"; tope duro `max_tokens: 400`, pero en la práctica
  ronda 60-150 tokens.

## Estimado de costo por mensaje

| Escenario | Input (tokens) | Output (tokens) | Costo/mensaje | Mensajes por US$1 |
|---|---:|---:|---:|---:|
| **Económico** — sin historial, respuesta corta | ~460 | ~60 | $0.000105 | **~9,500** |
| **Típico** — con algo de historial, respuesta normal | ~585 | ~100 | $0.000148 | **~6,700** |
| **Amplio** — FAQ crecida (~10), historial completo, respuesta larga | ~1,200 | ~300 | $0.000361 | **~2,750** |

**En criollo**: con $1 USD el chatbot responde entre ~2,750 (caso más pesado) y ~9,500 mensajes (caso liviano).
Para un negocio con tráfico bajo/medio (decenas de conversaciones al día), el costo mensual esperado es de
**centavos de dólar**, no dólares.

### Fórmula (para recalcular si cambia el modelo o el uso)

```
costo_por_mensaje = (tokens_input / 1,000,000 × precio_input)
                   + (tokens_output / 1,000,000 × precio_output)

mensajes_por_USD1 = 1 / costo_por_mensaje
```

## Configuración

1. Crear cuenta y método de pago en [platform.openai.com](https://platform.openai.com) (algunos planes piden un
   monto mínimo de recarga prepagada — revisar en su sección de facturación al momento de configurar).
2. Generar una API key en [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
3. Agregar a `.env.local`:
   ```
   OPENAI_API_KEY=sk-...
   ```
4. Reiniciar el servidor (`npm run dev` / redeploy). No requiere ningún cambio de código — el endpoint
   (`app/api/chatbot/route.ts`) ya está implementado y listo; solo lee la variable de entorno.

**Sin la clave configurada**, el chatbot sigue funcionando: cae automáticamente al matching por palabras clave
sobre las FAQ (comportamiento actual, sin IA) — nunca se rompe.

## Cambiar de modelo más adelante

El modelo está en una sola constante en `app/api/chatbot/route.ts`:
```ts
const OPENAI_MODEL = 'gpt-4o-mini';
```
Para subir a un modelo más capaz (ej. `gpt-5-mini`) si la calidad de respuesta no alcanza, basta con cambiar
ese string — el resto del código (contexto de FAQ, fallback, límites) no cambia.
