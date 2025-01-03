"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/libs/supabase/client";
import { Provider } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import config from "@/config";

// This a login/singup page for Supabase Auth.
// Successfull login redirects to /api/auth/callback where the Code Exchange is processed (see app/api/auth/callback/route.js).
export default function Login() {
  const supabase = createClient();
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const handleSignup = async (
    e: any,
    options: {
      type: string;
      provider?: Provider;
    }
  ) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      const { type, provider } = options;
      const redirectURL = window.location.origin + "/api/auth/callback";

      if (type === "oauth") {
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectURL,
          },
        });
      } else if (type === "magic_link") {
        await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectURL,
          },
        });
        toast.success("Check your emails!");
        setIsDisabled(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 左侧登录表单 */}
      <div className="w-full lg:w-1/2 p-8 flex flex-col">
        <div className="flex items-center mb-8">
          <Link href="/" className="btn btn-ghost btn-sm gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-auto w-full flex flex-col justify-center space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Sign in to {config.appName}</h1>
          </div>

          <div className="space-y-4">
            <button
              className="btn btn-outline w-full flex items-center gap-2 normal-case"
              onClick={(e) => handleSignup(e, { type: "oauth", provider: "google" })}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
              )}
              Sign in with Google
            </button>
          </div>

          <div className="divider text-xs text-base-content/50">Or continue with email</div>

          <form
            className="space-y-4"
            onSubmit={(e) => handleSignup(e, { type: "magic_link" })}
          >
            <input
              required
              type="email"
              value={email}
              autoComplete="email"
              placeholder="Enter your email"
              className="input input-bordered w-full"
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={isLoading || isDisabled}
              className="btn btn-primary w-full"
            >
              {isLoading && <span className="loading loading-spinner loading-xs" />}
              Sign in with Email
            </button>
          </form>

          <div className="text-center text-sm text-base-content/70">
            <Link href="/signup" className="link link-hover">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-base-content/70">
          <Link href="/terms" className="link link-hover">Terms</Link>
          {" · "}
          <Link href="/privacy" className="link link-hover">Privacy Policy</Link>
        </div>
      </div>

      {/* 右侧背景 */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary/20 to-primary relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 max-w-lg">
            <p className="text-lg mb-4">
              "I've never come across a platform that has made it SO easy-peasy to start selling. {config.appName} is full of beautiful surprises, and it's a genuine joy to use!"
            </p>
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full">
                  <img src="/testimonial-1.jpg" alt="User" />
                </div>
              </div>
              <div>
                <div className="font-semibold">Rachel Shillcock</div>
                <div className="text-sm text-base-content/70">@MissRachilli</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
