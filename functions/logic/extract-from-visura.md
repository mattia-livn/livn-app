# 📄 Funzione: extractFromVisura

## 🧭 Scopo

Estrarre automaticamente i dati rilevanti da una visura catastale PDF utilizzando un LLM (OpenAI GPT), partendo dal file caricato su Supabase.

## 🛠️ Descrizione operativa

La funzione recupera il contenuto testuale del PDF e lo passa a un prompt specializzato per identificare immobili e terreni.  
L’output sarà una struttura normalizzata di dati pronti per il calcolo IMU.

## 📥 Input

- `fileUrl`: URL pubblico al file PDF caricato nel bucket Supabase
- `projectId`: ID del progetto a cui associare i dati estratti

## 🧾 Output

Un array di immobili con la seguente struttura semplificata:

type ImmobileEstratto = {
  tipo: "fabbricato" | "terreno";
  identificativo: {
    foglio: string;
    particella: string;
    subalterno?: string;
    comune: string;
  };
  rendita?: number; // solo per fabbricati
  redditoDominicale?: number; // solo per terreni
  categoria?: string; // es. A/2, C/6 (fabbricati) oppure qualità catastale (terreni)
  classe?: string;
  uso: "abitazione" | "pertinenza" | "terreno_agricolo" | "terreno_edificabile" | null;
};

## 🔁 Passaggi
Scaricare il contenuto del PDF dal fileUrl

- Usare una libreria di estrazione (es. pdf-parse) per ricavare il testo grezzo

- Costruire un prompt e inviarlo a OpenAI

- Ricevere i dati normalizzati e associarli al progetto

- Consentire modifica manuale da parte dell’utente

## ⚠️ Note aggiuntive
Se il testo è malformato, fornire fallback di errore per caricamento manuale

È importante distinguere correttamente fabbricati da terreni

Tutti i terreni vanno inizialmente considerati agricoli (uso: null)