import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import VerifyEmailClient from "./VerifyEmailClient";

export default async function VerifyEmailPage(props: { searchParams: Promise<{ error?: string }> }) {
  const session = await getServerSession(authOptions);
  const searchParams = await props.searchParams;

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).emailVerified) {
    redirect("/dashboard");
  }

  const error = searchParams?.error;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-indigo-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Vérifiez votre Email</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Un lien de vérification a été envoyé à
            <span className="block text-white font-semibold mt-1 bg-white/5 py-1 px-3 rounded-lg mx-auto w-fit">
              {(session.user as any).email}
            </span>
          </p>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-sm text-indigo-200">
          Veuillez cliquer sur le lien dans l'email pour activer votre compte.
        </div>

        {error === "Expired" && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl font-medium">
            Le lien a expiré. Veuillez en demander un nouveau ci-dessous.
          </div>
        )}

        {!process.env.SMTP_USER && !process.env.EMAIL_SERVER_USER && (
          <div className="text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl font-medium text-left">
            <p className="font-bold mb-1">⚠️ Configuration SMTP manquante</p>
            <p>Le système ne peut pas envoyer d&apos;email réel.</p>
            <p className="mt-1">Veuillez vérifier votre <strong>terminal/console</strong> pour trouver le lien de validation simulé.</p>
          </div>
        )}

        <VerifyEmailClient />
      </div>
    </div>
  );
}
