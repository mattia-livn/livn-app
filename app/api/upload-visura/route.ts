import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'File non fornito' },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'ID progetto richiesto' },
        { status: 400 }
      );
    }

    // Validazione del file
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo file PDF sono supportati' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB max
      return NextResponse.json(
        { error: 'File troppo grande (max 10MB)' },
        { status: 400 }
      );
    }

    // Genera nome file univoco
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `visura-${projectId}-${timestamp}.pdf`;
    const filePath = `uploads/${fileName}`;

    // Carica su Supabase Storage
    const uploadResult = await uploadFile(file, filePath);

    return NextResponse.json({
      success: true,
      fileUrl: uploadResult.publicUrl,
      filePath: uploadResult.path,
      fileName: fileName
    });

  } catch (error) {
    console.error('Errore upload visura:', error);
    return NextResponse.json(
      { error: 'Errore interno nell\'upload del file' },
      { status: 500 }
    );
  }
} 