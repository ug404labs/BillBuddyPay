import { useState, useCallback, useEffect } from 'react';
import { createThirdwebClient, getContract } from "thirdweb";
import { useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { sepolia } from "thirdweb/chains";
import {client} from "../../lib/client";
import {contractConfig, getChainConfig} from "../utils/contract_variable"




export function useInvoiceSystem() {
  const [contract, setContract] = useState(null);
  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const [paymentToken, setPaymentToken] = useState(null);

  useEffect(() => {
    const init = async () => {
      const activeChain = client.activeChain
      console.log("Active chain:", activeChain);
      const activechain2 = client.chain
      console.log("Active chain2:", activechain2);
      contractAddress = contractConfig[activechain2].address

      console.log("Contract address:", contractAddress);

      const contractInstance = getContract({
        client,
        address: contractAddress,
        chain: sepolia, // Adjust this if you're using a different chain
      });

      setContract(contractInstance);
    };

    init();
  }, []);

  const createInvoice = useCallback(async (name, description, totalAmount, recipients, percentages) => {
    if (!contract) return;
    try {
      const transaction = await contract.prepareCall({
        method: "function createInvoice(string memory name, string memory description, uint256 totalAmount, address[] memory recipients, uint256[] memory percentages)",
        params: [name, description, totalAmount, recipients, percentages],
      });
      await sendTransaction(transaction);
      console.log("Invoice created successfully");
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  }, [contract, sendTransaction]);

  const payInvoice = useCallback(async (invoiceId, amount) => {
    if (!contract) return;
    try {
      const transaction = await contract.prepareCall({
        method: "function payInvoice(uint256 invoiceId)",
        params: [invoiceId],
        value: amount,
      });
      await sendTransaction(transaction);
      console.log("Invoice paid successfully");
    } catch (error) {
      console.error("Error paying invoice:", error);
    }
  }, [contract, sendTransaction]);

  const getInvoice = useCallback((invoiceId) => {
    const { data } = useReadContract({
      contract,
      method: "function getInvoice(uint256 invoiceId) returns (uint256 id, string memory name, string memory description, uint256 totalAmount, bool isPaid, address creator)",
      params: [invoiceId],
    });

    return data ? {
      id: data[0],
      name: data[1],
      description: data[2],
      totalAmount: data[3],
      isPaid: data[4],
      creator: data[5],
    } : null;
  }, [contract]);

  const getInvoiceRecipients = useCallback((invoiceId) => {
    const { data } = useReadContract({
      contract,
      method: "function getInvoiceRecipients(uint256 invoiceId) returns (address[] memory, uint256[] memory)",
      params: [invoiceId],
    });

    return data ? data[0].map((address, index) => ({
      address,
      percentage: data[1][index],
    })) : null;
  }, [contract]);

  return {
    createInvoice,
    payInvoice,
    getInvoice,
    getInvoiceRecipients,
    isReady: !!contract,
    userAddress: account?.address,
  };
}