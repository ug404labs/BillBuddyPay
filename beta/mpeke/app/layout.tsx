import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Block Buddy Pay",
  description: "Joint Financing Never been better",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>{" "}
        {/* Delegate to client component */}
      </body>
    </html>
  );
}
