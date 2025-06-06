import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ProjectIMU } from '@/lib/types';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'ID progetto richiesto' },
        { status: 400 }
      );
    }

    // Recupera il progetto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Progetto non trovato' },
        { status: 404 }
      );
    }

    // Genera HTML per il report
    const htmlContent = generaHTMLReport(project);

    // Genera PDF con Puppeteer
    let pdfBuffer: Buffer;
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });
      
      await browser.close();
    } catch (error) {
      console.error('Errore generazione PDF:', error);
      return NextResponse.json(
        { error: 'Errore nella generazione del PDF' },
        { status: 500 }
      );
    }

    // Salva il PDF su Supabase Storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `report-${projectId}-${timestamp}.pdf`;
    const filePath = `reports/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (uploadError) {
        throw uploadError;
      }

      // Ottieni URL di download
      const { data: publicData } = supabase.storage
        .from('reports')
        .getPublicUrl(filePath);

      return NextResponse.json({
        success: true,
        downloadUrl: publicData.publicUrl,
        fileName: fileName,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ore
      });

    } catch (storageError) {
      console.error('Errore storage PDF:', storageError);
      return NextResponse.json(
        { error: 'Errore nel salvataggio del report' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Errore export report:', error);
    return NextResponse.json(
      { error: 'Errore interno nell\'export' },
      { status: 500 }
    );
  }
}

function generaHTMLReport(project: ProjectIMU): string {
  const dataCreazione = new Date(project.created_at).toLocaleDateString('it-IT');
  const immobili = project.immobili || [];

  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Report IMU - ${project.nome}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .header {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          padding: 30px;
          text-align: center;
          margin-bottom: 40px;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .header p {
          margin: 0;
          opacity: 0.9;
        }
        .content {
          padding: 0 30px;
        }
        .project-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .project-info h2 {
          margin-top: 0;
          color: #1e293b;
        }
        .immobili-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          font-size: 14px;
        }
        .immobili-table th {
          background: #e2e8f0;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border: 1px solid #cbd5e1;
        }
        .immobili-table td {
          padding: 12px;
          border: 1px solid #e2e8f0;
        }
        .immobili-table tr:nth-child(even) {
          background: #f8fafc;
        }
        .totale {
          background: #dbeafe;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 30px;
        }
        .totale h3 {
          margin: 0;
          color: #1e40af;
          font-size: 24px;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding: 20px 30px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
          margin-top: 40px;
        }
        .tipo-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .tipo-fabbricato {
          background: #dbeafe;
          color: #1e40af;
        }
        .tipo-terreno {
          background: #dcfce7;
          color: #166534;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏠 Report IMU</h1>
        <p>Calcolo dell'Imposta Municipale Propria</p>
      </div>

      <div class="content">
        <div class="project-info">
          <h2>Informazioni Progetto</h2>
          <p><strong>Nome:</strong> ${project.nome}</p>
          <p><strong>Data creazione:</strong> ${dataCreazione}</p>
          ${project.email ? `<p><strong>Email:</strong> ${project.email}</p>` : ''}
          <p><strong>Numero immobili:</strong> ${immobili.length}</p>
        </div>

        <h2>Dettaglio Immobili</h2>
        <table class="immobili-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Identificativo</th>
              <th>Categoria</th>
              <th>Rendita/Reddito</th>
              <th>Uso</th>
            </tr>
          </thead>
          <tbody>
            ${immobili.map(immobile => `
              <tr>
                <td>
                  <span class="tipo-badge tipo-${immobile.tipo}">
                    ${immobile.tipo === 'fabbricato' ? 'Fabbricato' : 'Terreno'}
                  </span>
                </td>
                <td>
                  ${immobile.identificativo.comune}<br>
                  Fg. ${immobile.identificativo.foglio} - Part. ${immobile.identificativo.particella}
                  ${immobile.identificativo.subalterno ? ` - Sub. ${immobile.identificativo.subalterno}` : ''}
                </td>
                <td>${immobile.categoria || 'N/A'}</td>
                <td>
                  ${immobile.tipo === 'fabbricato' 
                    ? (immobile.rendita ? `€ ${immobile.rendita}` : 'N/A')
                    : (immobile.redditoDominicale ? `€ ${immobile.redditoDominicale}` : 'N/A')
                  }
                </td>
                <td>${formattaUso(immobile.uso)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totale">
          <h3>Calcolo IMU non disponibile nel report</h3>
          <p>Per il calcolo dell'importo IMU è necessario utilizzare l'applicazione web con le aliquote comunali aggiornate.</p>
        </div>
      </div>

      <div class="footer">
        <p>Report generato da Livn - ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}</p>
        <p>Questo documento è stato generato automaticamente e contiene informazioni basate sui dati inseriti dall'utente.</p>
      </div>
    </body>
    </html>
  `;
}

function formattaUso(uso: string | null): string {
  if (!uso) return 'Non specificato';
  
  const traduzioni: Record<string, string> = {
    'abitazione': 'Abitazione principale',
    'pertinenza': 'Pertinenza',
    'terreno_agricolo': 'Terreno agricolo',
    'terreno_edificabile': 'Terreno edificabile'
  };
  
  return traduzioni[uso] || uso;
} 