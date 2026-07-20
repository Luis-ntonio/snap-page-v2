# CODEBASE — Snap Page

Documentación técnica del código. Complementa [AGENTS.md](./AGENTS.md) (reglas para agentes) y
[PLAN.md](./PLAN.md) (trabajo en curso). Este archivo describe **qué hace cada pieza y cómo se conecta**.

> Estado: **Plan F0-F5 completo** (ver `PLAN.md`). Auth real, editor interactivo con slots fijos (plan
> Personalizado), generación de PDF + envío por WhatsApp, panel admin con datos reales (Drive de Storage +
> pedidos), y chatbot con IA — todo con **fallback automático al modo demo** cuando no hay sesión Supabase real.
> Backend conectado y validado end-to-end contra el proyecto `csqzxgppjxnikrngiaqb` (ver §6b).
> `tsc`/`lint`/`build` limpios (0 errores).

---

## 1. Stack y arranque

- **Next.js 16.2.10** (App Router, Turbopack por defecto), **React 19.2.4**, **TypeScript 5** (`strict`).
- **Tailwind v4** vía `@tailwindcss/postcss` (sin `tailwind.config`; utilidades + `app/globals.css`).
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`).
- UI: Radix (dialog/select/tabs/checkbox), `lucide-react`, `jszip`, `file-saver`; `jspdf` (PDF del álbum, F2);
  `openai` (chatbot con IA, F4 — ver [COSTOS_CHATBOT.md](./COSTOS_CHATBOT.md)); `react-dropzone` (drag&drop de
  fotos por slot, F1) y `react-pageflip` (animación de volteo de página en editor/preview, F1).
- Scripts: `npm run dev` · `build` · `start` · `lint` (ESLint CLI; `next lint` no existe en v16).
- Alias imports: `@/*` → raíz (`tsconfig.json` paths).

## 2. Estructura de carpetas

```
app/
  layout.tsx              Root: fuentes Raleway, DemoProvider, Navbar/Footer/WhatsAppFloat/Chatbot/DemoBanner
  page.tsx                Home = Hero + Revistas + Pasos + ComoEnviar + DatosYFaq
  globals.css             Estilos base + clases utilitarias (badges de estado, skeleton, etc.)
  (auth)/                 login · register · forgot-password
  (main)/                 galeria · mi-cuenta · planes · plantillas · plantillas/[categoria]  (+ 🔜 editor/[plantillaId])
  admin/                  layout(guard) · page(pedidos) · carpetas · fotos · chatbot
  api/                    chatbot · notificaciones · pedidos   (route handlers)
  components/
    layout/               Navbar, Footer, WhatsAppFloat, DemoBanner
    ui/                   *Section del home, PlanesSection (editor vivo), visualizers*, modals/
      album/              AlbumPageCanvas.tsx (renderer de página compartido editor/preview)
      AlbumEditor.tsx     Editor interactivo de slots (plan Personalizado)
      AlbumPreview.tsx    Vista previa de solo lectura de la plantilla
    chatbot/              Chatbot.tsx
lib/
  data.ts                 Constantes de negocio (WhatsApp, plantillas, portadas, FAQ, pasos)
  demo.tsx                DemoProvider/useDemo + datos demo (sessionStorage)
  auth.tsx                AuthProvider real (Supabase) — user/role/signIn/signOut
  admin/drive.ts           Helper Drive del admin: clientes→pedidos→archivos (Storage)
  album/                  draftStore.ts (IndexedDB) · pdf.ts (jsPDF) · submit.ts (Storage + pedido)
  plantillas/             Layouts de plantilla del plan Personalizado (parejas/viajes/cumpleanos)
  supabase/               client.ts (browser) · server.ts (SSR) · storage.ts · schema.sql · migrations/
types/index.ts            Modelo de dominio + labels/precios/badges + tipos del editor
```

## 3. Modelo de dominio (`types/index.ts`)

- **Plan** = `'minimal' | 'personalizado' | 'tengo-mi-diseno' | 'premium'`.
- **EstadoPedido** = `pedido-realizado | diseno | produccion | entrega | entregado`.
- **Tematica** = `parejas | cumpleanos | viajes | familia | otro`.
- Interfaces: `Usuario`, `Pedido`, `FotoSubida`, `Plantilla` (incluye `imagenes_interiores: string[]`, hoy vacío),
  `Portada`, `GaleriaItem`, `FaqItem`, `Lote`, `Carpeta`, `ArchivoAdmin`.
- Constantes de presentación: `PLAN_LABELS`, `PLAN_PRICES`, `ESTADO_LABELS`, `ESTADO_BADGE`.
- 🔜 Se agregarán `PlantillaLayout` / `SlotRect` para el editor de slots.

## 4. Datos de negocio (`lib/data.ts`)

- `WHATSAPP`, `EMAIL_ADMIN`, `GOOGLE_CALENDAR`.
- `waLink(msg)` → `https://wa.me/{WHATSAPP}?text=...` (encodeURIComponent).
- `WA_MESSAGES` → mensajes por plan/situación: `minimal`, `personalizado(plantilla, portada)`, `tengoDiseno`,
  `canvaLink(link)`, `premium`, `general`, `pedido(numero)`. 🔜 se añade uno con N° pedido + link de PDF.
- `PLANTILLAS`, `PORTADAS`, `FAQ_DEFAULT`, `CHATBOT_FAQ_DEFAULT`, `DATOS_GENERALES`, `PASOS`.

## 5. Auth y sesión

### Hoy (demo)
- `lib/demo.tsx` — `DemoProvider` guarda un usuario ficticio en **sessionStorage `demo_user`**; `isDemo` siempre `true`.
  `demoLogin(role)` / `demoLogout()`. `DEMO_USER`, `DEMO_ADMIN`, `DEMO_PEDIDOS`, `DEMO_FOTOS`, `DEMO_ADMIN_PEDIDOS`.
- `app/(auth)/login/page.tsx` — **no usa Supabase**: solo `demoLogin` + redirect.
- `app/(auth)/register/page.tsx` — **sí** llama `supabase.auth.signUp({ email, password, options:{ data:{nombre,telefono} }})`.
- `app/(auth)/forgot-password/page.tsx` — **sí** llama `supabase.auth.resetPasswordForEmail`.
- `app/admin/layout.tsx` — guard **client-side** por `demo_user.role==='admin'`.
- Falta `signInWithPassword`, `signOut`, y guards de servidor.

### Destino 🔜
- `lib/auth.tsx` (AuthProvider real), `signInWithPassword` en login (`?next=`), `signOut`, `proxy.ts` (Next 16)
  protegiendo `/admin/**` y `/mi-cuenta`. Rol desde `profiles.role`.

## 6. Clientes Supabase (`lib/supabase/`)

- `client.ts` — `createBrowserClient(URL, ANON_KEY)` para componentes cliente.
- `server.ts` — `createServerClient` con `cookies()` **await** (patrón Async Request APIs de Next 16).
- `schema.sql` — DDL completo (correr en Supabase SQL Editor):
  - Tablas: `profiles` (extiende `auth.users`), `lotes`, `pedidos`, `fotos_subidas`, `galeria`, `faq`,
    `chatbot_faq`, `carpetas_admin`.
  - `pedidos.numero` autogenerado por trigger `generate_pedido_numero` (`SP-` + secuencia desde 1001).
  - `handle_new_user` crea `profiles` tras signup. `update_updated_at` en `pedidos`.
  - RLS: usuarios ven/gestionan lo propio; admin (`profiles.role='admin'`) gestiona todo.
  - **Storage buckets** (crear en el dashboard, documentados en comentarios): `fotos-clientes` (privado),
    `archivos-admin` (privado), `galeria` (público), `assets` (público).
  - Nota: el tipo TS `ArchivoAdmin` no tiene tabla en SQL (se listará Storage directo en el MVP).
- `migrations/002_editor_storage.sql` — `pedidos.pdf_path`/`layout` + bucket `fotos-clientes` + policies.
- `migrations/003_fix_new_user_trigger.sql` — fix: `handle_new_user()` calificaba mal el schema (`public.profiles`).
- `migrations/004_fix_admin_rls_recursion.sql` — fix: función `is_admin()` `SECURITY DEFINER` para romper la
  recursión infinita de las políticas "admin" que consultaban `profiles` sobre sí misma.

## 6b. Conexión Supabase real (CLI)

Proyecto vinculado: `csqzxgppjxnikrngiaqb` (región `ca-central-1`). Flujo usado:
```
npx supabase login --token $SUPABASE_ACCESS_TOKEN   # o `supabase login` interactivo (abre navegador)
npx supabase init                                     # crea supabase/config.toml (versionado)
npx supabase link --project-ref csqzxgppjxnikrngiaqb
npx supabase db query --linked -f lib/supabase/schema.sql
npx supabase db query --linked -f lib/supabase/migrations/002_editor_storage.sql
npx supabase db query --linked -f lib/supabase/migrations/003_fix_new_user_trigger.sql
npx supabase db query --linked -f lib/supabase/migrations/004_fix_admin_rls_recursion.sql
```
`SUPABASE_ACCESS_TOKEN` (Personal Access Token, `sbp_...`, distinto de las claves de la app) va en `.env.local`
y **solo lo usa el CLI**, nunca la aplicación en runtime. `supabase/.temp/` (puede contener cadenas de conexión)
está en `.gitignore`.

Validado end-to-end contra la base real (ver detalle en `PLAN.md`): auth completo (signup → trigger `profiles`
→ login), Storage con RLS (sube a la carpeta propia, bloquea la ajena), `pedidos` con `numero` autogenerado,
`fotos_subidas`, RLS de admin, y `createSignedUrl`. 10/10 checks correctos tras los fixes 003 y 004.

## 7. Endpoints (`app/api/`)

- **`pedidos/route.ts`** (`POST`) — valida sesión con `auth.getUser()` (401 si no), busca lote activo, inserta en
  `pedidos` (`numero:''` → lo pone el trigger), y dispara `POST /api/notificaciones` fire-and-forget.
  **Hoy la UI no lo llama.** 🔜 aceptará `layout` + `pdf_path` y creará filas en `fotos_subidas`.
- **`notificaciones/route.ts`** (`POST`) — usa **service-role key**; trae el pedido con join a `profiles`, arma
  email y lo envía por **Resend** si hay `RESEND_API_KEY`; marca `nota_admin`. `GET` = health check.
- **`chatbot/route.ts`** (`GET`) — lee `chatbot_faq` activas de Supabase (service-role o anon). 🔜 se añade `POST` con IA.

## 8. Flujo de compra y editor (estado actual)

- **`app/components/ui/PlanesSection.tsx`** es la implementación viva (renderizada por `/planes`). Grid 2×2 de planes:
  - `personalizado` → `<Link href="/plantillas">`.
  - `minimal` → modal: subir fotos → visor con **1 foto = 1 página** (spreads calculados a mano, thumbnails, nav).
  - `tengo-mi-diseno` → modal: subir PDF → visor en `<iframe>`.
  - `premium` → abre Google Calendar.
  - Primitivas reutilizables: `Overlay`, `Full`, `Btn`, `BtnOut`. Modelo de spreads en líneas ~49-72.
- **`plantillas/page.tsx`** — grid de categorías (parejas/cumpleaños/viajes) → **`plantillas/[categoria]/page.tsx`**
  (tabs Plantilla/Portada; muestra preview + grilla decorativa de 20 páginas + selección de portada; termina en `wa.me`).
- **Huérfanos** (no se importan): `MinimalVisualizer.tsx`, `TengoDisanoVisualizer.tsx`, `modals/MinimalModal.tsx`,
  `modals/TengoDisanoModal.tsx`. Candidatos a borrar.
- Todas las salidas a WhatsApp usan `waLink()` + `WA_MESSAGES`; **no se crea pedido** hoy.

### Editor interactivo (solo Personalizado) — IMPLEMENTADO (motor)
- **`app/components/ui/album/AlbumPageCanvas.tsx`** — renderer de página **compartido**: fondo (color + patrón
  `hearts`/polaroid) con **slots fijos** posicionados en fracciones 0-1. Prop `editable` conmuta entre modo edición
  (picker de foto vía click, **drag&drop de imagen con `react-dropzone`** — `useDropzone({noClick,noKeyboard})`
  por slot, botón quitar, textarea) y modo **vista previa de solo lectura** (números visibles, sin interacción).
- **`app/(main)/editor/[plantillaId]/page.tsx`** + **`app/components/ui/AlbumEditor.tsx`** (usa el canvas con
  `editable`): el cliente asigna fotos por slot (click o arrastrar) y edita los textos (`preset` fijo vs
  `editable`). Todas las páginas se montan dentro de un **`HTMLFlipBook`** (`react-pageflip`) para la animación
  de volteo; navegación por los botones prev/next y puntos existentes, que llaman a `ref.pageFlip().flip(n)` —
  el flip **no** se dispara por gestos de mouse/touch (`useMouseEvents={false}`, `disableFlipByClick`) para no
  chocar con el click-to-pick ni el drag&drop. El book se envuelve en un `div` de `maxWidth` fijo con un
  `minWidth` del book > mitad de ese máximo, para forzar **siempre vista de una sola página** (evita el modo
  "spread" de 2 páginas de `react-pageflip` en pantallas anchas — ver comentario en el código).
  Incluye un **selector de portada** (de `PORTADAS` filtrado por categoría) que persiste en el draft, se antepone
  como cubierta al PDF y se manda como `portada_id` del pedido.
- **`app/components/ui/AlbumPreview.tsx`** (usa el canvas con `editable={false}`), montado en
  `plantillas/[categoria]/page.tsx`: deja **ver la plantilla completa navegando sus páginas sin subir nada**
  (mismo patrón de `HTMLFlipBook` de una sola página, aquí con gestos de mouse/corner-drag habilitados ya que
  no hay edición que proteger); el CTA "✨ Personalizar con mis fotos" abre `/editor/[categoria]`.
- **`types/index.ts`**: `PlantillaLayout` (pages[] con `slots`+`texts`), `PhotoSlot`, `TextSlot`, `AlbumDraft`
  (incluye `portadaId`).
- **`lib/plantillas/{parejas,cumpleanos,viajes}.ts`**: las 3 plantillas del plan Personalizado, transcritas de
  sus PDFs (`parejas` 13 págs/39 fotos, `cumpleanos` 11 págs/24 fotos, `viajes` 13 págs/58 fotos con collages
  polaroid y grillas 3x3). `lib/plantillas/index.ts`: registro `getPlantillaLayout(id)`.
- **`lib/album/draftStore.ts`**: persistencia del borrador en **IndexedDB** (Blobs de fotos + textos + portada
  elegida). El editor autoguarda en cada cambio y rehidrata al montar → sobrevive recarga y el paso por
  `/register`. Verificado.
- Entrada: botón "✨ Personalizar online" en `plantillas/[categoria]` → `/editor/[categoria]`.

### Generar PDF + enviar a WhatsApp — IMPLEMENTADO
- **`lib/album/pdf.ts`** — `composeAlbumPdf(layout, photos, texts, onProgress?, portada?)`: dibuja cada página en
  un `<canvas>` del tamaño exacto de página que usa jsPDF (mapeo 1:1 de las coordenadas fraccionales 0-1), con
  fotos recortadas `object-fit:cover` (+ rotación para polaroids), fondos/patrón de corazones, y textos con
  alineación y saltos de línea. Si se pasa `portada` (`{imagen, nombre}`), antepone una **página de cubierta**
  (imagen a sangre + nombre del álbum superpuesto). Ensambla un PDF A4 con **jsPDF**. `downloadBlob()` para el
  fallback de descarga local.
- **`lib/album/submit.ts`** — `submitAlbumOrder()`: sube cada foto y el PDF a Storage
  (`fotos-clientes/{usuario}/{pedido}/...`, `lib/supabase/storage.ts`), luego `POST /api/pedidos` con un `id`
  generado en cliente (para que coincida con la carpeta ya subida) + `layout`/`pdf_path`/`fotos[]`, y devuelve
  `{ numero, pdfUrl }` (URL firmada, 7 días) para el mensaje de WhatsApp.
- **`AlbumEditor.tsx`** botón "Enviar a WhatsApp": exige sesión (gate `?next=`); siempre compone el PDF; **solo
  intenta `submitAlbumOrder` si hay sesión Supabase real** (`useAuth().user`, no el usuario demo — su id no es un
  `auth.uid()` válido); si no hay sesión real o la subida falla, **degrada a descarga local del PDF** + mensaje
  de WhatsApp genérico del plan Personalizado. Siempre limpia el draft (`clearDraft`) al finalizar.
- `app/api/pedidos/route.ts` acepta `id`, `pdf_path`, `layout`, `fotos[]` e inserta las filas `fotos_subidas`
  correspondientes (además del insert de `pedidos` que ya existía).
- Verificado en navegador (sin Supabase real): el flujo completo compone un PDF de 13 páginas correcto
  (título, slots numerados, fondos/patrones) y lo descarga; la rama de Storage/pedido real queda pendiente de
  probar cuando haya un proyecto Supabase conectado (correr `migrations/002_editor_storage.sql` y crear el
  bucket `fotos-clientes` primero).

## 9. Panel admin (`app/admin/`) — IMPLEMENTADO con datos reales (+ fallback demo)

Todas las páginas siguen el mismo patrón: `if (useAuth().user)` → datos reales de Supabase; si no hay sesión
real (o Supabase no está configurado), cae al comportamiento demo original (sin romperlo).

- `layout.tsx` — guard: `isAdmin` real o `demoUser.role==='admin'`. Header muestra el lote activo real
  (`lotes` where `activo=true`) cuando hay sesión.
- `page.tsx` — tabla de pedidos real (`pedidos` join `profiles(nombre)` + `lotes(nombre)`); `estado`,
  `responsable`, `nota_admin` persisten con `.update()`. Sin sesión real: `DEMO_ADMIN_PEDIDOS`, edición local.
- **`lib/admin/drive.ts`** — helper compartido: `listClientesConPedidos(supabase)` agrupa `pedidos` por
  `usuario_id` (con nombre vía `profiles`); `listPedidoFilesConUrl(usuarioId, pedidoId, supabase)` lista los
  archivos de Storage de un pedido con URL firmada + flag `isImage`.
- `carpetas/page.tsx` — Drive real de 3 niveles: cliente → pedido → archivos (fotos + `album.pdf`), descarga
  individual o ZIP (JSZip), lightbox para imágenes. `fotos/page.tsx` — mismo drill-down pero filtrado a imágenes.
  Ambas caen al demo original (carpetas hardcodeadas) sin sesión real.
- `chatbot/page.tsx` — CRUD de `chatbot_faq` desde el browser client (ya usaba Supabase desde antes).

Validado con un script Node contra la base real: joins anidados, agrupación Drive, RLS admin (lee/firma
archivos de cualquier usuario) y RLS cliente (solo ve lo suyo). UI verificada en navegador en modo demo
(`admin`, `admin/carpetas` con drill-down, `admin/fotos`, `mi-cuenta`), sin errores de consola; falta repetir
el mismo smoke visual logueado con un usuario Supabase real cuando se tenga uno de prueba a mano.

## 10. Cuenta de cliente (`app/(main)/mi-cuenta/page.tsx`) — IMPLEMENTADO con datos reales (+ fallback demo)

- Con sesión Supabase real: `pedidos` y `fotos_subidas` propios (`usuario_id = auth.uid()`, con URL firmada);
  subir foto sube de verdad a Storage (`uploadFoto`) + inserta en `fotos_subidas`; eliminar borra de Storage y
  la fila; renombrar actualiza la fila; "Mis datos" persiste `nombre`/`telefono` en `profiles`.
- Sin sesión real: cae a `DEMO_PEDIDOS`/`DEMO_FOTOS`, subida = blob local (`URL.createObjectURL`,
  `storage_path:''`), igual que antes.
- Descarga ZIP con JSZip + file-saver (`handleDownloadZip`) — funciona igual en ambos modos (`fetch(foto.url)`,
  sea blob: local o URL firmada real).

## 11. Chatbot (`app/components/chatbot/Chatbot.tsx`) — IA con fallback a keywords

- Widget flotante. Carga FAQ desde `GET /api/chatbot` (fallback `CHATBOT_FAQ_DEFAULT`). Quick-replies = Q→A exacta,
  sin cambios.
- **Texto libre**: `handleSend` llama a `POST /api/chatbot` con `{ message, history }`. El servidor
  (`app/api/chatbot/route.ts`) arma un system prompt con las `chatbot_faq` activas de Supabase +
  `DATOS_GENERALES` como contexto y llama a **OpenAI `gpt-4o-mini`** (SDK `openai`, `max_tokens: 400`,
  últimos 6 turnos de historial). Responde `{ reply, source: 'ai' }`. Modelo elegido por costo — el más barato
  evaluado (ver [COSTOS_CHATBOT.md](./COSTOS_CHATBOT.md) para el comparativo y el estimado de mensajes por USD).
- **Fallback**: si falta `OPENAI_API_KEY`, la llamada al modelo falla, o el fetch del cliente falla, el
  servidor devuelve `{ reply: null, source: 'fallback' }` y el cliente usa el **matching original por
  substring/segunda palabra** — el chat nunca se rompe, con o sin IA configurada.

## 12. Variables de entorno

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo server),
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_EMAIL_ADMIN`, `RESEND_API_KEY` (opcional),
`OPENAI_API_KEY` (chatbot IA, `gpt-4o-mini` — opcional, sin ella cae a keyword matching), `SUPABASE_ACCESS_TOKEN`
(solo CLI, nunca en runtime), `ENFORCE_AUTH` (activa el guard real de `proxy.ts`, `false` por defecto).
Ver `.env.example`.

## 13. Estado frente a Next 16

Repo limpio de deprecaciones: Turbopack por defecto, `images.remotePatterns`, `cookies()` awaited, ESLint flat
config, sin `middleware`/AMP/`next lint`/`runtimeConfig`. `tsc --noEmit` y `npm run lint` pasan sin errores
(solo warnings intencionales: `<img>` para blobs/Storage dinámico, deps de hooks estables como `router`).

## 14. Convenciones

1. Leer `node_modules/next/dist/docs/` antes de usar APIs de Next (esta versión difiere del conocimiento previo).
2. Dominio en **español**; usar los tipos de `types/index.ts` y las constantes de `lib/data.ts`.
3. Server-only usa `lib/supabase/server.ts`; browser usa `client.ts`. La service-role key nunca cruza al cliente.
4. Respetar el estilo del archivo que se edita (inline styles en el home/editor vs Tailwind en el resto).
5. **Patrón de degradación con gracia**: cualquier feature que dependa de Supabase/Anthropic real revisa
   `useAuth().user` (o la env var correspondiente) y cae a datos demo / keyword matching si no hay sesión o
   clave real — así el modo demo nunca se rompe mientras se conecta el backend real. Seguir este patrón en
   features nuevas.
6. Verificar con `npx tsc --noEmit` y `npm run lint` antes de cerrar un cambio.
