#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Percorsi
const PDF_DIR = path.join(__dirname, '../statements/pdf');
const OUTPUT_DIR = path.join(__dirname, '../statements/markdown');

// Crea la cartella di output se non esiste
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Estrae il nome del comune dal testo
 */
function extractComune(text) {
  // Prima cerca "Comune di NOME" - questo è il pattern più affidabile
  const comuneMatch = text.match(/Comune di\s+([A-ZÀÈÉÌÍÎÏÒÓÔÙÚÛÜ\s-']+)/i);
  if (comuneMatch) {
    let comune = comuneMatch[1].trim().toLowerCase()
      // Rimuovi suffissi comuni nei PDF
      .replace(/\s*-?\s*id\s+prospetto.*$/i, '')
      .replace(/\s*prospetto.*$/i, '')
      .replace(/\s*riferito.*$/i, '')
      // Normalizza caratteri
      .replace(/\s+/g, '-')
      .replace(/[àáâäã]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôöõ]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      // Rimuovi caratteri speciali
      .replace(/[^a-z0-9-]/g, '')
      // Rimuovi trattini multipli
      .replace(/-+/g, '-')
      // Rimuovi trattini all'inizio e alla fine
      .replace(/^-|-$/g, '');
    
    return comune;
  }
  return null;
}

/**
 * Estrae l'anno di riferimento
 */
function extractAnno(text) {
  const annoMatch = text.match(/riferito all'anno\s+(\d{4})/i) || 
                   text.match(/anno\s+(\d{4})/i);
  return annoMatch ? parseInt(annoMatch[1]) : new Date().getFullYear();
}

/**
 * Estrae la delibera di approvazione
 */
function extractDelibera(text) {
  const deliberaMatch = text.match(/delibera\s+n[°.\s]*(\d+)\s+del\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);
  return deliberaMatch ? {
    numero: deliberaMatch[1],
    data: deliberaMatch[2]
  } : null;
}

/**
 * Estrae le aliquote dal testo scansionando tutto il documento per trovare tutte le percentuali e i loro blocchi di testo associati.
 */
function extractAliquote(text) {
  const aliquote = [];
  const lines = text.split('\n');

  console.log(`🔍 Scansionando ${lines.length} righe per trovare percentuali...`);

  // Scansiona tutto il documento riga per riga
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const percentageMatch = line.match(/^(\d+(?:[,.]?\d+)?%)$/);
    
    if (percentageMatch) {
      console.log(`🎯 Trovata percentuale: ${percentageMatch[1]} alla riga ${i}`);
      
      // Risali e prendi tutte le righe sopra fino a una riga vuota, una percentuale precedente, o massimo 10 righe
      let blocco = [];
      let j = i - 1;
      let rigeRaccolte = 0;
      let rigeVuoteConsecutive = 0;
      const maxRighe = 15; // Aumentato il limite
      const maxRigheVuote = 2; // Massimo 2 righe vuote consecutive prima di ferma
      
      while (j >= 0 && rigeRaccolte < maxRighe) {
        const rigaPrecedente = lines[j].trim();
        
        // Se trova una riga vuota
        if (rigaPrecedente === '') {
          rigeVuoteConsecutive++;
          // Se ha già trovato del testo e incontra troppe righe vuote, ferma
          if (blocco.length > 0 && rigeVuoteConsecutive >= maxRigheVuote) {
            break;
          }
          // Altrimenti continua a cercare saltando la riga vuota
          j--;
          continue;
        } else {
          rigeVuoteConsecutive = 0; // Reset del contatore righe vuote
        }
        
        // Ferma se trova un'altra percentuale
        if (rigaPrecedente.match(/^(\d+(?:[,.]?\d+)?%)$/)) {
          break;
        }
        
        // Ferma se trova righe di intestazione del documento
        if (rigaPrecedente.toLowerCase().includes('comune di') || 
            rigaPrecedente.toLowerCase().includes('prospetto') ||
            rigaPrecedente.toLowerCase().includes('aliquote imu') ||
            rigaPrecedente.toLowerCase().includes('delibera') ||
            rigaPrecedente.toLowerCase().includes('ai sensi dell')) {
          break;
        }
        
        blocco.unshift(lines[j]);
        j--;
        rigeRaccolte++;
      }
      
      // Pulisce il blocco rimuovendo righe vuote all'inizio e alla fine
      blocco = blocco.map(r => r.trim()).filter(r => r.length > 0);
      
      if (blocco.length > 0) {
        const categoria = blocco.join('\n');
        console.log(`📝 Categoria estratta (${blocco.length} righe): ${categoria.substring(0, 100)}...`);
        
        aliquote.push({
          categoria,
          descrizione: categoria,
          descrizioneCompleta: categoria,
          percentuale: percentageMatch[1]
        });
      } else {
        console.log(`⚠️  Nessun testo trovato sopra la percentuale ${percentageMatch[1]}`);
        
        // Se non c'è testo sopra, prova a usare la riga immediatamente precedente se non vuota
        if (i > 0 && lines[i-1].trim() !== '') {
          const categoriaFallback = lines[i-1].trim();
          aliquote.push({
            categoria: categoriaFallback,
            descrizione: categoriaFallback,
            descrizioneCompleta: categoriaFallback,
            percentuale: percentageMatch[1]
          });
          console.log(`📝 Usata riga precedente come fallback: ${categoriaFallback}`);
        }
      }
    }
  }
  
  console.log(`✅ Trovate ${aliquote.length} aliquote totali`);
  return aliquote;
}

/**
 * Estrae le esenzioni e agevolazioni
 */
function extractEsenzioni(text) {
  const esenzioni = [];
  
  // Cerca la sezione esenzioni
  const esenzioniMatch = text.match(/Elenco esenzioni[\s\S]*?(?=Precisazioni|Documento generato|$)/i);
  if (esenzioniMatch) {
    const esenzioniText = esenzioniMatch[0];
    
    // Dividi per punti elenco o trattini
    const items = esenzioniText.split(/[-•]\s*/).filter(item => item.trim().length > 10);
    
    items.forEach(item => {
      const cleanItem = item.replace(/\s+/g, ' ').trim();
      if (cleanItem && !cleanItem.toLowerCase().includes('elenco esenzioni')) {
        esenzioni.push(cleanItem);
      }
    });
  }
  
  return esenzioni;
}

/**
 * Estrae le precisazioni
 */
function extractPrecisazioni(text) {
  const precisazioni = [];
  
  // Cerca la sezione precisazioni
  const precisazioniMatch = text.match(/Precisazioni([\s\S]*?)(?=Documento generato|$)/i);
  if (precisazioniMatch) {
    const precisazioniText = precisazioniMatch[1];
    
    // Dividi per paragrafi
    const paragraphs = precisazioniText.split(/\n\s*\n/).filter(p => p.trim().length > 10);
    
    paragraphs.forEach(paragraph => {
      const cleanParagraph = paragraph.replace(/\s+/g, ' ').trim();
      if (cleanParagraph) {
        precisazioni.push(cleanParagraph);
      }
    });
  }
  
  return precisazioni;
}

/**
 * Estrae informazioni aggiuntive (assimilazioni, condizioni speciali, etc)
 */
function extractInformazioniAggiuntive(text) {
  const info = [];
  
  // Cerca assimilazioni
  const assimilazioneMatch = text.match(/Assimilazione.*?SI|NO/i);
  if (assimilazioneMatch) {
    info.push({
      tipo: 'Assimilazione',
      contenuto: assimilazioneMatch[0].replace(/\s+/g, ' ').trim()
    });
  }
  
  // Cerca informazioni su fusioni/incorporazioni
  const fusioneMatch = text.match(/Comune oggetto di fusione.*?(?:SI|NO)/i);
  if (fusioneMatch) {
    info.push({
      tipo: 'Fusione/Incorporazione',
      contenuto: fusioneMatch[0].replace(/\s+/g, ' ').trim()
    });
  }
  
  return info;
}

/**
 * Estrae le detrazioni
 */
function extractDetrazioni(text) {
  const detrazioni = {};

  // Pattern per detrazioni
  const patterns = [
    {
      key: 'abitazione_principale',
      pattern: /detrazione.*?abitazione principale.*?€?\s*(\d+(?:[,.]?\d+)?)/i
    },
    {
      key: 'per_figlio',
      pattern: /detrazione.*?figli.*?€?\s*(\d+(?:[,.]?\d+)?)/i
    }
  ];

  patterns.forEach(({ key, pattern }) => {
    const match = text.match(pattern);
    if (match) {
      detrazioni[key] = parseFloat(match[1].replace(',', '.'));
    }
  });

  return detrazioni;
}

/**
 * Genera il contenuto markdown completo
 */
function generateMarkdown(data) {
  let markdown = `# IMU ${data.anno} - ${data.comune.toUpperCase()}

## Informazioni Generali

- **Comune**: ${data.comune.replace(/-/g, ' ').toUpperCase()}
- **Anno**: ${data.anno}
`;

  if (data.delibera) {
    markdown += `- **Delibera**: n. ${data.delibera.numero} del ${data.delibera.data}
`;
  }

  // Informazioni aggiuntive
  if (data.informazioniAggiuntive && data.informazioniAggiuntive.length > 0) {
    markdown += `
## Informazioni Aggiuntive

`;
    data.informazioniAggiuntive.forEach(info => {
      markdown += `### ${info.tipo}
${info.contenuto}

`;
    });
  }

  // Aliquote
  if (data.aliquote && data.aliquote.length > 0) {
    markdown += `
## Aliquote IMU

| Categoria | Descrizione | Aliquota |
|-----------|-------------|----------|
`;

    data.aliquote.forEach(aliquota => {
      const categoria = aliquota.categoria.length > 60 ? 
        aliquota.categoria.substring(0, 60) + '...' : 
        aliquota.categoria;
      const descrizione = aliquota.descrizione.length > 80 ? 
        aliquota.descrizione.substring(0, 80) + '...' : 
        aliquota.descrizione;
      markdown += `| ${categoria} | ${descrizione} | ${aliquota.percentuale} |\n`;
    });

    // Dettagli completi delle aliquote
    markdown += `
### Dettaglio Completo Aliquote

`;
    data.aliquote.forEach((aliquota, index) => {
      markdown += `#### ${index + 1}. ${aliquota.percentuale} - ${aliquota.categoria}

**Descrizione completa:**
${aliquota.descrizioneCompleta}

`;
    });
  } else {
    markdown += `
## Aliquote IMU

⚠️ **Aliquote non estratte automaticamente**

Le aliquote non sono state estratte automaticamente dal PDF. 
Consultare il documento originale per i valori esatti.
`;
  }

  // Detrazioni
  if (Object.keys(data.detrazioni).length > 0) {
    markdown += `
## Detrazioni

| Tipo | Importo |
|------|---------|
`;
    Object.entries(data.detrazioni).forEach(([key, value]) => {
      markdown += `| ${key.replace(/_/g, ' ')} | €${value} |\n`;
    });
  }

  // Esenzioni
  if (data.esenzioni && data.esenzioni.length > 0) {
    markdown += `
## Esenzioni e Agevolazioni

`;
    data.esenzioni.forEach((esenzione, index) => {
      markdown += `### ${index + 1}. Esenzione

${esenzione}

`;
    });
  }

  // Precisazioni
  if (data.precisazioni && data.precisazioni.length > 0) {
    markdown += `
## Precisazioni Normative

`;
    data.precisazioni.forEach((precisazione, index) => {
      markdown += `### ${index + 1}. Precisazione

${precisazione}

`;
    });
  }

  markdown += `
## Note

- Le aliquote sono espresse in percentuale
- I valori sono estratti automaticamente dal documento ufficiale
- **In caso di discordanza prevale sempre il documento originale**
- Per informazioni complete consultare il PDF ufficiale
- Questo documento contiene tutte le informazioni estratte dal PDF originale

---
*Documento generato automaticamente da: ${data.sourceFile}*  
*Elaborato il: ${new Date().toLocaleString('it-IT')}*  
*Estratto testo completo di ${data.testoLength} caratteri*
`;

  return markdown;
}

/**
 * Elabora un singolo PDF
 */
async function processPDF(filePath) {
  try {
    console.log(`\n📄 Elaborando: ${path.basename(filePath)}`);
    
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    
    const text = pdfData.text;
    const fileName = path.basename(filePath, '.pdf');
    
    console.log(`📝 Estratto testo di ${text.length} caratteri`);
    
    // Estrai i dati
    const data = {
      sourceFile: path.basename(filePath),
      comune: extractComune(text) || fileName,
      anno: extractAnno(text),
      delibera: extractDelibera(text),
      aliquote: extractAliquote(text),
      detrazioni: extractDetrazioni(text),
      esenzioni: extractEsenzioni(text),
      precisazioni: extractPrecisazioni(text),
      informazioniAggiuntive: extractInformazioniAggiuntive(text),
      testoLength: text.length
    };

    console.log(`🏛️  Comune: ${data.comune}`);
    console.log(`📅 Anno: ${data.anno}`);
    console.log(`📋 Aliquote trovate: ${data.aliquote.length}`);
    console.log(`💰 Detrazioni trovate: ${Object.keys(data.detrazioni).length}`);
    console.log(`🛡️  Esenzioni trovate: ${data.esenzioni.length}`);
    console.log(`📝 Precisazioni trovate: ${data.precisazioni.length}`);
    console.log(`ℹ️  Info aggiuntive: ${data.informazioniAggiuntive.length}`);

    // Genera markdown
    const markdown = generateMarkdown(data);
    
    // Salva file
    const outputPath = path.join(OUTPUT_DIR, `${data.comune}-${data.anno}.md`);
    fs.writeFileSync(outputPath, markdown, 'utf8');
    
    console.log(`✅ Creato: ${path.basename(outputPath)}`);
    return data;
    
  } catch (error) {
    console.error(`❌ Errore elaborando ${path.basename(filePath)}:`, error.message);
    return null;
  }
}

/**
 * Elabora tutti i PDF nella cartella
 */
async function processAllPDFs() {
  const files = fs.readdirSync(PDF_DIR)
    .filter(file => file.endsWith('.pdf'))
    .sort();

  console.log(`🗂️  Trovati ${files.length} file PDF da elaborare...\n`);

  const results = [];
  const batchSize = 3; // Processa 3 file alla volta

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    console.log(`📦 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}: ${batch.join(', ')}`);
    
    const batchPromises = batch.map(file => 
      processPDF(path.join(PDF_DIR, file))
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(Boolean));
    
    // Pausa tra i batch
    if (i + batchSize < files.length) {
      console.log('⏳ Pausa tra batch...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Genera indice
  generateIndex(results);
  
  console.log(`\n🎉 Elaborazione completata!`);
  console.log(`📁 File markdown creati in: ${OUTPUT_DIR}`);
  console.log(`📊 Elaborati con successo: ${results.length}/${files.length} file`);
  
  // Statistiche
  const comuniConAliquote = results.filter(r => r.aliquote.length > 0).length;
  console.log(`📈 Comuni con aliquote estratte: ${comuniConAliquote}/${results.length}`);
}

/**
 * Genera un file indice con tutti i comuni
 */
function generateIndex(results) {
  let indexMarkdown = `# Indice Aliquote IMU

Elenco dei comuni con aliquote IMU disponibili.

## Statistiche

- **Totale comuni**: ${results.length}
- **Comuni con aliquote estratte**: ${results.filter(r => r.aliquote.length > 0).length}
- **Anno più comune**: ${getMostCommonYear(results)}

## Elenco Comuni

| Comune | Anno | Aliquote | File |
|--------|------|----------|------|
`;

  results
    .sort((a, b) => a.comune.localeCompare(b.comune))
    .forEach(data => {
      const fileName = `${data.comune}-${data.anno}.md`;
      const aliquoteCount = data.aliquote.length;
      const esenzioniCount = data.esenzioni ? data.esenzioni.length : 0;
      const precisazioniCount = data.precisazioni ? data.precisazioni.length : 0;
      
      const status = aliquoteCount > 0 ? `✅ ${aliquoteCount}` : '⚠️ 0';
      const extraInfo = esenzioniCount > 0 || precisazioniCount > 0 ? 
        ` (+${esenzioniCount + precisazioniCount} sezioni)` : '';
      
      indexMarkdown += `| ${data.comune.replace(/-/g, ' ').toUpperCase()} | ${data.anno} | ${status}${extraInfo} | [${fileName}](./${fileName}) |\n`;
    });

  indexMarkdown += `

## Legenda

- ✅ = Aliquote estratte automaticamente
- ⚠️ = Aliquote non estratte (consultare documento originale)
- (+N sezioni) = Esenzioni e precisazioni aggiuntive estratte

---
*Indice generato automaticamente il ${new Date().toLocaleString('it-IT')}*
`;

  const indexPath = path.join(OUTPUT_DIR, 'index.md');
  fs.writeFileSync(indexPath, indexMarkdown, 'utf8');
  console.log(`📋 Indice creato: index.md`);
}

/**
 * Trova l'anno più comune
 */
function getMostCommonYear(results) {
  const years = results.map(r => r.anno);
  const yearCounts = {};
  years.forEach(year => {
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  });
  
  return Object.keys(yearCounts).reduce((a, b) => 
    yearCounts[a] > yearCounts[b] ? a : b
  );
}

// Esegui se chiamato direttamente
if (require.main === module) {
  // Processa solo alcuni file per test se argv contiene --test
  if (process.argv.includes('--test')) {
    const testFiles = ['torino.pdf', 'milano.pdf', 'napoli.pdf'];
    console.log('🧪 Modalità test - elaborando solo alcuni file...\n');
    
    Promise.all(
      testFiles.map(file => {
        const filePath = path.join(PDF_DIR, file);
        return fs.existsSync(filePath) ? processPDF(filePath) : null;
      })
    ).then(results => {
      const validResults = results.filter(Boolean);
      generateIndex(validResults);
      console.log(`\n✅ Test completato con ${validResults.length} file`);
    }).catch(console.error);
  } else {
    processAllPDFs().catch(console.error);
  }
}

module.exports = { processPDF, processAllPDFs };