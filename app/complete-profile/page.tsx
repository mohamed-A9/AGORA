import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

export default async function CompleteProfilePage() {
    const session = await getServerSession(authOptions);

    // If not logged in, go to login
    if (!session) {
        redirect("/login");
    }

    // If already completed, go to dashboard
    // Note: Middleware also enforces this, but safe to check here too.
    if ((session.user as any).isOnboardingCompleted) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center py-12 px-4">
            <OnboardingForm user={session.user} />
        </div>
    );
}
