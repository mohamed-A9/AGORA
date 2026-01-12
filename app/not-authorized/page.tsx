export default function NotAuthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border bg-white p-7 text-center shadow-sm">
        <div className="text-4xl font-extrabold tracking-tight">AGORA</div>
        <h1 className="mt-6 text-xl font-semibold">⛔ Accès refusé</h1>
        <p className="mt-2 opacity-70">
          Vous n’avez pas l’autorisation d’accéder à cette page.
        </p>
        <a className="mt-6 inline-block rounded-2xl bg-black px-4 py-2 text-white" href="/dashboard">
          Aller au dashboard
        </a>
      </div>
    </div>
  );
}
