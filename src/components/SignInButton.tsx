"use client";

// src/components/SignInButton.tsx
import { signIn } from "next-auth/react";
import React from "react";

/**
 * Simple sign‑in button used on the /auth/signin page.
 * Adjust the provider name ("auth0", "github", etc.) according to your NextAuth configuration.
 */
export default function SignInButton() {
  const handleSignIn = async () => {
    try {
      // Replace "auth0" with the provider you configured in [...nextauth].js
      await signIn("auth0");
    } catch (err) {
      console.error("Failed to initiate sign‑in:", err);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      Sign In
    </button>
  );
}
