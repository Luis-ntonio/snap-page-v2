# TODO — Rediseño look & feel Snap Page (handoff para Claude Code)

Contexto: rediseño aprobado en mockups (`Home.dc.html`, `Planes.dc.html`, `Plantillas.dc.html`, `Editor.dc.html`, `Galeria.dc.html`, `Login.dc.html`, `MiCuenta.dc.html`, `Admin.dc.html`). Este documento traduce esos mockups a cambios concretos sobre el codebase Next.js (`snap-page-v2`). **Es un re-skin + mejoras de UX: no cambiar lógica de negocio, Supabase, modo demo, ni rutas.**

> ⚠️ REGLA CLAVE: la funcionalidad existente de plantillas interactivas (pasar páginas con animación y layouts de N fotos por página según plantilla, definidos en `lib/data.ts`) **se mantiene intacta**. Solo se re-estiliza su contenedor/controles según el mockup `Plantillas.dc.html` (tab PLANTILLA). Lo mismo aplica al flip de página del editor.

---

## 1. Fundaciones (hacer primero)

### 1.1 Tipografías — `app/layout.tsx` + `app/globals.css`
- [ ] Cargar con `next/font/google`: **Gloock** (400), **Raleway** (400–800, + italic 400/600), **Caveat** (400, 600). Exponer como CSS vars: `--font-display`, `--font-body`, `--font-hand`.
- [ ] `body { font-family: var(--font-body) }`. Titulares (h1–h3 de marketing) en Gloock; notas/acentos manuscritos en Caveat.

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
- [ ] Buscar y reemplazar globalmente `#8B4513` → `var(--marron)` y fondos `bg-white`/`#fff` de página → `var(--crema)` (las cards internas siguen blancas).

### 1.3 Utilidades globales
- [ ] Keyframes en `globals.css`: `fadeUp` (opacity 0→1, translateY 18px→0), `marquee` (translateX 0→-50%), `popIn` (scale .94→1). Añadir animación de entrada (`fadeUp` con delays escalonados) a hero y cards al montar; respetar `prefers-reduced-motion`.
- [ ] Estilo global de links: `a { color: var(--marron) }`, hover coral.
- [ ] Botones: adoptar 2 variantes consistentes en todo el sitio — **primario** (pill coral o marrón, texto crema, `letter-spacing .1em`, uppercase 12-13px, hover: translateY(-2px) + sombra) y **outline** (borde `--borde-2`, texto marrón, hover fondo `--crema-2`). Extraer a componente `Button` si no existe.

---

## 2. Layout compartido

### 2.1 `app/components/layout/Navbar.tsx`
- [ ] Barra de anuncio arriba (fondo `--marron`, texto `#F6E3D5`, 11.5px, uppercase, tracking .14em): "Entrega en 1 semana · Recojo gratis en Matellini · Delivery a todo Lima".
- [ ] Navbar sticky con `background: rgba(251,247,242,.92)` + `backdrop-filter: blur(8px)`, borde inferior `--borde`, alto 64px.
- [ ] Logo centrado absoluto: "Snap" (Gloock, marrón) ✳ (coral) "Page" (Gloock, tinta). Links en 3 izquierda (INICIO/PLANES/PLANTILLAS) y 3 derecha (GALERÍA/INGRESAR/CTA), 12px, weight 700, tracking .16em; activo en `--tinta`, resto `--texto-3`.
- [ ] CTA "CREA EL TUYO" como pill marrón → hover coral.
- [ ] Mobile (<900px): hamburguesa con panel deslizante; logo centrado se mantiene.

### 2.2 `app/components/layout/Footer.tsx`
- [ ] Fondo `--tinta`, 3 columnas (marca+descripción / EXPLORA / CONTACTO), links `#CBB9AB` hover coral, iconos Instagram/TikTok en SVG stroke. Copyright centrado abajo.
- [ ] Botón flotante de WhatsApp (fijo bottom-right, círculo #25D366, hover scale 1.08) global en `(main)`.

---

## 3. Home — `app/page.tsx` y `app/components/ui/*`

### 3.1 `HeroSection.tsx` — reescribir según mockup
- [ ] Grid 2 cols (1.05fr/1fr): izquierda kicker Caveat coral rotado -1.5° ("hecho a mano, con amor"), H1 Gloock `clamp(2.6rem,4.6vw,4.2rem)` "Tus recuerdos merecen más que una galería.", párrafo con precio "Desde S/ 70", CTA primario + outline, microcopy "Tapa dura · A4 · 20 páginas · Listo en 1 semana".
- [ ] Derecha: composición de 3 polaroids (blancas, padding con pie, sombra `0 12px 32px rgba(75,46,26,.18)`, rotaciones -7°/5°/-2°, "cinta adhesiva" semitransparente arriba, caption Caveat) usando fotos reales de `/public/images`; hover endereza y levanta. Círculo decorativo crema-2 y ✳ flotante (keyframe `floaty`).
- [ ] Mobile: columna única, polaroids en fila horizontal scrolleable o stack reducido.

### 3.2 NUEVO `CarruselSection.tsx` (reemplaza `RevistasSection.tsx`)
- [ ] Marquee infinito de portadas estilo polaroid (fondo `--crema-2`, título Caveat), lista duplicada + `animation: marquee 30s linear infinite`, pausa on hover. Usar portadas reales de `lib/data.ts`.

### 3.3 Sección intro (nueva, dentro de Home)
- [ ] Bloque centrado: kicker Caveat "¿qué es Snap Page?", H2 Gloock "Revistas de tu propia vida.", párrafo corto.

### 3.4 Resumen de planes en Home
- [ ] Grid 4 cards blancas radius 20, imagen arriba, nombre Gloock marrón + precio, descripción 1 línea, botón outline; card "Personalizado" con borde coral y listón diagonal "EL MÁS PEDIDO". Hover: translateY(-8px) + sombra. Mobile: 2 cols → 1 col.

### 3.5 `PasosSection.tsx`
- [ ] Fondo `--marron`, números en Caveat 52px coral, títulos crema, textos `rgba(251,247,242,.72)`. 4 cols → 2 → 1. Copy del mockup (incluye "Pagas el 50% para empezar").

### 3.6 `ComoEnviarSection.tsx`
- [ ] 2 cols: texto + card de video 16:10 rotada 1° (hover 0°) con botón play circular overlay. Mantener el video/link actual.

### 3.7 `DatosYFaqSection.tsx`
- [ ] Fondo `--crema-2`, 2 cols. Izquierda: foto del producto + tabla de specs con separadores `border-bottom: 1px dashed var(--borde-2)`. Derecha: FAQ como `<details>` estilizados (card crema, borde, radius 16, "＋" coral a la derecha) usando `FAQ_DEFAULT` de `lib/data.ts`.

### 3.8 CTA final (nueva)
- [ ] Kicker Caveat + H2 Gloock "Empieza tu photobook hoy." + botón "CREA EL TUYO — DESDE S/ 70".

---

## 4. Planes — página de planes + modales
- [ ] Re-skin de cards según `Planes.dc.html`: grid 2×2 (mobile 1 col), layout horizontal imagen 190px + contenido, bullets con ✳ coral, Premium con card oscura (`--tinta`). Mantener los flujos/modales existentes de `PlanesSection.tsx` (solo re-estilizar: overlay `rgba(43,33,28,.55)` + blur, card crema radius 24, animación `popIn`, dropzone con borde dashed hover coral).
- [ ] Sección inferior "¿no sabes cuál elegir?" con CTA WhatsApp.

## 5. Plantillas — `app/(main)/plantillas/`
- [ ] `page.tsx`: reemplazar grid actual por bandas full-width apiladas (200px, radius 24) con imagen de categoría, gradiente lateral alternado y texto (Caveat: "N fotos · 10 hojas" + Gloock grande). Hover: levanta + sombra.
- [ ] `[categoria]/page.tsx`: re-skin — breadcrumb "← TODAS LAS PLANTILLAS", título Gloock, tabs pill PLANTILLA/PORTADA (activo fondo marrón), stats grandes (Gloock 44px) "10 hojas / N fotos", CTAs "✦ PERSONALIZAR ONLINE" (coral) y "PEDIR POR WHATSAPP" (outline).
- [ ] **NO tocar** el visor interactivo existente (paso de páginas, spreads, fotos por página según plantilla): solo envolver en el contenedor crema-2 radius 24 con la card blanca del libro (sombra grande, línea central de lomo) y flechas circulares del mockup.
- [ ] Miniaturas de páginas interiores como grid de 5 cols (radius 8, hover borde coral) conectadas al visor (clic = ir a esa página).
- [ ] Tab PORTADA: grid de portadas seleccionables (borde coral + fondo `#FDF3EC` al elegir) + CTA "CONTINUAR CON ESTA PORTADA →".

## 6. Editor de álbum
- [ ] Re-skin según `Editor.dc.html`: top bar crema con "← SALIR", nombre de plantilla Gloock + plan, indicador "Borrador guardado" (punto verde), contador "N / M fotos", botón WhatsApp verde.
- [ ] Layout: sidebar 240px (selector de portada 2×2 + card "tip") + canvas central: página blanca A4 apaisada con sombra, slots con borde dashed (`--borde-2` vacío / verde `--verde-ok` lleno, fondo `#F0F5EC`), campo de frase Caveat centrado abajo.
- [ ] Navegación de páginas: flechas circulares + dots (activo: pill coral 22px). **Mantener** la animación de volteo y los layouts por plantilla existentes.
- [ ] Mobile: sidebar colapsa a fila horizontal scrolleable encima del canvas.

## 7. Galería — `app/(main)/galeria/page.tsx`
- [ ] Filtros pill por temática (TODOS/PAREJAS/VIAJES/CUMPLEAÑOS/FAMILIA), activo fondo marrón.
- [ ] Masonry con `columns: 3` (2 en tablet, 1 en mobile): items como polaroids (padding blanco, pie Caveat, rotación aleatoria ±2.5°, hover endereza). CTA final fondo crema-2 → Planes.

## 8. Auth — `app/(auth)/login/page.tsx` (+ register/forgot con el mismo layout)
- [ ] Split-screen: izquierda panel marrón con kicker Caveat, H1 Gloock "Tus recuerdos te estaban esperando.", polaroid decorativa; derecha formulario sobre crema.
- [ ] Inputs: borde 1.5px `#E4D5C5` radius 14, focus borde coral. Botón INGRESAR pill marrón → hover coral. Links "¿Olvidaste...?"/"Crear cuenta".
- [ ] Bloque demo: separador con Caveat "¿solo explorando?", dos botones outline "Entrar como cliente"/"Entrar como admin", nota 11px. **Mantener `demoLogin` y `signIn` tal cual.**
- [ ] Mobile: panel marrón se vuelve header compacto arriba del form.

## 9. Mi cuenta — `app/(main)/mi-cuenta/page.tsx`
- [ ] Tabs subrayados (borde inferior 2.5px coral en activo): MIS PEDIDOS / MIS FOTOS / MIS DATOS.
- [ ] Cards de pedido: número Gloock marrón, chip de plan, fecha Caveat, precio; **timeline horizontal de 5 etapas** (círculos: ✓ verde completado, ● coral actual, vacío pendiente; línea conectora verde/gris) reemplaza el badge de estado actual. Acciones: "CONSULTAR POR WHATSAPP" outline + "VER MIS FOTOS →".
- [ ] Card dashed "+ empezar un nuevo photobook" (Caveat coral) → /planes.
- [ ] MIS FOTOS: grid 6 cols (mobile 3) con contador "18 de 20 fotos subidas", slot "+" dashed. Mantener upload/zip/signedUrl existentes.
- [ ] MIS DATOS: form estilizado (labels 11px uppercase, inputs crema, email disabled fondo crema-2).

## 10. Admin — `app/admin/`
- [ ] `layout.tsx`: reemplazar sidebar gris (#EBEBEB, links italic) por **sidebar oscuro** (`--tinta`, 220px, sticky full-height): logo + "PANEL ADMIN", nav con iconos (lucide: LayoutList/Image/Folder/MessageCircle), item activo fondo `rgba(232,121,90,.22)` texto crema; abajo avatar circular coral + nombre + "Cerrar sesión". Mobile: colapsa a barra inferior o drawer.
- [ ] `page.tsx` (pedidos): header "lote actual" (Caveat coral) + "Lote N — Mes" (Gloock) + buscador pill + botón "+ NUEVO PEDIDO". 
- [ ] Fila de **stat cards** (4): Pedidos del lote (de N cupos), En producción, Por entregar ("este domingo"), Ingresos del lote — número Gloock 30px con `white-space: nowrap`.
- [ ] Filtros pill por estado con contador (TODOS/PEDIDO/DISEÑO/PRODUCCIÓN/ENTREGA/ENTREGADO), activo marrón.
- [ ] Tabla: header fondo `--crema-2` 10.5px uppercase; filas con avatar inicial de color, chips de plan/temática/responsable con la paleta suave del mockup (ver `Admin.dc.html` — objetos `ESTILOS`, `RESP`, `TEMAS`); `<select>` de estado estilizado como chip de color (mantener `upd()` hacia Supabase). Hover de fila `#FDFAF5`. Empty state Caveat "no hay pedidos en este estado".
- [ ] Aplicar el mismo re-skin (cards, chips, tipografía) a `/admin/fotos`, `/admin/carpetas`, `/admin/chatbot`.

---

## 11. Responsive (transversal)
- [ ] Breakpoints: 640 / 900 / 1140px. Grids fijas actuales (2 y 4 cols) → `repeat(auto-fit,minmax(...))` o media queries según sección (indicado arriba).
- [ ] Hit targets ≥44px en mobile; navbar hamburguesa; hero 1 col.

## 12. QA final
- [ ] Verificar contraste AA de chips de estado y textos sobre marrón.
- [ ] `prefers-reduced-motion` desactiva marquee/floaty/fadeUp.
- [ ] Revisar que ningún `#8B4513` ni gris Tailwind por defecto (`text-gray-*`, `bg-gray-*`) quede en vistas re-diseñadas: mapear a tokens.
- [ ] Lighthouse: fonts con `display: swap` (next/font lo hace), imágenes de polaroids con `next/image`.

## Orden sugerido de PRs
1. Fundaciones (§1) + Navbar/Footer (§2)
2. Home (§3)
3. Planes + Plantillas + Editor (§4–6)
4. Galería + Auth + Mi cuenta (§7–9)
5. Admin (§10) + responsive/QA (§11–12)
