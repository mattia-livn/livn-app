import { NextRequest, NextResponse } from 'next/server';
import { ImmobileEstratto } from '@/lib/types';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileUrl, projectId } = body;

    if (!fileUrl || !projectId) {
      return NextResponse.json(
        { error: 'FileUrl e projectId sono richiesti' },
        { status: 400 }
      );
    }

    // Scarica il file PDF
    let pdfBuffer: ArrayBuffer;
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      pdfBuffer = await response.arrayBuffer();
    } catch (error) {
      console.error('Errore download PDF:', error);
      return NextResponse.json(
        { error: 'Impossibile scaricare il file PDF' },
        { status: 400 }
      );
    }

    // Estrai testo dal PDF
    let testoGrezzo: string;
    try {
      const pdfData = await pdfParse(Buffer.from(pdfBuffer));
      testoGrezzo = pdfData.text;
    } catch (error) {
      console.error('Errore parsing PDF:', error);
      return NextResponse.json(
        { error: 'Impossibile leggere il contenuto del PDF' },
        { status: 400 }
      );
    }

    if (!testoGrezzo || testoGrezzo.trim().length < 50) {
      return NextResponse.json(
        { error: 'Il PDF sembra vuoto o non contiene testo leggibile' },
        { status: 400 }
      );
    }

    // Costruisci il prompt per OpenAI
    const prompt = costruisciPromptEstrazione(testoGrezzo);

    // Chiama OpenAI per estrarre i dati
    let immobiliEstratti: ImmobileEstratto[] = [];
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Sei un esperto nell'analisi di visure catastali italiane. Estrai con precisione i dati degli immobili dal testo fornito, distinguendo tra fabbricati e terreni."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      });

      const rispostaAI = completion.choices[0]?.message?.content;
      
      if (rispostaAI) {
        // Parse della risposta JSON di OpenAI
        const datiEstratti = JSON.parse(rispostaAI) as Partial<ImmobileEstratto>[];
        
        // Aggiungi ID univoci e normalizza i dati
        immobiliEstratti = datiEstratti.map((immobile) => ({
          ...immobile,
          id: randomUUID(),
          uso: null // Parte sempre da null, sarà l'utente a specificare
        } as ImmobileEstratto));
      }

    } catch (error) {
      console.error('Errore OpenAI:', error);
      return NextResponse.json(
        { error: 'Errore nell\'elaborazione AI del documento' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      immobiliEstratti,
      totalCount: immobiliEstratti.length,
      message: `Estratti ${immobiliEstratti.length} immobili dalla visura`
    });

  } catch (error) {
    console.error('Errore estrazione visura:', error);
    return NextResponse.json(
      { error: 'Errore interno nell\'estrazione' },
      { status: 500 }
    );
  }
}

function costruisciPromptEstrazione(testoVisura: string): string {
  return `
Analizza questo testo di una visura catastale italiana ed estrai tutti gli immobili (fabbricati e terreni) presenti.

TESTO DELLA VISURA:
${testoVisura}

Devi restituire un array JSON con questa struttura esatta:

[
  {
    "tipo": "fabbricato" | "terreno",
    "identificativo": {
      "foglio": "string",
      "particella": "string", 
      "subalterno": "string" | null,
      "comune": "string",
      "provincia": "string" | null
    },
    "rendita": number | null,
    "redditoDominicale": number | null,
    "categoria": "string" | null,
    "classe": "string" | null,
    "superficie": number | null
  }
]

REGOLE:
1. Per FABBRICATI: categoria = es. "A/2", "C/6"; rendita = rendita catastale; redditoDominicale = null
2. Per TERRENI: categoria = qualità (es. "seminativo", "uliveto"); redditoDominicale = reddito dominicale; rendita = null
3. Superficie solo per terreni (in mq)
4. Estrai il comune e provincia se presenti nell'intestazione
5. Se un dato non è presente, usa null
6. Non aggiungere campi extra
7. Rispondi SOLO con il JSON valido, senza commenti o spiegazioni

JSON:`;
} 