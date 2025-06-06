# ✏️ Funzione: editImmobile

## 🧭 Scopo

Permettere all’utente di modificare qualsiasi dato relativo a un immobile (fabbricato o terreno) all’interno di un progetto, sia per correggere errori di estrazione che per completare o inserire informazioni manualmente.

## 📥 Input

type EditImmobileInput = {
  projectId: string;
  immobileId: string;
  updates: Partial<ImmobileEstratto>;
};

## 📤 Output

type EditImmobileOutput = {
  success: boolean;
  updated: ImmobileEstratto;
};

## 🔁 Passaggi

1. Verificare che l’immobile esista e appartenga al progetto dell’utente autenticato

2. Validare i campi modificabili in base al tipo (fabbricato o terreno)

3. Salvare l’immobile aggiornato in Supabase

4. Restituire i dati aggiornati all’interfaccia

## ✍️ Campi modificabili

Tutti i seguenti campi sono modificabili:

# Campi comuni (fabbricati e terreni):

- uso: "abitazione" | "pertinenza" | "terreno_agricolo" | "terreno_edificabile" | null

- categoria: es. "A/2", "C/6", "seminativo", "uliveto"

- classe: string

- identificativo: { foglio, particella, subalterno?, comune }

# Solo per fabbricati:

- rendita: number

# Solo per terreni:

- redditoDominicale: number

## 💡 Note aggiuntive

- Il campo uso parte sempre da null, e va aggiornato esplicitamente dall’utente

- Le modifiche aggiornano in tempo reale il progetto e possono influire sul calcolo IMU

- Dopo ogni modifica, il sistema può mostrare all’utente il nuovo importo IMU ricalcolato

- Non è necessario distinguere tra immobile inserito manualmente o estratto da AI