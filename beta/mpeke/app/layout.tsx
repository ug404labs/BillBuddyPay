import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConnectButton, ThirdwebProvider } from "thirdweb/react";
import { ChainContext } from "../Context/chain";
import { useState } from "react"; // Don't forget to import useState

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Block Buddy Pay",
  description: "Joint Finicing Never been better",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [selectedChainId, setSelectedChainID] = useState("1");

  return (
    <html lang="en">
      <body className={inter.className}>
        <ChainContext.Provider value={{ selectedChainId, setSelectedChainID }}>
          <ThirdwebProvider>{children}</ThirdwebProvider>
        </ChainContext.Provider>
      </body>
    </html>
  );
}
