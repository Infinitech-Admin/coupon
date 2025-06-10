"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (email === "admin@aftershift.com" && password === "Aftershift@2025") {
      const dummyToken = "fake-admin-token-123";
      localStorage.setItem("adminToken", dummyToken);
      router.push("/admin");
    } else {
      setError("Invalid email or password");
    }
  }

  if (!hydrated) return null;

  return (
    <>
      {/* Prevent horizontal scrolling on the entire page */}
      <style>{`
        html, body, #__next {
          overflow-x: hidden;
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }
      `}</style>

      <div
        className="flex items-center justify-center min-h-screen bg-gray-900 relative px-4"
        style={{
          backgroundImage: "url('/aftershift.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/70 pointer-events-none" />

        <form
          onSubmit={handleLogin}
          className="relative z-10 w-full max-w-md bg-white bg-opacity-95 rounded-xl shadow-xl p-10 flex flex-col gap-6"
          // Avoid any margin that can cause horizontal scroll, padding handled by px-4 in parent
        >
          <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
            Admin Login
          </h1>

          <div>
            <Label
              htmlFor="email"
              className="mb-1 block font-semibold text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@aftershift.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full"
            />
          </div>

          <div>
            <Label
              htmlFor="password"
              className="mb-1 block font-semibold text-gray-700"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full py-3" variant="default">
            Log In
          </Button>
        </form>
      </div>
    </>
  );
}
