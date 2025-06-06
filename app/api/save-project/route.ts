import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SaveProjectInput } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body: SaveProjectInput = await request.json();
    const { id, email, nome, immobili } = body;

    if (id) {
      // Aggiorna progetto esistente
      const { data, error } = await supabase
        .from('projects')
        .update({
          nome,
          immobili,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Errore aggiornamento progetto:', error);
        return NextResponse.json(
          { error: 'Errore nell\'aggiornamento del progetto' },
          { status: 500 }
        );
      }

      return NextResponse.json({ projectId: data.id, project: data });

    } else {
      // Crea nuovo progetto
      let userId = null;

      // Se c'è un'email, crea o trova l'utente
      if (email) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Crea nuovo utente
          const { data: newUser, error: createUserError } = await supabase
            .from('users')
            .insert({ 
              id: randomUUID(),
              email,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createUserError) {
            console.error('Errore creazione utente:', createUserError);
            // Continua comunque senza associare l'utente
          } else {
            userId = newUser.id;
          }
        }
      }

      // Crea nuovo progetto
      const projectId = randomUUID();
      const { data, error } = await supabase
        .from('projects')
        .insert({
          id: projectId,
          user_id: userId,
          nome,
          email,
          immobili,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Errore creazione progetto:', error);
        return NextResponse.json(
          { error: 'Errore nella creazione del progetto' },
          { status: 500 }
        );
      }

      return NextResponse.json({ projectId: data.id, project: data });
    }

  } catch (error) {
    console.error('Errore nel salvataggio progetto:', error);
    return NextResponse.json(
      { error: 'Errore interno nel salvataggio' },
      { status: 500 }
    );
  }
}

// GET per recuperare un progetto
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'ID progetto richiesto' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Errore recupero progetto:', error);
      return NextResponse.json(
        { error: 'Progetto non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project: data });

  } catch (error) {
    console.error('Errore nel recupero progetto:', error);
    return NextResponse.json(
      { error: 'Errore interno nel recupero' },
      { status: 500 }
    );
  }
} 