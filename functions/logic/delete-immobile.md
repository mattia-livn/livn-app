# 🗑️ Funzione: deleteImmobile

## 🧭 Scopo

Permettere all’utente di rimuovere un immobile specifico (fabbricato o terreno) da un progetto IMU esistente.

## 📥 Input

type DeleteImmobileInput = {
  projectId: string;
  immobileId: string;
};

## 📤 Output

type DeleteImmobileOutput = {
  success: boolean;
};

## 🔁 Passaggi

1. Verificare che l’immobile appartenga effettivamente al progetto indicato

2. Verificare che il progetto appartenga all’utente autenticato

3. Eliminare l’immobile dal database (non soft delete)

4. Aggiornare l’importo IMU calcolato (se necessario)

5. Restituire conferma all’interfaccia

## ❗ Requisiti

- Un progetto può avere zero o più immobili

- Se tutti gli immobili vengono eliminati, il progetto rimane valido ma non calcolabile

## 🧠 Considerazioni aggiuntive

- Se l’immobile è stato estratto da una visura, la cancellazione non ha impatti sul file originale

- L’operazione è irreversibile (no undo)

- È consigliabile mostrare un modale di conferma all’utente

## 🔐 Sicurezza

- La funzione deve validare che l’utente corrente sia proprietario del progetto

- Nessun altro utente deve poter rimuovere immobili da progetti altrui




