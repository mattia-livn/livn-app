# export-report.md

## Purpose
Genera un report PDF riepilogativo del progetto IMU, includendo i dati catastali, le condizioni dichiarate dall’utente e l’importo IMU calcolato per ciascun immobile.

## Input
- `projectId: string` → ID del progetto da esportare

## Output
- Un file PDF generato dinamicamente e salvato temporaneamente (es. su Supabase Storage o Vercel blob storage)
- Un URL di download accessibile per X minuti

## Passaggi
1. Caricare i dati del progetto tramite `projectId`, inclusi:
   - Lista immobili (`tipo`, `categoria`, `rendita`, `redditoDominicale`, `uso`)
   - Condizioni dichiarate dall’utente
   - Risultato del calcolo IMU (per immobile + totale)

2. Costruire un layout HTML con i seguenti blocchi:
   - **Intestazione**: nome progetto, data creazione, email utente (se disponibile)
   - **Tabella immobili**: con tutti i dettagli e importo IMU
   - **Totale complessivo**
   - **Note**: eventuali esenzioni, condizioni speciali, disclaimer

3. Usare una libreria come `@react-pdf/renderer` o `puppeteer` per convertire l’HTML in PDF

4. Salvare il PDF su uno storage temporaneo (es. Supabase bucket `reports`) o restituirlo in streaming

5. Restituire una risposta JSON con:
 
   {
     downloadUrl: string;
     expiresAt: string; // timestamp di scadenza link
   }

# Considerazioni

- Il report non deve contenere dati sensibili oltre a quelli mostrati a schermo

- Se possibile, includere anche il logo Livn e uno stile coerente con l’interfaccia

- In futuro si potrà aggiungere:
    - Firma digitale
    - Esportazione CSV
    - pload automatico in cartelle utente
