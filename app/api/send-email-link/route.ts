import { NextRequest, NextResponse } from 'next/server';
import { SendEmailLinkInput } from '@/lib/types';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailLinkInput = await request.json();
    const { email, projectId } = body;

    if (!email || !projectId) {
      return NextResponse.json(
        { error: 'Email e projectId sono richiesti' },
        { status: 400 }
      );
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Indirizzo email non valido' },
        { status: 400 }
      );
    }

    // Genera URL del progetto
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://livn.app';
    const projectUrl = `${baseUrl}/p/${projectId}`;

    // Contenuto dell'email
    const htmlContent = generaContenutoEmail(projectUrl);
    const textContent = generaContenutoTestuale(projectUrl);

    // Invia email con Resend
    try {
      const { data, error } = await resend.emails.send({
        from: 'Livn <noreply@livn.app>', // Usa il dominio verificato su Resend
        to: [email],
        subject: '🏠 Il tuo progetto Livn è pronto',
        html: htmlContent,
        text: textContent,
      });

      if (error) {
        console.error('Errore Resend:', error);
        return NextResponse.json(
          { error: 'Errore nell\'invio dell\'email' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Email inviata con successo',
        projectUrl,
        emailId: data?.id
      });

    } catch (emailError) {
      console.error('Errore invio email:', emailError);
      return NextResponse.json(
        { error: 'Errore nell\'invio dell\'email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Errore invio email link:', error);
    return NextResponse.json(
      { error: 'Errore interno nell\'invio email' },
      { status: 500 }
    );
  }
}

function generaContenutoEmail(projectUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Il tuo progetto Livn</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin-bottom: 10px;">🏠 Livn</h1>
        <p style="color: #666; font-size: 16px;">Calcolo IMU semplificato</p>
      </div>

      <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="color: #1e293b; margin-top: 0;">Ciao! 👋</h2>
        
        <p>Hai salvato un progetto su Livn per calcolare l'IMU dei tuoi immobili.</p>
        
        <p>Puoi accedere al tuo progetto e continuare a lavorarci in qualsiasi momento dal link qui sotto:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${projectUrl}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            👉 Apri il mio progetto
          </a>
        </div>
        
        <p style="margin-bottom: 0;">Grazie per aver scelto Livn!</p>
      </div>

      <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Se non riesci a cliccare il pulsante, copia e incolla questo link nel browser:</p>
        <p style="word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px;">
          ${projectUrl}
        </p>
      </div>

    </body>
    </html>
  `;
}

function generaContenutoTestuale(projectUrl: string): string {
  return `
Ciao! 👋

Hai salvato un progetto su Livn per calcolare l'IMU dei tuoi immobili.

Puoi accedere al tuo progetto e continuare a lavorarci in qualsiasi momento da questo link:

${projectUrl}

Grazie per aver scelto Livn!

---
Se hai problemi con il link, contattaci o visita direttamente: ${projectUrl}
  `.trim();
} 