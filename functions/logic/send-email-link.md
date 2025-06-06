# ✉️ Funzione: sendEmailLink

## 🧭 Scopo

Inviare all’utente un’email contenente un link unico per accedere al proprio progetto salvato, senza bisogno di login o password.

## 📥 Input

type SendEmailLinkInput = {
  email: string;
  projectId: string;
};

## 📤 Output

type SendEmailLinkOutput = {
  success: boolean;
  error?: string;
};

## 🔁 Passaggi
1. Generare un URL unico per il progetto, ad esempio:

https://livn.app/p/{projectId}

2. Creare il contenuto dell’email, con:

- saluto personalizzato

- spiegazione sintetica (es. “Ecco il link per accedere al tuo progetto Livn”)

- pulsante o link testuale

3. Inviare l’email tramite Mailgun (API REST)

4. Restituire conferma di invio

## 💡 Note aggiuntive

- Il link può essere inviato anche più volte: il progetto è accessibile senza limiti

- Il progetto è pubblico per chi possiede il link (accesso by-link)

- Se il progetto è già legato a un’email, possiamo usare quella di default

- Possibile estensione: tracking degli invii o creazione log in Supabase

## 📄 Esempio contenuto email

Ciao! 👋

Hai salvato un progetto su Livn per calcolare l’IMU.  
Puoi riprenderlo in qualsiasi momento dal link qui sotto:

👉 https://livn.app/p/abc123

Grazie per aver usato Livn!