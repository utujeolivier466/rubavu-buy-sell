function createBitmapWithTimeout(file: File): Promise<ImageBitmap> {
  let timedOut = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  const bitmapPromise = createImageBitmap(file, { imageOrientation: 'from-image' }).then((bitmap) => {
    if (timedOut) {
      bitmap.close();
      throw new Error('Image decoding timed out');
    }
    return bitmap;
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      timedOut = true;
      reject(new Error('Image decoding timed out'));
    }, 15000);
  });

  return Promise.race([bitmapPromise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error('Image decoding timed out')), 15000);
      image.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      image.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('This photo format is not supported by your browser.'));
      };
      image.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function compressImage(
  file: File,
  maxEdge = 1200,
  quality = 0.75,
  targetSizeBytes: number | null = 250 * 1024,
): Promise<Blob> {
  let source: CanvasImageSource;
  let sourceWidth: number;
  let sourceHeight: number;
  let disposeSource = () => {};

  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createBitmapWithTimeout(file);
      source = bitmap;
      sourceWidth = bitmap.width;
      sourceHeight = bitmap.height;
      disposeSource = () => bitmap.close();
    } catch {
      const image = await loadImageElement(file);
      source = image;
      sourceWidth = image.naturalWidth;
      sourceHeight = image.naturalHeight;
    }
  } else {
    const image = await loadImageElement(file);
    source = image;
    sourceWidth = image.naturalWidth;
    sourceHeight = image.naturalHeight;
  }

  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  const width = Math.round(sourceWidth * scale);
  const height = Math.round(sourceHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    disposeSource();
    throw new Error('Unable to create image canvas context');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  try {
    context.drawImage(source, 0, 0, width, height);
  } finally {
    disposeSource();
  }

  for (let qualityStep = 0; ; qualityStep += 1) {
    const currentQuality = Math.max(0.5, quality - qualityStep * 0.05);
    const blob = await new Promise<Blob | null>((resolve) => {
      const timeoutId = setTimeout(() => resolve(null), 15000);
      canvas.toBlob((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      }, 'image/webp', currentQuality);
    });

    if (!blob || blob.type !== 'image/webp') {
      throw new Error('WebP image compression failed');
    }

    if (
      targetSizeBytes === null ||
      blob.size <= targetSizeBytes ||
      currentQuality <= 0.5
    ) {
      return blob;
    }
  }
}
