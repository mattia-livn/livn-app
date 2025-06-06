import { NextRequest, NextResponse } from 'next/server';
import { AliquotaIMU } from '@/lib/types';
import { readFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { comune, provincia, anno = 2025 } = body;

    if (!comune || !provincia) {
      return NextResponse.json(
        { error: 'Comune e provincia sono richiesti' },
        { status: 400 }
      );
    }

    // Costruisce il nome del file
    const fileName = `${comune}_${provincia}_${anno}.md`;
    const filePath = join(process.cwd(), 'statements', anno.toString(), fileName);

    let contenutoFile: string;
    try {
      contenutoFile = readFileSync(filePath, 'utf8');
    } catch (fileError) {
      console.error('File non trovato:', filePath, fileError);
      return NextResponse.json(
        { 
          error: `File delle aliquote non trovato per ${comune} (${provincia}) ${anno}`,
          suggerimento: 'Verifica che il file sia presente nella cartella statements/' + anno
        },
        { status: 404 }
      );
    }

    if (!contenutoFile || contenutoFile.trim().length < 50) {
      return NextResponse.json(
        { error: 'Il file delle aliquote sembra vuoto o corrotto' },
        { status: 400 }
      );
    }

    // Usa OpenAI per estrarre le aliquote dal Markdown
    let aliquote: AliquotaIMU | null = null;
    try {
      const prompt = costruisciPromptAliquote(contenutoFile, comune, provincia, anno);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Sei un esperto nell'interpretazione di delibere comunali IMU italiane. Estrai con precisione le aliquote e le condizioni speciali dal testo fornito."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const rispostaAI = completion.choices[0]?.message?.content;
      
      if (rispostaAI) {
        const datiEstratti = JSON.parse(rispostaAI);
        aliquote = {
          comune,
          provincia,
          anno,
          ...datiEstratti
        };
      }

    } catch (error) {
      console.error('Errore OpenAI:', error);
      return NextResponse.json(
        { error: 'Errore nell\'elaborazione AI della delibera' },
        { status: 500 }
      );
    }

    if (!aliquote) {
      return NextResponse.json(
        { error: 'Non è stato possibile estrarre le aliquote dal file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      aliquote,
      message: `Aliquote caricate per ${comune} (${provincia}) ${anno}`
    });

  } catch (error) {
    console.error('Errore caricamento aliquote:', error);
    return NextResponse.json(
      { error: 'Errore interno nel caricamento aliquote' },
      { status: 500 }
    );
  }
}

function costruisciPromptAliquote(contenutoMd: string, comune: string, provincia: string, anno: number): string {
  return `
Analizza questa delibera comunale IMU e estrai le aliquote per ${comune} (${provincia}) ${anno}.

CONTENUTO DELIBERA:
${contenutoMd}

Devi restituire un JSON con questa struttura esatta:

{
  "aliquotaOrdinaria": number,
  "aliquotaRidotta": number | null,
  "aliquotaTerrenAgricoli": number | null,
  "aliquotaTerrenEdificabili": number | null,
  "esenzioni": string[],
  "detrazioni": {
    "abitazionePrincipale": number | null
  }
}

REGOLE:
1. Le aliquote sono espresse in percentuale (es. 0.86 per 0,86%)
2. Se un'aliquota non è presente, usa null
3. Per esenzioni, lista le categorie o condizioni (es. ["abitazione principale", "enti non commerciali"])
4. Per detrazioni abitazione principale, indica l'importo in euro o null
5. Cerca parole chiave: "aliquota", "IMU", "terreni", "edificabili", "agricoli", "detrazione"
6. Rispondi SOLO con il JSON valido, senza commenti

JSON:`;
} 