# 📁 Funzione: uploadVisura

## Scopo
Permette a un utente autenticato di caricare un file PDF contenente una visura catastale, associandolo a un progetto esistente.

## Descrizione operativa
La funzione carica il file su Supabase Storage, nel bucket `uploads`.

Il file viene rinominato in modo univoco per evitare sovrascritture e per tracciabilità.

## Input
- `file`: oggetto `File` (PDF della visura)
- `projectId`: stringa UUID del progetto a cui associare il file
- `userId`: stringa UUID dell’utente (opzionale se già noto in sessione)

## Output
- URL pubblico del file su Supabase
- `id` del file, se salvato anche in una tabella `uploaded_files` (opzionale)

## Regole di validazione
- Il file deve essere un PDF (`.pdf`)
- Max size: 10MB
- L’utente deve essere autenticato
- L’utente deve essere owner del `projectId` passato

## Logica di salvataggio
- Path: `uploads/visura-{projectId}-{timestamp}.pdf`
- Es: `uploads/visura-ca18b3f1-...-2025-06-06T13-22-00.pdf`

## Note aggiuntive
- Il bucket `uploads` deve avere una policy RLS che consente upload solo all’owner del progetto.
- Il link generato potrà essere usato per l’estrazione del testo con AI.
