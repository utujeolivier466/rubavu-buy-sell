import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    fileType: 'image/webp',
    useWebWorker: true,
  });
}