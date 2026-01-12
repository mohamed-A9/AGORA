import nodemailer from "nodemailer";

const host = process.env.EMAIL_SERVER_HOST;
const port = Number(process.env.EMAIL_SERVER_PORT || 587);
const user = process.env.EMAIL_SERVER_USER;
const pass = process.env.EMAIL_SERVER_PASSWORD;

if (!host || !user || !pass) {
  // Pas de throw ici pour éviter de casser le build,
  // mais si tu fais signup sans ces vars => l'envoi échouera et on renverra un warning.
  console.warn("[mailer] Missing EMAIL_SERVER_* env vars");
}

export const mailer = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // 587 => false (STARTTLS)
  auth: { user, pass },
  requireTLS: port === 587, // aide Gmail
});

export async function sendVerificationEmail(to: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const from = process.env.EMAIL_FROM || `AGORA <${user}>`;

  const verifyUrl = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await mailer.sendMail({
    from,
    to,
    subject: "AGORA — Vérification de votre email",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Bienvenue sur AGORA</h2>
        <p>Pour activer votre compte, cliquez sur le lien ci-dessous :</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p style="color:#666;font-size:12px">Ce lien expire dans 24 heures.</p>
      </div>
    `,
  });
}
