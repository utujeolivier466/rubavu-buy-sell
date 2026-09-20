import imageCompression from 'browser-image-compression';

export type ImageVariant = 'thumbnail' | 'medium' | 'full';

export async function compressImage(
  file: File,
  options: { maxSizeMB?: number; maxWidthOrHeight?: number; fileType?: string } = {},
): Promise<File> {
  const compressedFile = await imageCompression(file, {
    maxSizeMB: options.maxSizeMB ?? 0.5,
    maxWidthOrHeight: options.maxWidthOrHeight ?? 1920,
    fileType: options.fileType ?? 'image/webp',
    useWebWorker: true,
  });

  return new File([compressedFile], `${file.name.replace(/\.[^/.]+$/, '')}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

function withVariantSuffix(file: File, variant: ImageVariant): File {
  const baseName = file.name.replace(/\.webp$/i, '');
  return new File([file], `${baseName}-${variant}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

export async function generateImageVariants(file: File): Promise<Record<ImageVariant, File>> {
  const [thumbnail, medium, full] = await Promise.all([
    compressImage(file, { maxSizeMB: 0.22, maxWidthOrHeight: 480 }),
    compressImage(file, { maxSizeMB: 0.42, maxWidthOrHeight: 1200 }),
    compressImage(file, { maxSizeMB: 0.8, maxWidthOrHeight: 2200 }),
  ]);

  return {
    thumbnail: withVariantSuffix(thumbnail, 'thumbnail'),
    medium: withVariantSuffix(medium, 'medium'),
    full: withVariantSuffix(full, 'full'),
  };
}