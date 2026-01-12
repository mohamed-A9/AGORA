import { redirect } from 'next/navigation';

export default function BusinessSignupRedirect() {
    redirect('/signup?role=business');
}
