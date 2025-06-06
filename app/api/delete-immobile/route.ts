import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DeleteImmobileInput, ImmobileEstratto } from '@/lib/types';

export async function DELETE(request: NextRequest) {
  try {
    const body: DeleteImmobileInput = await request.json();
    const { projectId, immobileId } = body;

    // Recupera il progetto corrente
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Progetto non trovato' },
        { status: 404 }
      );
    }

    // Trova l'immobile nell'array
    const immobili: ImmobileEstratto[] = project.immobili || [];
    const immobileIndex = immobili.findIndex(i => i.id === immobileId);

    if (immobileIndex === -1) {
      return NextResponse.json(
        { error: 'Immobile non trovato' },
        { status: 404 }
      );
    }

    // Rimuovi l'immobile dall'array
    const immobileRimosso = immobili[immobileIndex];
    immobili.splice(immobileIndex, 1);

    // Salva il progetto aggiornato
    const { data, error } = await supabase
      .from('projects')
      .update({
        immobili,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Errore aggiornamento progetto:', error);
      return NextResponse.json(
        { error: 'Errore nell\'eliminazione dell\'immobile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      deletedImmobile: immobileRimosso,
      project: data,
      message: `Immobile ${immobileRimosso.identificativo.foglio}/${immobileRimosso.identificativo.particella} eliminato con successo`
    });

  } catch (error) {
    console.error('Errore nell\'eliminazione immobile:', error);
    return NextResponse.json(
      { error: 'Errore interno nell\'eliminazione' },
      { status: 500 }
    );
  }
} 