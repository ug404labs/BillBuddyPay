import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// This is server-side metadata
export const metadata: Metadata = {
  title: "Block Buddy Pay",
  description: "Joint Financing Never been better",
};
