# 🧮 Funzione: calculateIMU

## 🧭 Scopo

Calcolare l’importo IMU da pagare per ogni immobile in un progetto e il totale complessivo.  
Il calcolo si basa su:

- la rendita catastale o il reddito dominicale
- l’uso dell’immobile (es. abitazione, pertinenza, terreno agricolo)
- le aliquote comunali

## 📥 Input

type CalculateIMUInput = {
  immobili: ImmobileEstratto[];
  aliquote: AliquotaIMU[];
  anno: number;
};

## 📤 Output

type CalculateIMUOutput = {
  risultati: {
    immobile: ImmobileEstratto;
    baseImponibile: number;
    aliquota: number;
    importo: number;
    esente: boolean;
    motivazioneEsenzione?: string;
  }[];
  totale: number;
};

## 🔁 Passaggi

- Per ogni immobile:

-- Calcolare la base imponibile:

--- Fabbricati → rendita × 1.05 × 160 (gruppo A/C)

--- Terreni agricoli → reddito dominicale × 1.25 × 135

--- Terreni edificabili → valore venale (richiesto)

-- Applicare l’aliquota corretta (cercata in base al comune e all’uso)

-- Valutare esenzioni (es. abitazione principale, CD/IAP, comuni montani)

- Sommare tutti gli importi

- Restituire i risultati per immobile + totale

## 💡 Note aggiuntive

- Se un’aliquota non viene trovata, l’immobile va segnalato come non calcolabile

- Le pertinenze agevolate devono essere riconosciute (una sola per categoria C/2, C/6, C/7)

- Le esenzioni devono essere spiegate nel campo motivazioneEsenzione

## 📄 Esempio di risultato per un fabbricato

{
  immobile: { ... },
  baseImponibile: 10500,
  aliquota: 0.0106,
  importo: 111.3,
  esente: false
}