const DEFAULT_QUALITY = 80;

export type GeneratedImageVariant = 'thumbnail' | 'medium' | 'full';

export function getStorageImageUrl(
  imageUrl: string | null | undefined,
  options: { width?: number; quality?: number } = {},
) {
  if (!imageUrl) return imageUrl || '';

  try {
    const url = new URL(imageUrl);
    const objectPath = '/storage/v1/object/public/';

    if (!url.pathname.includes(objectPath)) return imageUrl;

    url.pathname = url.pathname.replace(objectPath, '/storage/v1/render/image/public/');
    if (options.width) url.searchParams.set('width', String(options.width));
    url.searchParams.set('quality', String(options.quality || DEFAULT_QUALITY));
    url.searchParams.set('resize', 'contain');
    return url.toString();
  } catch {
    return imageUrl;
  }
}

export function getGeneratedImageUrl(
  imageUrl: string | null | undefined,
  variant: GeneratedImageVariant = 'medium',
) {
  if (!imageUrl) return imageUrl || '';

  try {
    const url = new URL(imageUrl);
    const objectPath = '/storage/v1/object/public/';

    if (!url.pathname.includes(objectPath)) return imageUrl;

    const suffixByVariant: Record<GeneratedImageVariant, string> = {
      thumbnail: '-thumbnail',
      medium: '-medium',
      full: '-full',
    };

    const match = url.pathname.match(/(.*?)(\.[^.]+)$/);
    if (!match) return imageUrl;

    const [, basePath, extension] = match;
    url.pathname = `${basePath}${suffixByVariant[variant]}${extension}`;
    return url.toString();
  } catch {
    return imageUrl;
  }
}

export function getStorageImageUrls(
  imageUrls: string[] | null | undefined,
  options: { width?: number; quality?: number } = {},
) {
  return (imageUrls || []).map((imageUrl) => getStorageImageUrl(imageUrl, options));
}