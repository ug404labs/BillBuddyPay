"use client";
import LandingPage from "@/app/components/landingPage";
import React from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const auth = getAuth(app);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("./dashboard");
      }
    });
  }, [auth, router]);
  return <LandingPage />;
}
