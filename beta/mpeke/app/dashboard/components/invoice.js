"use client";
//

import React, { useState, useEffect } from "react";
import { getContract, prepareContractCall, toWei, sendTransaction } from "thirdweb";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import FACTORY_ABI from "./factori.abi.json";
import { defineChain } from "thirdweb/chains";

const FACTORY_ADDRESS = "0x15aaC88A95B997a0b141dB4E17c3a82E7b85d157";

export default function InvoiceManagement() {
  const activeAccount = useActiveAccount();
  const Alfajores = defineChain({
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
  const activeChain = activeAccount?.chain;
  console.log("Active chain:", activeChain);
  const factoryContract = getContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    chain: Alfajores,
  });
  console.log("Factory contract:", factoryContract);

  const [invoices, setInvoices] = useState([]);
  const [newInvoice, setNewInvoice] = useState({
    tokenAddress: "0x0000000000000000000000000000000000000000",
    totalAmount: "",
    recipients: [{ address: "", percentage: "" }],
  });

  // Use useReadContract to get the invoice count
  const { data: invoiceCount, isLoading: isCountLoading, error: countError } = useReadContract({
    contract: factoryContract,
    method: "invoiceCount",
    params: [],
    enabled: !!factoryContract,
  });

  console.log("Invoice count:", invoiceCount);

  useEffect(() => {
    const loadInvoices = async () => {
      if (invoiceCount && !isCountLoading && !countError) {
        const count = Number(invoiceCount);
        const invoiceAddresses = [];
        for (let i = 0; i < count; i++) {
          const { data: invoiceAddress } = await useReadContract({
            contract: factoryContract,
            method: "allInvoices",
            params: [i],
          });
          if (invoiceAddress) {
            invoiceAddresses.push(invoiceAddress);
          }
        }
        setInvoices(invoiceAddresses);
      }
    };

    loadInvoices();
  }, [invoiceCount, isCountLoading, countError, factoryContract]);

  const handleCreateInvoice = async () => {
    if (!factoryContract || !activeAccount) {
      console.error("Factory contract or active account not available");
      return;
    }

    try {
      const recipientAddresses = newInvoice.recipients.map(r => r.address);
      const percentages = newInvoice.recipients.map(r => BigInt(parseFloat(r.percentage) * 10000));

      console.log("Preparing transaction with params:", {
        tokenAddress: newInvoice.tokenAddress,
        totalAmount: toWei(newInvoice.totalAmount),
        recipients: recipientAddresses,
        percentages: percentages,
      });

      const tx = prepareContractCall({
        contract: factoryContract,
        method: "createInvoice",
        params: [
          newInvoice.tokenAddress,
          toWei(newInvoice.totalAmount),
          recipientAddresses,
          percentages,
        ],
      });

      console.log("Prepared transaction:", tx);

      const result = await sendTransaction({
        account: activeAccount,
        transaction: tx,
      });

      console.log("Transaction result:", result);
      await factoryContract.read("invoiceCount");
    } catch (error) {
      console.error("Failed to create invoice:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    }
  };

  const handleAddRecipient = () => {
    setNewInvoice((prev) => ({
      ...prev,
      recipients: [...prev.recipients, { address: "", percentage: "" }],
    }));
  };


  // 

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Invoice Management</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Create New Invoice</h2>
        <input
          type="text"
          placeholder="Token Address (use 0x0 for native token)"
          value={newInvoice.tokenAddress}
          onChange={(e) => setNewInvoice((prev) => ({ ...prev, tokenAddress: e.target.value }))}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Total Amount"
          value={newInvoice.totalAmount}
          onChange={(e) => setNewInvoice((prev) => ({ ...prev, totalAmount: e.target.value }))}
          className="w-full p-2 mb-2 border rounded"
        />
        {newInvoice.recipients.map((recipient, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipient.address}
              onChange={(e) => {
                const updatedRecipients = [...newInvoice.recipients];
                updatedRecipients[index].address = e.target.value;
                setNewInvoice((prev) => ({ ...prev, recipients: updatedRecipients }));
              }}
              className="w-1/2 p-2 mr-2 border rounded"
            />
            <input
              type="text"
              placeholder="Percentage (0-100)"
              value={recipient.percentage}
              onChange={(e) => {
                const updatedRecipients = [...newInvoice.recipients];
                updatedRecipients[index].percentage = e.target.value;
                setNewInvoice((prev) => ({ ...prev, recipients: updatedRecipients }));
              }}
              className="w-1/2 p-2 border rounded"
            />
          </div>
        ))}
        <button
          onClick={handleAddRecipient}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Add Recipient
        </button>
        <button onClick={handleCreateInvoice} className="bg-green-500 text-white px-4 py-2 rounded">
          Create Invoice
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Invoices</h2>
        <ul className="list-disc pl-5">
          {invoices.map((invoiceAddress, index) => (
            <li key={index} className="mb-2">
              {invoiceAddress}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}