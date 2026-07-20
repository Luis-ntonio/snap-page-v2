# PLAN — Snap Page: editor interactivo, PDF a WhatsApp, admin Drive, chatbot IA

> Plan de trabajo con checklist. Se actualiza a medida que se implementa. Pensado para continuar entre sesiones.
> Documentación del código: ver [CODEBASE.md](./CODEBASE.md). Conocimiento para agentes: ver [AGENTS.md](./AGENTS.md).

## Objetivo

Llevar el sitio (hoy 100% en datos demo en memoria) a producción real con 3 capacidades nuevas:

1. **Editor de álbum interactivo sin login** (plan **Personalizado**): páginas navegables, fotos en posiciones
   fijas de plantilla. Si el usuario se registra a mitad de edición, su álbum se conserva.
2. **Enviar el álbum como PDF vía WhatsApp** (link, porque `wa.me` no adjunta archivos).
3. **Admin**: vista tipo Drive (carpeta usuario → subcarpeta álbum → imágenes) + gestión de pedidos donde cada
   flujo finalizado registra una fila en `pedidos`.

Más un **chatbot con IA** (LLM vía route de Next, FAQ de Supabase como contexto).

> **Estado: F0-F5 completas + opcionales de F1 implementados.** Las 3 capacidades + el chatbot están
> implementados, con Supabase real conectado y validado, y `tsc`/`lint`/`build` limpios. La verificación visual
> en navegador (bloqueada en la sesión anterior por desconexión de la extensión) ya se hizo para el editor
> (portada/flip/drag&drop) y para F3 (admin en modo demo) — ver el detalle en cada fase. Pendiente real del
> usuario: `OPENAI_API_KEY` para activar el chatbot con IA (ver [COSTOS_CHATBOT.md](./COSTOS_CHATBOT.md)); el
> código ya asume que esa conexión existirá.

## Decisiones fijadas

| Tema | Decisión |
|---|---|
| Entrega PDF | Generar en navegador → subir a Supabase Storage → **link firmado** en el mensaje de WhatsApp. Admin lo ve en su panel. |
| Identidad/pedido | **Auth real Supabase**. Editar es anónimo; al "Enviar a WhatsApp" se pide login/registro y el álbum se conserva; el pedido se crea con `usuario_id` real. |
| Modelo plantilla | Página = **imagen de fondo + JSON de slots fijos**. Tap slot → asignar foto (clip). **Solo plan Personalizado.** |
| Alcance editor | Slots = solo **Personalizado**. Minimal (1 foto/página), Tengo mi diseño (sube PDF) y Premium (videollamada) conservan su flujo. |
| Plantillas fuente | PDFs en `./plantillas` (planos), formato `.pdf`. La categoría se identifica por archivo. |
| Chatbot | **IA vía API route de Next** (Claude) + FAQ de `chatbot_faq` como contexto; fallback a keywords. Sin GCP. |

## Arquitectura (resumen)

- **Draft del editor** → **IndexedDB** (`lib/album/draftStore.ts`): sobrevive recarga y navegación a `/register`.
- **Storage** bucket `fotos-clientes` (privado), ruta `{usuario_id}/{pedido_id}/{archivo}` = jerarquía Drive.
- **PDF**: composición en `<canvas>` (fondo + fotos según slots) → `jspdf`/`pdf-lib` → `Blob` → Storage → URL firmada.
- **Auth**: `AuthProvider` (`@supabase/ssr`) + `signInWithPassword`/`signOut`; guard con `proxy.ts` (Next 16).
- **Pedido**: `POST /api/pedidos` (ya existe) — se le añade `layout` + `pdf_path` + inserción de `fotos_subidas`.

## Checklist por fases

### F0 · Fundaciones: auth real + Storage ✅ (implementado, pendiente de verificar con Supabase real)
- [x] `lib/supabase/storage.ts` — `uploadFoto`, `uploadPdf`, `signedUrl`, `listPedidoFiles`.
- [x] `lib/auth.tsx` — AuthProvider real (`user`, `role`, `signIn`, `signOut`, `loading`). Wired en `app/layout.tsx`.
- [x] `app/(auth)/login/page.tsx` — form email+password → `signInWithPassword`; lee `?next=`; conserva acceso demo.
- [x] `signOut` real en `Navbar` (sesión efectiva = real ?? demo) / `DemoBanner`.
- [x] `proxy.ts` — refresca cookies de sesión; protege `/admin` (rol) y `/mi-cuenta` **solo si `ENFORCE_AUTH=true`**
      (así el modo demo sigue funcionando durante la migración). Registrado en el build.
- [x] `lib/supabase/migrations/002_editor_storage.sql` — `pedidos.pdf_path`, `pedidos.layout`, bucket + policies Storage.
- [x] `.env.example` — todas las claves (+ `ENFORCE_AUTH`). `.gitignore` ajustado para permitirlo.

> Verificación pendiente: requiere un proyecto Supabase real con usuarios + correr la migración 002 y crear el bucket.
> El build (`next build`) pasa y el modo demo sigue intacto.

### F1 · Editor interactivo de slots (SOLO Personalizado) — motor verificado ✅
- [x] Tipos `PlantillaLayout` / `SlotRect` / `PhotoSlot` / `TextSlot` / `AlbumDraft` en `types/index.ts`.
- [x] `lib/plantillas/parejas.ts` — layout real transcrito del PDF (13 páginas, 39 slots, textos, fondos rojo/corazones/polaroid) + `lib/plantillas/index.ts` (registro).
- [x] `app/(main)/editor/[plantillaId]/page.tsx` + `app/components/ui/AlbumEditor.tsx`.
- [x] Navegación de páginas (prev/next + puntos), slots fijos con posiciones por página.
- [x] Asignación de fotos por slot (click/picker) + quitar; textos editables (preset vs editable).
- [x] Verificado en navegador: layouts variados renderizan, navegación OK, **draft persiste en IndexedDB tras recarga**.
- [x] `lib/plantillas/cumpleanos.ts` (24 fotos, 11 páginas, dedicatorias por familiar) y
      `lib/plantillas/viajes.ts` (58 fotos, 13 páginas, incluye collages polaroid y grillas 3x3
      generadas con `Array.from`) — las 3 categorías del plan Personalizado están completas y registradas.
      Verificado: slots 1..N sin huecos/duplicados en las 3 plantillas + smoke test en navegador de `viajes`.
- [x] **Animación de volteo con `react-pageflip`** — `AlbumEditor.tsx`/`AlbumPreview.tsx` renderizan todas las
      páginas dentro de un `HTMLFlipBook` (antes solo se montaba la página actual). El flip se dispara **solo**
      por los botones/puntos existentes vía `ref.pageFlip().flip(n)` — no por gestos de mouse/touch en el editor
      (`useMouseEvents={false}`, `disableFlipByClick`), para no interferir con el click-to-pick ni el drag&drop de
      fotos; en la preview de solo lectura sí se permite gesto/corner-drag (`useMouseEvents`, `showPageCorners`).
      **Importante**: `size="stretch"` de `react-pageflip` muestra un *spread* de 2 páginas si el contenedor mide
      ≥ `minWidth*2`; se fuerza vista de **una sola página siempre** envolviendo el book en un `div` con
      `maxWidth` fijo (380 editor / 360 preview) y usando un `minWidth` del book mayor a la mitad de ese máximo
      (260) — ver comentario en el código. Verificado en navegador (editor y preview, viewport ancho y angosto).
- [x] **Drag&drop de fotos con `react-dropzone`** — `AlbumPageCanvas.tsx` (`Slot`) usa `useDropzone` por slot
      (`noClick`/`noKeyboard`, `disabled={!editable}`) para aceptar soltar una imagen directamente sobre el
      recuadro, además del click-to-pick que ya existía (ambos caminos llaman a `setPhotoBlob`). Instrucción de
      UI actualizada: "Toca o arrastra tu foto a cada recuadro".
- [x] **Selección de portada integrada al editor** — `AlbumEditor.tsx` muestra un selector horizontal con las
      `PORTADAS` de `lib/data.ts` filtradas por `layout.categoria` (o ninguna si la categoría no tiene portadas
      registradas). La elección se persiste en el draft de IndexedDB (`AlbumDraft.portadaId`), se antepone como
      **página de cubierta** en el PDF (`composeAlbumPdf(..., portada)` en `lib/album/pdf.ts`, dibuja la imagen +
      nombre del álbum) y se envía como `portada_id` a `POST /api/pedidos` (`submitAlbumOrder`, que ya aceptaba
      ese campo). El mensaje de WhatsApp usa el nombre real de la portada en vez de `'a definir'`.
      Verificado en navegador: selección con check visual, persiste tras recargar.

> Fidelidad: las 3 plantillas capturan las posiciones/estructura reales de cada PDF con variedad visual
> (grillas, fotos grandes, polaroids, fondos de color) pero no son una réplica pixel-perfect del arte original.

> Nota: el modelo actual dibuja fondos aproximados (color + patrón) en vez de reproducir píxel-a-píxel el arte del PDF.
> Fiel en estructura/posiciones; los detalles decorativos finos se pueden refinar.

- [x] **Vista previa de solo lectura** en `/plantillas/[categoria]`: se extrajo el renderer de página a
      `app/components/ui/album/AlbumPageCanvas.tsx` (compartido entre editor y preview, prop `editable`).
      `AlbumPreview.tsx` navega las páginas de la plantilla (sin subir fotos) y su CTA
      "✨ Personalizar con mis fotos" abre `/editor/[categoria]`. Verificado en navegador.

### F2 · Draft + PDF + WhatsApp + pedido ✅ (implementado y verificado en navegador)
- [x] `lib/album/draftStore.ts` (IndexedDB) + autoguardado + rehidratación al entrar (ya cubierto en F1).
- [x] `lib/album/pdf.ts` — compone cada página en `<canvas>` (fondo, fotos con object-fit:cover + rotación de
      polaroids, textos con alineación/salto de línea) y ensambla un PDF A4 con **jspdf**. `downloadBlob()` para
      el fallback local.
- [x] `lib/album/submit.ts` — `submitAlbumOrder()`: sube fotos + PDF a Storage (`{usuario}/{pedido}/...`),
      registra el pedido vía `POST /api/pedidos` (con `id` generado en cliente para que coincida con la carpeta
      ya subida) y devuelve `{ numero, pdfUrl }` (URL firmada 7 días).
- [x] `AlbumEditor.tsx` — botón "Enviar a WhatsApp": gate de login (`?next=/editor/[id]`) si no hay sesión;
      genera el PDF siempre; si hay **sesión Supabase real** (`useAuth().user`, no demo) intenta
      `submitAlbumOrder` y usa el mensaje con N° de pedido + link; si falla o no hay sesión real, **degrada a
      descarga local del PDF** + mensaje de WhatsApp genérico. `clearDraft()` al final. Estado `sending`/`sendError`.
- [x] `lib/data.ts` — `WA_MESSAGES.pedidoPersonalizado(numero, pdfUrl)`.
- [x] `app/api/pedidos/route.ts` — acepta `id` (explícito, generado en cliente), `pdf_path`, `layout`, `fotos[]`;
      inserta el pedido y las filas `fotos_subidas` correspondientes (de paso, se tipó `pedido.id` sin `any`).

> **Verificado en navegador (sin Supabase real conectado)**: login demo → editor → "Enviar a WhatsApp" → compone
> el PDF (13 páginas), como no hay sesión Supabase real cae al fallback → descarga `Mi Pareja.pdf` a
> `Downloads/` y abre `wa.me` con el mensaje del plan Personalizado. El PDF se inspeccionó abierto en el navegador:
> título, recuadro de foto con número, fondos de color y patrón de corazones se ven correctamente.
> La rama con Supabase real (`submitAlbumOrder`) no se pudo probar end-to-end sin un proyecto real conectado;
> queda para cuando se conecte (correr la migración 002 + crear el bucket `fotos-clientes` primero).

### F3 · Admin Drive + pedidos (datos reales) ✅ implementado, validado por script + UI verificada en navegador
- [x] `admin/layout.tsx` — guard por sesión real (`useAuth().isAdmin`) con fallback a demo
      (`demoUser.role==='admin'`); header con el lote activo real (`lotes` where `activo=true`).
- [x] `admin/page.tsx` — pedidos reales (`pedidos` join `profiles(nombre)` + `lotes(nombre)`) cuando hay sesión
      real; `update` de `estado`/`responsable`/`nota_admin` persiste a Supabase. Sin sesión real, cae a
      `DEMO_ADMIN_PEDIDOS` (edición solo local, como antes).
- [x] `lib/admin/drive.ts` — helper compartido: `listClientesConPedidos()` (agrupa pedidos por `usuario_id`,
      con nombre del cliente) y `listPedidoFilesConUrl()` (archivos de un pedido con URL firmada, marca si es imagen).
- [x] `admin/carpetas` — Drive real de 3 niveles (cliente → pedido → archivos) con descarga individual/ZIP y
      lightbox; `admin/fotos` — misma navegación pero filtrada a solo imágenes. Ambas con fallback al demo
      original (carpetas/fotos hardcodeadas) si no hay sesión real.
- [x] `mi-cuenta/page.tsx` — pedidos y `fotos_subidas` reales del usuario (con URL firmada); subir foto ahora
      sube de verdad a Storage + inserta en `fotos_subidas`; eliminar borra de Storage y la fila; renombrar
      actualiza la fila; "Mis datos" guarda `nombre`/`telefono` en `profiles`. Fallback demo intacto si no hay
      sesión real (mismas funciones, rama `else`).

> **Validado con un script Node contra Supabase real**: el join anidado `profiles(nombre)`/`lotes(nombre)`
> devuelve la forma esperada; la agrupación cliente→pedidos del Drive es correcta; el admin lista/firma
> archivos de la carpeta de OTRO usuario (RLS admin OK); el cliente lee sus propios pedidos/fotos y **no puede
> leer los de otro** (RLS OK); el lote activo se resuelve. **8/8 checks OK.**
> **UI verificada en navegador** (reconectada la extensión de Chrome): `admin` (tabla de pedidos demo),
> `admin/carpetas` (drill-down cliente → subcarpetas Compaginados/Portadas), `admin/fotos` y `mi-cuenta`
> (pedidos + "Mis fotos" con carpetas por pedido) renderizan correctamente en modo demo, sin errores de consola.
> Esto se hizo con la sesión demo (sin credenciales de un usuario Supabase real a mano); el join/RLS con datos
> reales ya está validado por el script de arriba — falta solo, si se quiere, repetir el smoke visual logueado
> con un usuario real cuando se tenga uno de prueba.

### F4 · Chatbot IA ✅ implementado y verificado
- [x] `app/api/chatbot/route.ts` — `POST` con **OpenAI `gpt-4o-mini`** (SDK oficial `openai`) usando
      `chatbot_faq` (Supabase) + `DATOS_GENERALES` como contexto en el system prompt, `max_tokens: 400`,
      últimos 6 turnos de historial para continuidad. **Degrada con gracia**: sin `OPENAI_API_KEY` o si la
      llamada falla → `{ reply: null, source: 'fallback' }`.
- [x] `Chatbot.tsx` — `handleSend` ahora llama al `POST`; si `source==='fallback'` usa el matching por palabras
      clave que ya existía (sin cambios de comportamiento visible para el usuario). Quick-replies FAQ intactas.
- [x] `admin/chatbot` — arreglado `setState-in-effect` (mismo patrón que F0/F3: diferir en microtask).

> **Cambio de proveedor**: se implementó primero con Claude (`claude-opus-4-8`); a pedido del usuario se comparó
> el costo real (búsqueda web, julio 2026) contra alternativas económicas y se migró a **OpenAI `gpt-4o-mini`**
> ($0.15/$0.60 por 1M tokens input/output — el más barato evaluado, ~6-8x menos que Claude Haiku 4.5 y ~30x
> menos que Opus 4.8). Se desinstaló `@anthropic-ai/sdk` (sin otros usos) y se instaló `openai`. Detalle de
> costos y estimado de mensajes por USD: **[COSTOS_CHATBOT.md](./COSTOS_CHATBOT.md)**.
>
> Verificado con el dev server real: `POST /api/chatbot` sin `OPENAI_API_KEY` responde
> `{"reply":null,"source":"fallback"}` (degradación correcta); `GET /api/chatbot` lee las 3 FAQ reales de
> Supabase. La rama con IA activa se activará sola en cuanto se agregue `OPENAI_API_KEY` a `.env.local` —
> no requiere cambios de código. No se pudo probar la rama con IA real (el usuario aún no configuró la key).
> `tsc`/`lint`/`build` limpios.

### F5 · Docs + limpieza ✅ completo
- [x] `PLAN.md` (este archivo) y `CODEBASE.md` al día — actualizados incrementalmente en cada fase.
- [x] Borrados los huérfanos confirmados sin referencias externas: `MinimalVisualizer.tsx`,
      `TengoDisanoVisualizer.tsx`, `modals/MinimalModal.tsx`, `modals/TengoDisanoModal.tsx`
      (carpeta `modals/` eliminada al quedar vacía).
- [x] Lint limpio: arreglados los 4 errores reales preexistentes (`any` en `api/notificaciones`,
      `PlanesSection`, `lib/demo.tsx` x2; `setState-in-effect` en `lib/demo.tsx`) + unused vars menores
      (`X` en galeria, `waLink`/`pedidoId` en mi-cuenta, `router` en register). **0 errores, 14 warnings**
      (todos intencionales: `<img>` para blobs/Storage dinámico, deps de hooks estables, fuente vía `<link>`).
      `tsc --noEmit` y `next build` limpios.

## Insumos pendientes del usuario
- ~~PDFs de plantillas~~ ✅ recibidos y transcritos (F1).
- ~~Supabase real conectado~~ ✅ proyecto `csqzxgppjxnikrngiaqb` linkeado vía CLI, schema + migraciones 002-004
  aplicadas, `.env.local` con claves reales, validado end-to-end (ver abajo).
- **`OPENAI_API_KEY`** — código de F4 ya implementado (`gpt-4o-mini`) y verificado en su rama fallback; falta la
  clave para activar las respuestas con IA (se activa sola, sin tocar código, en cuanto se agregue a
  `.env.local`). Costo estimado en [COSTOS_CHATBOT.md](./COSTOS_CHATBOT.md).
- `RESEND_API_KEY` — sigue con placeholder (opcional, el envío de email se omite si falta).
- Dependencia PDF: **jspdf** (ya instalada y en uso desde F2).

## Supabase — estado real (conectado y validado)

Proyecto vinculado vía `npx supabase link --project-ref csqzxgppjxnikrngiaqb` (requiere `SUPABASE_ACCESS_TOKEN`
en `.env.local`, un Personal Access Token de https://supabase.com/dashboard/account/tokens — no confundir con
las claves de la app). `supabase/config.toml` versionado; `supabase/.temp` en `.gitignore`.

**Aplicado a la base real** (`lib/supabase/schema.sql` + `migrations/002_editor_storage.sql` vía
`npx supabase db query --linked -f <archivo>`):
- [x] `schema.sql` — profiles, lotes, pedidos, fotos_subidas, galeria, faq, chatbot_faq, carpetas_admin.
- [x] `002_editor_storage.sql` — `pedidos.layout`/`pdf_path`, bucket `fotos-clientes` (privado) + policies.
- [x] `003_fix_new_user_trigger.sql` — **bug real encontrado y corregido**: `handle_new_user()` insertaba en
      `profiles` sin calificar el schema; el trigger corre sobre `auth.users` con un `search_path` que no
      incluye `public`, así que `signUp` fallaba siempre con 500 "Database error saving new user".
- [x] `004_fix_admin_rls_recursion.sql` — **segundo bug real**: las políticas "admin" (`pedidos`,
      `fotos_subidas`, `lotes`, `galeria`, `faq`, `chatbot_faq`, `carpetas_admin`, `storage.objects`) hacían
      `EXISTS (SELECT 1 FROM profiles WHERE ...)`, y la propia política de `profiles` usaba el mismo patrón
      sobre sí misma → recursión infinita en cualquier INSERT/SELECT que las evaluara (incluido
      `createSignedUrl`). Fix: función `is_admin()` `SECURITY DEFINER` que rompe el ciclo.

**Validado end-to-end con un usuario real** (script Node ad-hoc con `@supabase/supabase-js`, service_role +
anon key, contra la base real; usuarios y pedidos de prueba limpiados después, secuencia de `numero`
reiniciada a 1000): signup → trigger crea `profiles` → login real → upload a Storage en la carpeta propia
(RLS OK) → RLS **bloquea** la carpeta de otro usuario (seguridad OK) → insert en `pedidos` con `numero`
autogenerado (`SP-1001`) → insert en `fotos_subidas` → otro usuario **no puede leer** ese pedido (RLS OK) →
usuario promovido a admin lee todos los pedidos (RLS admin OK) → `createSignedUrl` funciona. **10/10 checks OK.**

> El navegador automatizado (Claude in Chrome) se desconectó a mitad de sesión (posible cuelgue por un diálogo
> nativo de selección de archivo). La UI del editor (F1/F2) ya se había verificado visualmente antes de eso;
> lo pendiente de re-verificar visualmente con Supabase real es F3 (admin) una vez implementado.

## Verificación end-to-end
- Editor anónimo persiste el draft tras recarga y tras pasar por `/register`.
- Envío crea `pedidos` (con `numero`), `fotos_subidas`, objetos en Storage, y el `wa.me` lleva N° + link PDF válido.
- Admin ve el pedido, edita campos (persisten), y el Drive muestra usuario→álbum→fotos+`album.pdf`.
- Chatbot responde con IA (o cae a keywords sin API key).
- `tsc`/`lint`/`build` limpios; home y `/planes` intactos.
- Editor: vista de una sola página (con flip animado) en cualquier ancho de pantalla, selector de portada
  funcional (persiste, se refleja en el PDF y en el mensaje de WhatsApp), drag&drop de fotos sobre cada slot.
  Verificado en navegador sin errores de consola.

## Pendiente opcional (no bloqueante)
- Repetir el smoke visual de F3 (admin/mi-cuenta) logueado con un usuario Supabase **real** (hoy solo se probó
  en modo demo visualmente; el camino con datos reales ya está validado por script — ver F3).
- `OPENAI_API_KEY` sigue sin configurar: el chatbot está implementado y verificado en su rama fallback; la rama
  con IA real (OpenAI `gpt-4o-mini`) no se ha podido ejercitar end-to-end todavía.
