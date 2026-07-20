<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Snap Page — Project Knowledge

Landing + e-commerce ligero para **Snap Page**, un negocio peruano de fotolibros/photobooks personalizados (Lima, Perú). El sitio muestra planes, plantillas, una galería, y un flujo de pedido que hoy termina en WhatsApp. Incluye un **panel admin** (pedidos, fotos, carpetas, chatbot FAQ) y una **"Mi cuenta"** para clientes.

Idioma del producto y del código de dominio: **español** (rutas, variables de negocio, copys). Manténlo así.

## Stack

| Pieza | Versión / nota |
|---|---|
| Next.js | **16.2.10** — App Router, Turbopack por defecto (dev y build) |
| React | 19.2.4 |
| TypeScript | 5, `strict: true` |
| Tailwind | **v4** (vía `@tailwindcss/postcss`, sin `tailwind.config`) |
| Supabase | `@supabase/ssr` + `@supabase/supabase-js` |
| UI libs | Radix (checkbox, dialog, select, tabs), lucide-react, react-dropzone, react-pageflip, jszip, file-saver |

Scripts: `npm run dev`, `build`, `start`, `lint` (ESLint CLI directo — `next lint` fue removido en v16).

## Estructura

```
app/
  layout.tsx              Root: fuentes Raleway (Google), DemoProvider, Navbar/Footer/WhatsApp/Chatbot
  page.tsx                Home = Hero + Revistas + Pasos + ComoEnviar + DatosYFaq
  (auth)/                 login · register · forgot-password  → HOY solo demo, no Supabase auth
  (main)/                 galeria · mi-cuenta · planes · plantillas · plantillas/[categoria]
  admin/                  layout(guard) · page · carpetas · chatbot · fotos
  api/                    chatbot · notificaciones · pedidos   (route handlers)
  components/
    layout/               Navbar, Footer, WhatsAppFloat, DemoBanner
    ui/                   *Section del home + visualizers + modals/
    chatbot/              Chatbot.tsx
lib/
  data.ts                 Constantes de negocio: WHATSAPP, waLink(), WA_MESSAGES, PLANTILLAS, PORTADAS, FAQ, PASOS
  demo.tsx                DemoProvider/useDemo + DEMO_USER/ADMIN/PEDIDOS/FOTOS (sessionStorage)
  supabase/client.ts      createBrowserClient (browser)
  supabase/server.ts      createServerClient con cookies() async  ← patrón correcto v16
types/index.ts            Modelo de dominio + labels/precios/badges (@/types)
```

Alias de imports: `@/*` → raíz del proyecto (tsconfig `paths`).

## Arquitectura y decisiones clave (leer antes de tocar)

- **Modo Demo es el estado actual de facto.** `DemoProvider` fija `isDemo: true` siempre y guarda el usuario en `sessionStorage`. El **login NO usa Supabase auth**: `login()` solo llama `demoLogin(role)` y redirige. `mi-cuenta`, `admin`, etc. se pintan con `DEMO_*` de `lib/demo.tsx`, no con datos reales.
- **Existe una segunda ruta de datos real, desconectada de la UI.** Los route handlers `api/pedidos` y `api/notificaciones` sí hablan con Supabase real (insert de pedidos, email vía Resend, service-role key). Hoy la UI demo no los consume. Cualquier trabajo de "producción real" implica **cablear auth Supabase + reemplazar datos demo**, sin romper el modo demo si se quiere conservar.
- **El pedido termina en WhatsApp.** `waLink()` + `WA_MESSAGES` en `lib/data.ts` construyen enlaces `wa.me`. El número y el email admin viven ahí y también en env vars (`NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_EMAIL_ADMIN`) — mantener sincronizados.
- **Estilos mezclados:** el home y `plantillas/[categoria]` usan **inline styles** (paleta marrón `#7B3A1E` / `#8B4513`); el resto usa **Tailwind**. No unifiques a ciegas.
- **Imágenes con `<img>` + `onError` fallback** (picsum en demo, `/images/...` locales, Supabase Storage). No son `next/image`.

## Variables de entorno

Referenciadas en el código (`.env.local`, git-ignored):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — cliente + servidor
- `SUPABASE_SERVICE_ROLE_KEY` — **solo** en `api/notificaciones` y `api/chatbot` (server). Nunca exponer al cliente.
- `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_EMAIL_ADMIN`
- `RESEND_API_KEY` — email de notificación de pedido (opcional; si falta, se omite el envío)

No hay `.env.example` (candidato a crear).

## Estado frente a Next 16 (auditado)

El repo está **limpio** en deprecaciones de v16, no arrastra deuda de migración:

- ✅ Turbopack por defecto; scripts sin `--turbopack`.
- ✅ `images.remotePatterns` (no el deprecado `images.domains`).
- ✅ `cookies()` se hace `await` en `lib/supabase/server.ts` (Async Request APIs).
- ✅ ESLint flat config (`eslint.config.mjs`).
- ✅ Sin `middleware` (nada que migrar a `proxy`), sin AMP, sin `next lint`, sin `serverRuntimeConfig`.
- ✅ `tsc --noEmit` pasa sin errores.

## Deuda / mejoras conocidas (no bloqueantes)

- `next.config.ts`: `experimental.serverActions.allowedOrigins: ['localhost:3000']` — **config muerta**, no existe ninguna Server Action (`grep "use server"` = 0) y el `localhost` hardcodeado rompería prod si se añadieran. Eliminable.
- ESLint arroja errores/warnings reales que ya NO fallan el build en v16 (el build dejó de lintar): tipos `any` (`mi-cuenta`, `admin/page`, `api/notificaciones`), `setState` sincrónico en `useEffect` (`admin/chatbot`), y varios `no-unused-vars`. Correr `npm run lint` antes de dar por cerrado un cambio.
- `<img>` → `next/image` es una mejora de LCP/ancho de banda, pero **no es trivial**: hay `onError`, `sizes` y estilos inline. Requiere revisar caso por caso.
- `README.md` es el boilerplate de `create-next-app` (sin valor). `alert`/`confirm` bloqueantes en `admin/chatbot`.

## Convenciones al escribir código aquí

1. **Lee `node_modules/next/dist/docs/` antes de usar APIs de Next** — esta versión difiere de tu memoria.
2. Dominio en **español**; sigue los tipos de `types/index.ts` (`Plan`, `EstadoPedido`, `Tematica`, `Pedido`, etc.) y los labels/precios/badges ya definidos.
3. Constantes de negocio (WhatsApp, plantillas, FAQ, pasos) van en `lib/data.ts`, no hardcodeadas en componentes.
4. Server-only usa `lib/supabase/server.ts`; browser usa `lib/supabase/client.ts`. La service-role key jamás cruza al cliente.
5. Respeta el estilo del archivo que edites (inline styles vs Tailwind) en vez de reescribir todo.
6. Verifica con `npx tsc --noEmit` y `npm run lint` antes de cerrar.
