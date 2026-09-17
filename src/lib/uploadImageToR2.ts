import { supabase } from '../../lib/libsupabaseClient';

export async function uploadImageToR2(file: File, folder: 'property-images' | 'submission-photos', isAdmin = false): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': file.type || 'image/webp',
    'X-Upload-Folder': folder,
    'X-Upload-Scope': isAdmin ? 'admin' : 'public-submission',
  };

  if (isAdmin) {
    if (!supabase) throw new Error('Supabase client unavailable');
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) throw new Error('Admin session expired. Please sign in again.');
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    headers,
    body: file,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || typeof result.url !== 'string') {
    throw new Error(result.error || 'Image upload failed.');
  }

  return result.url;
}
