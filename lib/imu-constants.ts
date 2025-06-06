// Moltiplicatori catastali per categoria
export const MOLTIPLICATORI_CATASTALI: Record<string, number> = {
  // Gruppo A - Abitazioni (esclusa A/10)
  'A/1': 160, 'A/2': 160, 'A/3': 160, 'A/4': 160, 'A/5': 160,
  'A/6': 160, 'A/7': 160, 'A/8': 160, 'A/9': 160, 'A/11': 160,
  
  // A/10 - Uffici e studi privati
  'A/10': 80,
  
  // Gruppo B - Edifici collettivi
  'B/1': 140, 'B/2': 140, 'B/3': 140, 'B/4': 140,
  'B/5': 140, 'B/6': 140, 'B/7': 140, 'B/8': 140,
  
  // Gruppo C
  'C/1': 55,                    // Negozi e botteghe
  'C/2': 160, 'C/6': 160, 'C/7': 160,  // Pertinenze
  'C/3': 140, 'C/4': 140, 'C/5': 140,
  
  // Gruppo D
  'D/1': 65, 'D/2': 65, 'D/3': 65, 'D/4': 65, 'D/6': 65,
  'D/7': 65, 'D/8': 65, 'D/9': 65,
  'D/5': 80,    // Istituti credito
  'D/10': 40,   // Fabbricati rurali
  
  // Gruppo E
  'E/1': 80, 'E/2': 80, 'E/3': 80, 'E/4': 80,
  'E/5': 80, 'E/6': 80, 'E/7': 80, 'E/8': 80, 'E/9': 80
};

// Coefficienti per terreni
export const COEFFICIENTE_RIVALUTAZIONE_RENDITA = 1.05; // +5%
export const COEFFICIENTE_RIVALUTAZIONE_TERRENI = 1.25;  // +25%
export const MOLTIPLICATORE_TERRENI = 135;

// Categorie di lusso (pagano IMU anche come abitazione principale)
export const CATEGORIE_LUSSO = ['A/1', 'A/8', 'A/9'];

// Pertinenze (max una per categoria come abitazione principale)
export const CATEGORIE_PERTINENZE = ['C/2', 'C/6', 'C/7'];

// Detrazione fissa per abitazioni principali di lusso
export const DETRAZIONE_ABITAZIONE_LUSSO = 200;

// Qualità dei terreni agricoli
export const QUALITA_TERRENI = [
  'Acquacoltura', 'Arboreto da legno', 'Arboricoltura da legno',
  'Bosco ceduo', 'Bosco misto', 'Bosco di alto fusto', 'Castagneto',
  'Coltura promiscua', 'Frutteto', 'Frutteto irriguo', 'Incolto produttivo',
  'Incolto sterile', 'Orticello', 'Orto irriguo', 'Pascolo',
  'Pascolo arborato', 'Pascolo cespugliato', 'Pascolo cespugliato arborato',
  'Prato', 'Prato arborato', 'Prato cespugliato', 'Prato cespugliato arborato',
  'Querceto', 'Risaia', 'Seminativo', 'Seminativo arborato',
  'Seminativo irriguo', 'Uliveto', 'Uliveto arborato', 'Uliveto irriguo',
  'Vigneto', 'Vigneto arborato', 'Vigneto irriguo'
];

// Funzione helper per ottenere il moltiplicatore
export function getMoltiplicatore(categoria: string): number {
  return MOLTIPLICATORI_CATASTALI[categoria] || 160; // default gruppo A
}

// Funzione helper per verificare se è categoria di lusso
export function isCategoriaLusso(categoria: string): boolean {
  return CATEGORIE_LUSSO.includes(categoria);
}

// Funzione helper per verificare se è pertinenza
export function isPertinenza(categoria: string): boolean {
  return CATEGORIE_PERTINENZE.includes(categoria);
} 