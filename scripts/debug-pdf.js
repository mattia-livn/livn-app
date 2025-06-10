#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function debugPDF() {
  const filePath = path.join(__dirname, '../statements/pdf/torino.pdf');
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);
  
  const text = pdfData.text;
  console.log('=== TESTO COMPLETO DEL PDF ===');
  console.log(text);
  console.log('\n=== FINE TESTO ===');
  
  console.log('\n=== ANALISI RIGHE ===');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const hasPercentage = line.match(/\d+(?:[,.]?\d+)?%/);
    console.log(`${i.toString().padStart(3, '0')}: ${hasPercentage ? '💰' : '📄'} "${line}"`);
  });
}

debugPDF().catch(console.error); 