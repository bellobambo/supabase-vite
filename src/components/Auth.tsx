import React, { useState } from "react";
import { supabase } from "../supabase-client";
import toast, { Toaster } from "react-hot-toast";

export default function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          toast.error("Sign up failed: " + signUpError.message);
          return;
        }

        toast.success("Sign up successful! Please check your email.");
        setEmail("");
        setPassword("");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          toast.error("Sign in failed: " + signInError.message);
          return;
        }

        toast.success("Signed in successfully!");
        setEmail("");
        setPassword("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
        backgroundColor: "#242424",
        color: "rgba(255, 255, 255, 0.87)",
        minHeight: "50vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Toaster />
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#2e2e2e",
          padding: 24,
          borderRadius: 8,
          width: "100%",
          maxWidth: 400,
          boxSizing: "border-box",
          border: "1px solid #3a3a3a",
        }}
      >
        <h2 style={{ marginBottom: 20, textAlign: "center" }}>
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 4,
            border: "1px solid #555",
            backgroundColor: "#3a3a3a",
            color: "#f0f0f0",
            boxSizing: "border-box",
            opacity: loading ? 0.6 : 1,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="true"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 20,
            borderRadius: 4,
            border: "1px solid #555",
            backgroundColor: "#3a3a3a",
            color: "#f0f0f0",
            boxSizing: "border-box",
            opacity: loading ? 0.6 : 1,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 4,
            backgroundColor: loading ? "#555" : "#3a3a3a",
            color: "#fff",
            border: "1px solid #555",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: 12,
          }}
        >
          {loading
            ? mode === "signin"
              ? "Signing in..."
              : "Signing up..."
            : mode === "signin"
            ? "Sign In"
            : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={() =>
            !loading &&
            setMode((prev) => (prev === "signin" ? "signup" : "signin"))
          }
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            color: "white",
            textDecoration: "underline",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {mode === "signin"
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </button>
      </form>
    </div>
  );
}
