// Tipi per l'identificativo catastale
export interface IdentificativoCatastale {
  foglio: string;
  particella: string;
  subalterno?: string;
  comune: string;
  provincia?: string;
}

// Tipo per immobili estratti da visura
export interface ImmobileEstratto {
  id?: string;
  tipo: "fabbricato" | "terreno";
  identificativo: IdentificativoCatastale;
  rendita?: number; // solo per fabbricati
  redditoDominicale?: number; // solo per terreni
  categoria?: string; // es. A/2, C/6 per fabbricati; qualità per terreni
  classe?: string;
  uso: "abitazione" | "pertinenza" | "terreno_agricolo" | "terreno_edificabile" | null;
  superficie?: number; // per terreni
}

// Tipo per progetto IMU
export interface ProjectIMU {
  id: string;
  user_id?: string;
  nome: string;
  email?: string;
  immobili: ImmobileEstratto[];
  created_at: string;
  updated_at: string;
}

// Tipo per aliquote comunali
export interface AliquotaIMU {
  comune: string;
  provincia: string;
  anno: number;
  aliquotaOrdinaria: number;
  aliquotaRidotta?: number;
  aliquotaTerrenAgricoli?: number;
  aliquotaTerrenEdificabili?: number;
  esenzioni?: string[];
  detrazioni?: {
    abitazionePrincipale?: number;
  };
}

// Tipo per risultato calcolo IMU
export interface RisultatoCalcoloIMU {
  immobile: ImmobileEstratto;
  baseImponibile: number;
  aliquota: number;
  importo: number;
  esente: boolean;
  motivazioneEsenzione?: string;
}

// Input/Output per le funzioni API
export interface SaveProjectInput {
  id?: string;
  email?: string;
  nome: string;
  immobili: ImmobileEstratto[];
}

export interface CalculateIMUInput {
  immobili: ImmobileEstratto[];
  aliquote: AliquotaIMU[];
  anno: number;
}

export interface CalculateIMUOutput {
  risultati: RisultatoCalcoloIMU[];
  totale: number;
}

export interface DeleteImmobileInput {
  projectId: string;
  immobileId: string;
}

export interface EditImmobileInput {
  projectId: string;
  immobileId: string;
  updates: Partial<ImmobileEstratto>;
}

export interface AddVisuraInput {
  projectId: string;
  file: File;
}

export interface SendEmailLinkInput {
  email: string;
  projectId: string;
} 