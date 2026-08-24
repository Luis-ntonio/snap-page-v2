// Color representativo de una portada — usado para la contraportada (que va lisa, sin la imagen) y
// para las guardas en blanco de las tapas duras, así todo el forro del libro combina con la portada
// que el cliente eligió sin necesitar un color curado a mano por diseño.
export async function getDominantColor(url: string, fallback = '#2b2b2b'): Promise<string> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('no se pudo cargar la imagen de portada'));
      el.src = url;
    });
    const size = 24;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return fallback;
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    let r = 0, g = 0, b = 0;
    const n = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    r = Math.round(r / n);
    g = Math.round(g / n);
    b = Math.round(b / n);
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  } catch {
    return fallback;
  }
}
