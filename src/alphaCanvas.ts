export type AlphaCleanOptions = {
  chroma?: [number, number, number];
  tolerance?: number;
  feather?: number;
  width?: number;
  height?: number;
};

const alphaCache = new Map<string, Promise<string>>();

export function cleanChromaToAlpha(sourceUrl: string, options: AlphaCleanOptions = {}) {
  const { chroma = [0, 255, 0], tolerance = 105, feather = 36, width = 600, height = 900 } = options;
  const cacheKey = `${sourceUrl}:${chroma.join(',')}:${tolerance}:${feather}:${width}x${height}`;
  const cached = alphaCache.get(cacheKey);
  if (cached) return cached;

  const result = new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return reject(new Error('Canvas 2D context is unavailable'));
      context.drawImage(image, 0, 0, width, height);
      const frame = context.getImageData(0, 0, width, height);
      const pixels = frame.data;
      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index]; const green = pixels[index + 1]; const blue = pixels[index + 2];
        const distance = Math.hypot(red - chroma[0], green - chroma[1], blue - chroma[2]);
        const greenDominance = green - Math.max(red, blue);
        if (distance <= tolerance || greenDominance > 92) pixels[index + 3] = 0;
        else if (greenDominance > 54) pixels[index + 3] = Math.round(255 * Math.min(1, (92 - greenDominance) / feather));
      }
      context.putImageData(frame, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error(`Unable to load alpha source: ${sourceUrl}`));
    image.src = sourceUrl;
  });
  alphaCache.set(cacheKey, result);
  return result;
}

export function inspectOpaqueEdgePixels(imageData: ImageData) {
  const { data, width, height } = imageData;
  let opaque = 0;
  const inspect = (x: number, y: number) => { if (data[(y * width + x) * 4 + 3] > 8) opaque += 1; };
  for (let x = 0; x < width; x += 1) { inspect(x, 0); inspect(x, height - 1); }
  for (let y = 1; y < height - 1; y += 1) { inspect(0, y); inspect(width - 1, y); }
  return opaque;
}
