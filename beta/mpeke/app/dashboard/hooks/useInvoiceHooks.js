// useInvoiceHooks.js
import { useState, useEffect } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import FACTORY_ABI from "../components/factori.abi.json";
import {
  base,
  baseSepolia,
  celo,
  optimism,
  optimismSepolia,
  defineChain,
} from "thirdweb/chains";


const  Alfajores = defineChain({
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: { name: "Celo Ether", symbol: "CELO", decimals: 18 },
  rpc: "https://alfajores-forno.celo-testnet.org",
  blockExplorers: [
      {
          name: "Celo Explorer",
          url: "https://explorer.celo.org/alfajores",
          apiUrl: "https://explorer.celo.org/api",
      },
  ],
});

const FACTORY_ADDRESS = "0x7baC6c206C90e73B19844D1dF4507CC33Fd2A5e1";

export function useFactoryContract() {
  const activeAccount = useActiveAccount();
  const factoryContract = getContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    chain: Alfajores,
  });

  return { activeAccount, factoryContract };
}

export function useInvoiceCount(factoryContract) {
  return useReadContract({
    contract: factoryContract,
    method: "invoiceCount",
    params: [],
    enabled: !!factoryContract,
  });
}

export function useInvoices(factoryContract) {
  const [invoices, setInvoices] = useState([]);

  const { data: allInvoices, isLoading, error } = useReadContract({
    contract: factoryContract,
    method: "getAllInvoices",
    params: [0],
    enabled: !!factoryContract,
  });

  useEffect(() => {
    if (allInvoices && !isLoading && !error) {
      setInvoices(Array.isArray(allInvoices) ? allInvoices : []);
    }
  }, [allInvoices, isLoading, error]);

  return { invoices, isLoading, error };
}