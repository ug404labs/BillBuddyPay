"use client";
import React, { useState, useContext } from "react";
import Link from "next/link";
import { ConnectButton, useSwitchActiveWalletChain } from "thirdweb/react";
import { client } from "../lib/client";
import { Settings } from "lucide-react";
import {
  base,
  baseSepolia,
  celo,
  optimism,
  optimismSepolia,
  defineChain,
} from "thirdweb/chains";
import ChainContext from "../Context/chain"; // Import your ChainContext

const Header = () => {
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const switchChain = useSwitchActiveWalletChain();
  const { setSelectedChainId } = useContext(ChainContext); // Use the context

  const liskSepolia = defineChain({
    id: 4202,
    name: "Lisk Sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    rpc: "https://4202.rpc.thirdweb.com",
  });

  const Alfajores = defineChain({
    id: 44787,
    name: "Celo Alfajores",
    nativeCurrency: { name: "Celo Ether", symbol: "CELO", decimals: 18 },
    rpc: "https://alfajores-forno.celo-testnet.org",
    blockExplorers: [
      {
        name: "Optimism Explorer",
        url: "https://optimistic.etherscan.io",
        apiUrl: "https://api-optimistic.etherscan.io",
      },
    ],
  });

  const lisk = defineChain({
    id: 1135,
    name: "Lisk",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpc: "https://1135.rpc.thirdweb.com",
  });

  const networks = [
    { name: "Lisk Sepolia Testnet", chain: liskSepolia },
    { name: "Lisk", chain: lisk },
    { name: "Base Sepolia Testnet", chain: baseSepolia },
    { name: "Celo Alfajores Testnet", chain: Alfajores },
    { name: "Optimism", chain: optimism },
    { name: "Optimism Sepolia", chain: optimismSepolia },
  ];

  return (
    <header className="bg-green-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-xl font-bold">
            Block Buddy Pay
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/payment-link" className="hover:text-green-200">
                  Payment Link
                </Link>
              </li>
              <li>
                <Link href="/invoice" className="hover:text-green-200">
                  Invoicing
                </Link>
              </li>
              <li>
                <Link href="/pay" className="hover:text-green-200">
                  Payments
                </Link>
              </li>
              <li>
                <Link href="/sacco" className="hover:text-green-200">
                  Sacco
                </Link>
              </li>
              <li>
                <Link href="/investments" className="hover:text-green-200">
                  Investments
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
              className="p-2 rounded-full hover:bg-green-700 transition-colors duration-200"
            >
              <Settings size={20} />
            </button>
            {isNetworkDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                {networks.map((network) => (
                  <button
                    key={network.chain.id}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      switchChain(network.chain);
                      setSelectedChainId(network.chain.id); // Update the global selected chain ID
                      setIsNetworkDropdownOpen(false);
                    }}
                  >
                    {network.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ConnectButton client={client} />
        </div>
      </div>
    </header>
  );
};

export default Header;
