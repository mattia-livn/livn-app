import { NextRequest, NextResponse } from 'next/server';
import { 
  CalculateIMUInput, 
  CalculateIMUOutput, 
  ImmobileEstratto, 
  RisultatoCalcoloIMU,
  AliquotaIMU 
} from '@/lib/types';
import {
  getMoltiplicatore,
  isCategoriaLusso,
  isPertinenza,
  COEFFICIENTE_RIVALUTAZIONE_RENDITA,
  COEFFICIENTE_RIVALUTAZIONE_TERRENI,
  MOLTIPLICATORE_TERRENI,
  DETRAZIONE_ABITAZIONE_LUSSO
} from '@/lib/imu-constants';

export async function POST(request: NextRequest) {
  try {
    const body: CalculateIMUInput = await request.json();
    const { immobili, aliquote } = body;

    const risultati: RisultatoCalcoloIMU[] = [];
    let totale = 0;

    // Conteggio pertinenze per abitazione principale
    const pertinenzePrincipali: Record<string, number> = {};

    for (const immobile of immobili) {
      const risultato = calcolaIMUPerImmobile(immobile, aliquote, pertinenzePrincipali);
      risultati.push(risultato);
      totale += risultato.importo;
    }

    const output: CalculateIMUOutput = {
      risultati,
      totale: Math.round(totale * 100) / 100 // arrotonda a 2 decimali
    };

    return NextResponse.json(output);

  } catch (error) {
    console.error('Errore nel calcolo IMU:', error);
    return NextResponse.json(
      { error: 'Errore interno nel calcolo IMU' },
      { status: 500 }
    );
  }
}

function calcolaIMUPerImmobile(
  immobile: ImmobileEstratto, 
  aliquote: AliquotaIMU[],
  pertinenzePrincipali: Record<string, number>
): RisultatoCalcoloIMU {
  
  // Trova l'aliquota per il comune dell'immobile
  const aliquotaComune = aliquote.find(a => 
    a.comune.toLowerCase() === immobile.identificativo.comune.toLowerCase()
  );

  if (!aliquotaComune) {
    return {
      immobile,
      baseImponibile: 0,
      aliquota: 0,
      importo: 0,
      esente: false,
      motivazioneEsenzione: 'Aliquota non trovata per questo comune'
    };
  }

  // Calcola base imponibile
  let baseImponibile = 0;
  
  if (immobile.tipo === 'fabbricato') {
    if (!immobile.rendita || immobile.rendita <= 0) {
      return {
        immobile,
        baseImponibile: 0,
        aliquota: 0,
        importo: 0,
        esente: false,
        motivazioneEsenzione: 'Rendita catastale mancante o non valida'
      };
    }

    const renditaRivalutata = immobile.rendita * COEFFICIENTE_RIVALUTAZIONE_RENDITA;
    const moltiplicatore = getMoltiplicatore(immobile.categoria || '');
    baseImponibile = renditaRivalutata * moltiplicatore;

  } else if (immobile.tipo === 'terreno') {
    if (immobile.uso === 'terreno_agricolo') {
      if (!immobile.redditoDominicale || immobile.redditoDominicale <= 0) {
        return {
          immobile,
          baseImponibile: 0,
          aliquota: 0,
          importo: 0,
          esente: false,
          motivazioneEsenzione: 'Reddito dominicale mancante o non valido'
        };
      }
      baseImponibile = immobile.redditoDominicale * COEFFICIENTE_RIVALUTAZIONE_TERRENI * MOLTIPLICATORE_TERRENI;
    } else {
      // Terreno edificabile - richiederebbe valore venale
      return {
        immobile,
        baseImponibile: 0,
        aliquota: 0,
        importo: 0,
        esente: false,
        motivazioneEsenzione: 'Per i terreni edificabili è necessario indicare il valore venale di mercato'
      };
    }
  }

  // Determina se è esente
  const esenzione = verificaEsenzione(immobile, pertinenzePrincipali);
  if (esenzione.esente) {
    return {
      immobile,
      baseImponibile,
      aliquota: 0,
      importo: 0,
      esente: true,
      motivazioneEsenzione: esenzione.motivo
    };
  }

  // Determina aliquota da applicare
  let aliquotaDaApplicare = aliquotaComune.aliquotaOrdinaria;

  if (immobile.tipo === 'terreno' && immobile.uso === 'terreno_agricolo') {
    aliquotaDaApplicare = aliquotaComune.aliquotaTerrenAgricoli || aliquotaComune.aliquotaOrdinaria;
  } else if (immobile.tipo === 'terreno' && immobile.uso === 'terreno_edificabile') {
    aliquotaDaApplicare = aliquotaComune.aliquotaTerrenEdificabili || aliquotaComune.aliquotaOrdinaria;
  }

  // Calcola IMU
  let importo = baseImponibile * aliquotaDaApplicare / 100;

  // Applica detrazione per abitazione principale di lusso
  if (immobile.uso === 'abitazione' && 
      immobile.categoria && 
      isCategoriaLusso(immobile.categoria)) {
    importo = Math.max(0, importo - DETRAZIONE_ABITAZIONE_LUSSO);
  }

  return {
    immobile,
    baseImponibile: Math.round(baseImponibile * 100) / 100,
    aliquota: aliquotaDaApplicare,
    importo: Math.round(importo * 100) / 100,
    esente: false
  };
}

function verificaEsenzione(
  immobile: ImmobileEstratto,
  pertinenzePrincipali: Record<string, number>
): { esente: boolean; motivo?: string } {
  
  // Abitazione principale non di lusso
  if (immobile.uso === 'abitazione' && 
      immobile.categoria && 
      !isCategoriaLusso(immobile.categoria)) {
    return { esente: true, motivo: 'Abitazione principale non di lusso' };
  }

  // Pertinenza dell'abitazione principale (max una per categoria)
  if (immobile.uso === 'pertinenza' && 
      immobile.categoria && 
      isPertinenza(immobile.categoria)) {
    
    const count = pertinenzePrincipali[immobile.categoria] || 0;
    
    if (count === 0) {
      pertinenzePrincipali[immobile.categoria] = 1;
      return { esente: true, motivo: 'Pertinenza dell\'abitazione principale' };
    } else {
      return { esente: false, motivo: 'Pertinenza aggiuntiva (solo una per categoria è esente)' };
    }
  }

  return { esente: false };
} 