'use client';

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
    const { data: sessionData } = useSession();

    return (
        <button
            className="rounded-full bg-blue-500 px-10 py-3 font-semibold text-white no-underline transition hover:bg-blue-600"
            onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
            {sessionData ? "Sign out" : "Sign in"}
        </button>
    );
}