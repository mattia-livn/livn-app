# load-aliquote-from-md.md

## Purpose
Leggere i prospetti IMU comunali salvati in formato Markdown all’interno della cartella `/statements/2025/` nella repository.

Questi prospetti contengono le aliquote ufficiali deliberate dai Comuni, da utilizzare nel calcolo IMU per ogni immobile.

## Input
- Nome del Comune, sigla provincia, anno di riferimento (es. `"torinoTO2025"`)
- Dati dell’immobile: categoria catastale, uso (es. abitazione principale, terreno edificabile), ecc.

## Output
Aliquota IMU applicabile all’immobile, in percentuale.

## Passaggi
1. Costruire il percorso del file corrispondente:  
   `/statements/2025/{NomeComune}{siglaProvincia}{anno}.md`

2. Leggere il contenuto del file Markdown (es. `Torino_TO_L219.md`)

3. Analizzare il testo tramite OpenAI per identificare:
   - Aliquota ordinaria
   - Aliquota ridotta (es. per canone concordato)
   - Aliquota per terreni agricoli / edificabili
   - Eventuali esenzioni o assimilazioni

4. Restituire l’aliquota corretta in base al contesto dell’immobile

5. In caso di ambiguità o più alternative, restituire tutte le opzioni con spiegazione e chiedere conferma all’utente

## Note aggiuntive
- I file Markdown sono versionati e aggiornabili direttamente nel repository.
- Se il file del Comune non esiste, mostrare errore e suggerire caricamento manuale.
- Nessun dato viene letto da Supabase: tutto è contenuto nella repo locale.
