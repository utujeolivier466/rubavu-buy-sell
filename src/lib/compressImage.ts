import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    fileType: 'image/webp',
    useWebWorker: true,
  });

  return new File([compressedFile], `${file.name.replace(/\.[^/.]+$/, '')}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}