"use client"; // This makes the file a client component
import { useState } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import ChainContext from "../Context/chain";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedChainId, setSelectedChainID] = useState("1");

  return (
    <ChainContext.Provider value={{ selectedChainId, setSelectedChainID }}>
      <ThirdwebProvider>{children}</ThirdwebProvider>
    </ChainContext.Provider>
  );
}
