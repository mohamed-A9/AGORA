import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string) {
    // Use environment variables for SMTP configuration
    const host = process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || "587");
    const user = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || '"Agora" <no-reply@agora.com>';

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === "true", // Keep generic check for SSL
        auth: {
            user,
            pass,
        },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/verify-email?token=${token}`;

    // Fallback logging for development if SMTP is not configured
    if (!user) {
        console.log("==================================================");
        console.log("⚠️ SMTP_USER/EMAIL_SERVER_USER not set. Mocking email send.");
        console.log(`✉️ To: ${email}`);
        console.log(`🔗 Link: ${url}`);
        console.log("==================================================");
        return;
    }

    try {
        await transporter.sendMail({
            from,
            to: email,
            subject: "Vérifiez votre adresse email - AGORA",
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Bienvenue sur AGORA</h1>
          <p>Merci de vous être inscrit. Pour accéder à votre compte, veuillez vérifier votre adresse email.</p>
          <a href="${url}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Vérifier mon email
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">Si le bouton ne fonctionne pas, copiez ce lien : <br/>${url}</p>
        </div>
      `,
        });
        console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
        console.error("❌ Error sending verification email:", error);
        // Don't throw, just log. We don't want to crash the user flow if mail fails.
    }
}
