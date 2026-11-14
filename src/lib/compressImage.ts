export async function compressImage(
  file: File,
  maxEdge = 1200,
  quality = 0.75,
  targetSizeBytes: number | null = 250 * 1024,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Unable to create image canvas context');
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  for (let qualityStep = 0; ; qualityStep += 1) {
    const currentQuality = Math.max(0.5, quality - qualityStep * 0.05);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', currentQuality);
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
