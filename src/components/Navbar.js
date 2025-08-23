"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-600">
        Chama App
      </Link>

      <div className="flex items-center space-x-4">
        {!session ? (
          <>
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 transition cursor-pointer"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 transition cursor-pointer"
            >
              Dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
