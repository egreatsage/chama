// src/components/auth/GoogleLoginButton.js
'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function GoogleLoginButton({ text = "Sign in with Google" }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
      toast.success("Signed in with Google!");
    } catch (error) {
      console.error(error);
      toast.error("Authentication error");
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4 cursor-pointer"
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900"></div>
      ) : (
        <>
          <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
            <path
              d="M12.0003 20.45c4.65 0 8.55-3.15 9.9-7.5h-9.9v-3.6h15.3c.15.9.15 1.95.15 3 0 6.45-4.35 11.1-10.35 11.1-6.15 0-11.1-4.95-11.1-11.1s4.95-11.1 11.1-11.1c3 0 5.7 1.05 7.8 2.85l-2.85 2.85c-1.35-1.05-3-1.8-4.95-1.8-4.35 0-7.95 3.45-7.95 7.8s3.6 7.8 7.95 7.8z"
              fill="currentColor"
            />
          </svg>
          {text}
        </>
      )}
    </button>
  );
}