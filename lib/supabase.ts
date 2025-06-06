import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Utility per gestire upload di file
export async function uploadFile(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Errore upload file: ${error.message}`);
  }

  // Ottieni URL pubblico
  const { data: publicData } = supabase.storage
    .from('uploads')
    .getPublicUrl(path);

  return {
    path: data.path,
    publicUrl: publicData.publicUrl
  };
}

// Utility per scaricare file
export async function downloadFile(path: string) {
  const { data, error } = await supabase.storage
    .from('uploads')
    .download(path);

  if (error) {
    throw new Error(`Errore download file: ${error.message}`);
  }

  return data;
} 