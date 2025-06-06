# 💾 Funzione: saveProject

## 🧭 Scopo

Creare un nuovo progetto di calcolo IMU, oppure aggiornare un progetto esistente.  
Un progetto rappresenta l’insieme di immobili (fabbricati o terreni) per cui l’utente vuole calcolare l’IMU.

## 🛠️ Descrizione operativa

La funzione viene chiamata quando:

- L’utente carica la prima visura e si genera un progetto
- L’utente modifica manualmente immobili o condizioni d’uso
- L’utente rinomina il progetto

## 📥 Input

type SaveProjectInput = {
  id?: string; // se presente, aggiorna progetto esistente
  email?: string; // usata solo alla creazione
  nome: string;
  immobili: ImmobileEstratto[]; // array di fabbricati e terreni
};

## 📤 Output
projectId: ID univoco del progetto salvato o aggiornato

## 🔁 Passaggi
Se id è presente:

- Caricare il progetto esistente e aggiornarlo (nome, immobili, timestamp)

Se id non è presente:

- Creare nuovo progetto

- Collegare email (se presente) per consentire login e recupero

- Salvare gli immobili collegati come JSON in una colonna dedicata

- Aggiornare updated_at per il progetto

## 🧠 Considerazioni
Ogni progetto è legato a un utente tramite la tabella users

Gli immobili vengono salvati in un campo JSONB oppure in una tabella relazionale (in base a implementazione)

La mail serve a creare l’entry user se non esiste già

##📄 Esempio di struttura progetto (semplificata)

ts
Copia
Modifica
type Project = {
  id: string;
  user_id: string;
  nome: string;
  immobili: ImmobileEstratto[]; // o collegati via FK
  created_at: string;
  updated_at: string;
};