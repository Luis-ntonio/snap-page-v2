# TODO — Rediseño look & feel Snap Page (handoff para Claude Code)

Contexto: rediseño aprobado en mockups (`Home.dc.html`, `Planes.dc.html`, `Plantillas.dc.html`, `Editor.dc.html`, `Galeria.dc.html`, `Login.dc.html`, `MiCuenta.dc.html`, `Admin.dc.html`). Este documento traduce esos mockups a cambios concretos sobre el codebase Next.js (`snap-page-v2`). **Es un re-skin + mejoras de UX: no cambiar lógica de negocio, Supabase, modo demo, ni rutas.**

> ⚠️ REGLA CLAVE: la funcionalidad existente de plantillas interactivas (pasar páginas con animación y layouts de N fotos por página según plantilla, definidos en `lib/data.ts`) **se mantiene intacta**. Solo se re-estiliza su contenedor/controles según el mockup `Plantillas.dc.html` (tab PLANTILLA). Lo mismo aplica al flip de página del editor.

---

## 1. Fundaciones (hacer primero)

### 1.1 Tipografías — `app/layout.tsx` + `app/globals.css`
- [x] Cargar con `next/font/google`: **Gloock** (400), **Raleway** (400–800, + italic 400/600), **Caveat** (400, 600). Exponer como CSS vars: `--font-display`, `--font-body`, `--font-hand`.
- [x] `body { font-family: var(--font-body) }`. Titulares (h1–h3 de marketing) en Gloock; notas/acentos manuscritos en Caveat.

### 1.2 Tokens de color — `app/globals.css` (`:root`)
```css
--crema:        #FBF7F2;  /* fondo base de todo el sitio (antes blanco) */
--crema-2:      #F3E8DC;  /* fondos de sección alternos, chips */
--marron:       #7B3A1E;  /* primario (reemplaza #8B4513 en TODO el código) */
--coral:        #E8795A;  /* acento / CTA principal */
--coral-suave:  #F0B79E;
--tinta:        #2B211C;  /* texto principal / footer bg */
--texto-2:      #6E5D52;  /* texto secundario */
--texto-3:      #A08D7F;  /* texto terciario / labels */
--borde:        #EADFD3;  /* bordes de cards */
--borde-2:      #D8C4B2;  /* bordes de inputs/botones outline */
--verde-ok:     #7C9A72;  /* estados "listo/guardado" */
```
- [x] Tokens agregados en `:root` de `globals.css`. `#8B4513` → `var(--marron)` y fondos blancos de página → `var(--crema)` se van reemplazando sección por sección en las fases 2-5 (no hay `#8B4513` en Navbar/Footer/globals ya migrados).

### 1.3 Utilidades globales
- [x] Keyframes en `globals.css`: `fadeUp`, `marquee`, `floaty`, `popIn` + clases `.anim-fadeUp`/`.anim-floaty`/`.anim-popIn`. `prefers-reduced-motion` los desactiva.
- [x] Estilo global de links: `a { color: var(--marron) }`, hover coral.
- [x] Botones: clases globales `.btn-primary` / `.btn-outline` en `globals.css` (pill, uppercase, hover translateY+sombra / hover fondo crema-2).

---

## 2. Layout compartido

### 2.1 `app/components/layout/Navbar.tsx`
- [x] Barra de anuncio arriba (fondo `--marron`, texto `#F6E3D5`, 11.5px, uppercase, tracking .14em): "Entrega en 1 semana · Recojo gratis en Matellini · Delivery a todo Lima". (En flujo normal, no fija — DemoBanner sigue fijo arriba de todo sin tocarse.)
- [x] Navbar sticky con `background: rgba(251,247,242,.92)` + `backdrop-filter: blur(8px)`, borde inferior `--borde`, alto 64px.
- [x] Logo centrado absoluto: "Snap" (Gloock, marrón) ✳ (coral) "Page" (Gloock, tinta). Links en 3 izquierda (INICIO/PLANES/PLANTILLAS) y 3 derecha (GALERÍA/INGRESAR-o-sesión/CTA), 12px, weight 700, tracking .16em; activo en `--tinta`, resto `--texto-3` (vía `usePathname`).
- [x] CTA "CREA EL TUYO" como pill marrón → hover coral.
- [x] Mobile (<900px): hamburguesa con panel deslizante; logo centrado se mantiene.

### 2.2 `app/components/layout/Footer.tsx`
- [x] Fondo `--tinta`, 3 columnas (marca+descripción / EXPLORA / CONTACTO), links `#CBB9AB` hover coral, iconos Instagram/TikTok en SVG stroke. Copyright centrado abajo.
- [x] Botón flotante de WhatsApp (fijo bottom-right, círculo #25D366, hover scale 1.08) global en `(main)` — ya existía en Tailwind, verificado sin conflicto de z-index.

---

## 3. Home — `app/page.tsx` y `app/components/ui/*`

### 3.1 `HeroSection.tsx` — reescribir según mockup
- [x] Grid 2 cols (1.05fr/1fr): izquierda kicker Caveat coral rotado -1.5° ("hecho a mano, con amor"), H1 Gloock `clamp(2.6rem,4.6vw,4.2rem)` "Tus recuerdos merecen más que una galería.", párrafo con precio "Desde S/ 70", CTA primario + outline, microcopy "Tapa dura · A4 · 20 páginas · Listo en 1 semana".
- [x] Derecha: composición de 3 polaroids (blancas, padding con pie, sombra `0 12px 32px rgba(75,46,26,.18)`, rotaciones -7°/5°/-2°, "cinta adhesiva" semitransparente arriba, caption Caveat); hover endereza y levanta. Círculo decorativo crema-2 y ✳ flotante (keyframe `floaty`). (Fotos: placeholders `picsum.photos` con seed fija — no hay assets reales en `/public/images`, ver nota de alcance en el plan.)
- [x] Mobile: columna única, polaroids en fila horizontal scrolleable.

### 3.2 NUEVO `CarruselSection.tsx` (reemplaza `RevistasSection.tsx`)
- [x] Marquee infinito de portadas estilo polaroid (fondo `--crema-2`, título Caveat), lista duplicada + `animation: marquee 32s linear infinite`, pausa on hover. Usa `PORTADAS` real de `lib/data.ts`. `RevistasSection.tsx` eliminado (sin más referencias).

### 3.3 Sección intro (nueva, dentro de Home)
- [x] Bloque centrado: kicker Caveat "¿qué es Snap Page?", H2 Gloock "Revistas de tu propia vida.", párrafo corto. (`IntroSection.tsx`)

### 3.4 Resumen de planes en Home
- [x] Grid 4 cards blancas radius 20, imagen arriba, nombre Gloock marrón + precio, descripción 1 línea, botón outline; card "Personalizado" con borde coral y pill "EL MÁS PEDIDO" (el mockup real usa pill, no cinta diagonal). Hover: translateY(-8px) + sombra. Mobile: 2 cols → 1 col. (`PlanesResumenSection.tsx`, reutiliza `PLAN_LABELS`/`PLAN_PRICES` de `@/types`.)

### 3.5 `PasosSection.tsx`
- [x] Fondo `--marron`, números en Caveat 52px coral, títulos crema, textos `rgba(251,247,242,.72)`. 4 cols → 2 → 1. Copy del mockup actualizado en `PASOS` (`lib/data.ts`), incluye "Pagas el 50% para empezar".

### 3.6 `ComoEnviarSection.tsx`
- [x] 2 cols: texto + card de video 16:10 rotada 1° (hover 0°). Mantiene el `<video controls>` existente — se omitió el botón play circular decorativo del mockup porque duplicaría los controles nativos del `<video>`.

### 3.7 `DatosYFaqSection.tsx`
- [x] Fondo `--crema-2`, 2 cols. Izquierda: foto del producto + tabla de specs (`DATOS_GENERALES` de `lib/data.ts`) con separadores `border-bottom: 1px dashed var(--borde-2)`. Derecha: FAQ como `<details>` estilizados (card crema, borde, radius 16, "＋" coral a la derecha) usando `FAQ_DEFAULT` de `lib/data.ts`.

### 3.8 CTA final (nueva)
- [x] Kicker Caveat + H2 Gloock "Empieza tu photobook hoy." + botón "CREA EL TUYO — DESDE S/ 70". (`CtaFinalSection.tsx`)

---

## 4. Planes — página de planes + modales
- [x] Re-skin de cards según `Planes.dc.html`: grid 2×2 (mobile 1 col), layout horizontal imagen 190px + contenido, bullets con ✳ coral, Premium con card oscura (`--tinta`). Mantiene los flujos/modales existentes de `PlanesSection.tsx` (solo re-estilizado: overlay `rgba(43,33,28,.55)` + blur, card crema radius 24, animación `popIn`, dropzone con borde dashed hover coral). Título de la página (`app/(main)/planes/page.tsx`) también re-skineado con el copy exacto del mockup.
- [x] Sección inferior "¿no sabes cuál elegir?" con CTA WhatsApp.

## 5. Plantillas — `app/(main)/plantillas/`
- [x] `page.tsx`: reemplazado grid actual por bandas full-width apiladas (200px, radius 24) con imagen de categoría, gradiente lateral alternado y texto (Caveat: "N fotos · N hojas" + Gloock grande). Hover: levanta + sombra. Conteos reales desde `PLANTILLAS` (`lib/data.ts`), no hardcodeados.
- [x] `[categoria]/page.tsx`: re-skin — breadcrumb "← TODAS LAS PLANTILLAS", título Gloock, tabs pill PLANTILLA/PORTADA (activo fondo marrón), stats grandes (Gloock 44px) usando `layout.pages.length` real (13/11/13, no el "10 hojas" fijo del mockup que no coincidía con los datos), CTAs "✦ PERSONALIZAR ONLINE" (coral, → `/editor/[categoria]`) y "PEDIR POR WHATSAPP" (outline).
- [x] **NO se tocó** el visor interactivo existente (`AlbumPreview.tsx`/`AlbumPageCanvas.tsx` intactos) — solo envuelto en contenedor crema-2 radius 24 con card blanca del libro. La línea de lomo central del mockup se omitió a propósito: el visor fuerza vista de una sola página portrait (constraint documentado en el propio componente), y una línea vertical partiendo una sola foto no representa un lomo real — se habría visto como un bug, no como diseño.
- [x] Miniaturas de páginas interiores como grid de 5 cols (radius 8, hover borde coral), usando `layout.pages` real con conteo de fotos por página (`pg.slots.length`).
- [x] Tab PORTADA: grid de portadas seleccionables (borde coral + fondo `#FDF3EC` al elegir, filtradas por categoría desde `PORTADAS`) + CTA "CONTINUAR CON ESTA PORTADA →" → `/editor/[categoria]`.

## 6. Editor de álbum
- [x] Re-skin según `Editor.dc.html`: top bar crema con "← SALIR" (→ `/plantillas/[categoria]`), nombre de plantilla Gloock + plan (precio real de `PLAN_PRICES`), indicador "Borrador guardado" (punto verde, visible tras hidratar el borrador), contador "N / M fotos", botón WhatsApp verde (ahora es el único botón de envío — se retiró el botón grande duplicado de abajo para igualar el mockup).
- [x] Layout: sidebar 240px (selector de portada 2×2 + card "tip") + canvas central con el visor real (`AlbumEditor.tsx`/`AlbumPageCanvas.tsx`, slots dashed `--borde-2` vacío / `--verde-ok` lleno, campo de frase Caveat) — badge "página N / M" agregado como overlay no intrusivo.
- [x] Navegación de páginas: flechas circulares 40px + dots (activo: pill coral 22×8px, inactivo 8×8 `--borde-2`). **Se mantuvo intacta** la animación de volteo (`HTMLFlipBook`, `disableFlipByClick`, `useMouseEvents={false}`, constraint de tamaño portrait) y los layouts por plantilla — probado subiendo una foto a un slot y navegando páginas, funciona igual que antes.
- [x] Mobile: sidebar colapsa a fila horizontal scrolleable (`overflow-x:auto`) encima del canvas.

## 7. Galería — `app/(main)/galeria/page.tsx`
- [x] Filtros pill por temática (TODOS/PAREJAS/VIAJES/CUMPLEAÑOS/FAMILIA), activo fondo marrón.
- [x] Masonry con `columns: 3` (2 en tablet, 1 en mobile): items como polaroids (padding blanco, pie Caveat, rotación fija ±2.5° por índice, hover endereza). CTA final fondo crema-2 → Planes. Lightbox existente conservado y re-skineado.

## 8. Auth — `app/(auth)/login/page.tsx` (+ register/forgot con el mismo layout)
- [x] Split-screen: izquierda panel marrón con kicker Caveat, H1 Gloock "Tus recuerdos te estaban esperando.", polaroid decorativa; derecha formulario sobre crema. Shell compartido movido a `app/(auth)/layout.tsx` para que register/forgot-password lo hereden.
- [x] Inputs: borde 1.5px (token `--borde-2`) radius 14, focus borde coral. Botón INGRESAR pill marrón → hover coral. Links "¿Olvidaste...?"/"Crear cuenta".
- [x] Bloque demo: separador con Caveat "¿solo explorando?", dos botones outline "Entrar como cliente"/"Entrar como admin", nota 11px. **`demoLogin`/`signIn`/`getNext()` intactos.**
- [x] Mobile: panel marrón se vuelve header compacto arriba del form (oculta párrafo/polaroid decorativos vía `.auth-visual-extra`).

## 9. Mi cuenta — `app/(main)/mi-cuenta/page.tsx`
- [x] Tabs subrayados (borde inferior 2.5px coral en activo): MIS PEDIDOS / MIS FOTOS / MIS DATOS.
- [x] Cards de pedido: número Gloock marrón, chip de plan+temática, fecha Caveat, precio; **timeline horizontal de 5 etapas** (círculos: ✓ verde completado, ● coral actual, vacío pendiente; línea conectora verde/gris) reemplaza el badge de estado actual. Acciones: "CONSULTAR POR WHATSAPP" outline + "VER MIS FOTOS →" (cambia a la tab Fotos).
- [x] Card dashed "+ empezar un nuevo photobook" (Caveat coral) → /planes.
- [x] MIS FOTOS: grid 6 cols (mobile 3), slot "+" dashed. Se consolidó la gestión de fotos (antes duplicada: inline en el pedido expandido + tab Drive) en un solo lugar (tab MIS FOTOS) — mismas funciones `addFoto`/`deleteFoto`/`renameFoto`/`handleDownloadZip`/`signedUrl` sin cambios, ahora con rename y ZIP también disponibles ahí.
- [x] MIS DATOS: form estilizado (labels 11px uppercase, inputs crema, email disabled fondo crema-2).

## 10. Admin — `app/admin/`
- [x] `layout.tsx`: reemplazado sidebar gris (#EBEBEB, links italic) por **sidebar oscuro** (`--tinta`, 220px, sticky full-height): logo + "PANEL ADMIN", nav con iconos lucide (LayoutList/Image/Folder/MessageCircle), item activo fondo `rgba(232,121,90,.22)` texto crema; abajo avatar circular coral + nombre + "Cerrar sesión". Mobile: colapsa a barra inferior fija con iconos.
- [x] `page.tsx` (pedidos): header "lote actual" (Caveat coral) + nombre de lote real (Gloock) + buscador pill (filtra cliente/número) + botón "+ NUEVO PEDIDO".
- [x] Fila de **stat cards** (4): Pedidos del lote, En producción, Por entregar ("este domingo"), Ingresos del lote (suma real de `precio`) — número Gloock 30px con `white-space: nowrap`. (Sin "de N cupos": no existe ese campo en el modelo de datos — se evitó inventar un número de negocio; ver nota en el plan.)
- [x] Filtros pill por estado con contador (TODOS/PEDIDO REALIZADO/DISEÑO/PRODUCCIÓN/ENTREGA/ENTREGADO), activo marrón, combinable con el buscador.
- [x] Tabla: header fondo `--crema-2` 10.5px uppercase; filas con avatar inicial de color, chips de plan/temática/responsable con la paleta exacta del mockup (`ESTILOS`/`RESP`/`TEMAS` trasladados a `ESTADO_STYLES`/`RESP_STYLES`/`TEMA_STYLES`); `<select>` de estado estilizado como chip de color (`upd()` hacia Supabase intacto). Hover de fila `#FDFAF5`. Empty state Caveat "no hay pedidos en este estado". (Se corrigió un bug de alineación: una celda de temática ausente colapsaba el grid — ahora siempre se renderiza la celda con "—".)
- [x] Mismo re-skin (cards, chips, tokens) aplicado a `/admin/fotos`, `/admin/carpetas`, `/admin/chatbot` (clases Tailwind `gray-*`/hex reemplazadas por `var(--token)`).

---

## 11. Responsive (transversal)
- [x] Breakpoints 640/900/1140px aplicados por sección vía media queries inline (`<style>` por componente) en vez de `repeat(auto-fit,minmax())` — más predecible dado que varias grids necesitan un nº exacto de columnas por breakpoint (mockup lo pide así explícitamente, ej. plantillas 5→3 cols).
- [x] Navbar hamburguesa, hero 1 col — verificado visualmente.
- [x] **QA visual real en mobile (390px)**: `resize_window` no cambia el viewport real en este entorno (confirmado con `window.innerWidth` — se probó en 3 tabs distintos, sin efecto). Se verificó el layout mobile inyectando un `<iframe>` de 390×844px en la página y haciendo zoom sobre esa región — equivalente a un viewport real porque las media queries evalúan el ancho del iframe. Se encontraron y corrigieron 3 bugs reales de responsive que el review de código no había detectado:
  - `PlanesSection.tsx`: la card (`grid-template-columns:190px 1fr`) no colapsaba en mobile → overflow horizontal y precio cortado. Agregado breakpoint 560px que apila imagen/contenido.
  - `AlbumEditor.tsx`: el fondo de la página heredaba `--crema` (igual que la tarjeta "tip"), haciéndola invisible; el mockup del Editor usa `--crema-2` como fondo de página. Corregido + ancho mínimo a la tarjeta "tip" en la tira horizontal mobile.
  - `admin/layout.tsx`: `.admin-sidebar { display:none }` no tenía `!important`, así que el `display:'flex'` inline del `<aside>` ganaba y el sidebar no se ocultaba en mobile (aparecía duplicado con la barra inferior). Corregido.
- [x] Hit targets ≥44px en botones principales (pills de 40-58px de alto).

## 12. QA final
- [x] Contraste: textos sobre marrón usan `--crema`/`rgba(251,247,242,.72-.75)` (ya usados en el mockup, AA razonable); chips de estado/temática/responsable usan pares color-texto/fondo tomados directo del mockup (`ESTADO_STYLES`/`TEMA_STYLES`/`RESP_STYLES`), ya calibrados ahí para contraste.
- [x] `prefers-reduced-motion` desactiva `.anim-fadeUp`/`.anim-floaty`/`.anim-popIn` y el `marquee` del carrusel (regla global en `globals.css`).
- [x] Sin `#8B4513` ni `text-gray-*`/`bg-gray-*`/`border-gray-*` residuales en `app/` (verificado con grep); también se re-skineó `Chatbot.tsx` (no listado en el TODO original pero visible en todas las páginas).
- [x] Fonts con `display:'swap'` vía `next/font/google` (§1.1). **`next/image` deliberadamente NO se adoptó** — decisión de alcance documentada en el plan: AGENTS.md marca `<img>` + `onError` como decisión arquitectónica existente y la migración como mejora no trivial fuera de esta pasada; se mantuvo `<img>` en todo el código nuevo para consistencia.

## Orden sugerido de PRs
1. Fundaciones (§1) + Navbar/Footer (§2)
2. Home (§3)
3. Planes + Plantillas + Editor (§4–6)
4. Galería + Auth + Mi cuenta (§7–9)
5. Admin (§10) + responsive/QA (§11–12)
