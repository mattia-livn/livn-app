import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { EditImmobileInput, ImmobileEstratto } from '@/lib/types';

export async function PUT(request: NextRequest) {
  try {
    const body: EditImmobileInput = await request.json();
    const { projectId, immobileId, updates } = body;

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

    // Trova e aggiorna l'immobile nell'array
    const immobili: ImmobileEstratto[] = project.immobili || [];
    const immobileIndex = immobili.findIndex(i => i.id === immobileId);

    if (immobileIndex === -1) {
      return NextResponse.json(
        { error: 'Immobile non trovato' },
        { status: 404 }
      );
    }

    // Aggiorna l'immobile con i nuovi dati
    const immobileAggiornato = {
      ...immobili[immobileIndex],
      ...updates,
      // Assicurati che i campi richiesti non vengano sovrascritti erroneamente
      id: immobili[immobileIndex].id,
      tipo: immobili[immobileIndex].tipo
    };

    // Validazione dei dati aggiornati
    const validationError = validateImmobile(immobileAggiornato);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    immobili[immobileIndex] = immobileAggiornato;

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
        { error: 'Errore nell\'aggiornamento dell\'immobile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      updated: immobileAggiornato,
      project: data
    });

  } catch (error) {
    console.error('Errore nella modifica immobile:', error);
    return NextResponse.json(
      { error: 'Errore interno nella modifica' },
      { status: 500 }
    );
  }
}

function validateImmobile(immobile: ImmobileEstratto): string | null {
  // Validazioni di base
  if (!immobile.identificativo) {
    return 'Identificativo catastale richiesto';
  }

  if (!immobile.identificativo.foglio || !immobile.identificativo.particella) {
    return 'Foglio e particella sono richiesti';
  }

  if (!immobile.identificativo.comune) {
    return 'Comune richiesto';
  }

  // Validazioni specifiche per tipo
  if (immobile.tipo === 'fabbricato') {
    if (immobile.rendita !== undefined && immobile.rendita < 0) {
      return 'La rendita catastale non può essere negativa';
    }
  } else if (immobile.tipo === 'terreno') {
    if (immobile.redditoDominicale !== undefined && immobile.redditoDominicale < 0) {
      return 'Il reddito dominicale non può essere negativo';
    }
    if (immobile.superficie !== undefined && immobile.superficie < 0) {
      return 'La superficie non può essere negativa';
    }
  }

  // Validazione uso
  const usiValidi = ['abitazione', 'pertinenza', 'terreno_agricolo', 'terreno_edificabile', null];
  if (immobile.uso !== undefined && !usiValidi.includes(immobile.uso)) {
    return 'Uso non valido';
  }

  return null;
} 