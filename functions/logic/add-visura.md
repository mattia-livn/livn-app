# 📎 Funzione: addVisuraToProject

## 🧭 Scopo

Permettere all’utente di aggiungere una nuova visura catastale a un progetto esistente, caricare il file su Supabase Storage, estrarre i dati immobiliari tramite AI, e integrarli al progetto attuale.

## 📥 Input

type AddVisuraInput = {
  projectId: string;
  file: File; // visura catastale in PDF
};

## 📤 Output

type AddVisuraOutput = {
  success: boolean;
  immobiliEstratti: ImmobileEstratto[];
};

## 🔁 Passaggi

1. Caricare il file PDF nel bucket uploads su Supabase Storage

2. Ottenere l’URL pubblico (fileUrl)

3. Usare una libreria di parsing (es. pdf-parse) per ottenere il testo grezzo

4. Costruire un prompt ed estrarre i dati con OpenAI

5. Normalizzare i dati in array di ImmobileEstratto

6. Associare i nuovi immobili al progetto

7. Restituire l’elenco estratto per eventuale modifica da parte dell’utente

## ✍️ Considerazioni importanti

- Il progetto può contenere più visure, ciascuna con più immobili

- Non c’è distinzione tra immobili provenienti da visure diverse

- Il sistema non salva metadati sulla visura, solo gli immobili estratti

- I dati possono essere modificati subito dopo l’estrazione

## ⚠️ Errori da gestire

- File troppo pesante o non leggibile

- Parsing fallito → fallback a inserimento manuale

- Risposte dell’AI incoerenti o nulle → avvisare l’utente

- Formato non PDF → bloccare il caricamento
