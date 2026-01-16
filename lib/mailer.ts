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

export async function sendPasswordResetEmail(to: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const from = process.env.EMAIL_FROM || `AGORA <${user}>`;

  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  await mailer.sendMail({
    from,
    to,
    subject: "AGORA — Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
        <h2 style="color:#4f46e5;">Réinitialisation de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte AGORA.</p>
        <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
        <div style="margin:24px 0;">
          <a href="${resetUrl}" style="background-color:#4f46e5;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Réinitialiser mon mot de passe</a>
        </div>
        <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
        <p style="color:#666;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">
          Ce lien expire dans 1 heure.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordChangedNotificationEmail(to: string) {
  const from = process.env.EMAIL_FROM || `AGORA <${user}>`;

  await mailer.sendMail({
    from,
    to,
    subject: "AGORA — Votre mot de passe a été modifié",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
        <h2 style="color:#4f46e5;">Sécurité du compte</h2>
        <p>Bonjour,</p>
        <p>Nous vous informons que le mot de passe de votre compte AGORA vient d'être modifié avec succès.</p>
        <p>Si vous êtes à l'origine de ce changement, vous pouvez ignorer cet email.</p>
        <p style="background-color:#fff7ed;border-left:4px solid #f97316;padding:12px;margin:24px 0;color:#9a3412;">
          <strong>Attention :</strong> Si vous n'avez pas demandé ce changement, veuillez réinitialiser votre mot de passe immédiatement via la page de connexion ou contacter notre support.
        </p>
        <p style="color:#666;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">
          Ceci est un message automatique, merci de ne pas y répondre.
        </p>
      </div>
    `,
  });
}
