// InvoiceManagement.js
"use client";

import React, { useState } from "react";
import { useFactoryContract, useInvoiceCount, useInvoices } from "../hooks/useInvoiceHooks";
import { createInvoice } from "../utils/invoiceUtils";

export default function InvoiceManagement() {
  const { activeAccount, factoryContract } = useFactoryContract();
  
  const { data: invoiceCount, isLoading: isCountLoading, error: countError } = useInvoiceCount(factoryContract);
  const { invoices, isLoading: areInvoicesLoading, error: invoicesError } = useInvoices(factoryContract); 

  const [newInvoice, setNewInvoice] = useState({
    tokenAddress: "0x0000000000000000000000000000000000000000",
    totalAmount: "",
    recipients: [{ address: "", percentage: "" }],
  });

  const handleCreateInvoice = async () => {
    const result = await createInvoice(factoryContract, activeAccount, newInvoice);
    if (result) {
      // Optionally, you can add logic here to update the UI or reset the form
    }
  };

  const handleAddRecipient = () => {
    setNewInvoice((prev) => ({
      ...prev,
      recipients: [...prev.recipients, { address: "", percentage: "" }],
    }));
  };
  if (isCountLoading || areInvoicesLoading) {
    return <div>Loading...</div>;
  }

  if (countError || invoicesError) {
    return <div>Error: {countError?.message || invoicesError?.message}</div>;
  }

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
        {invoices.length > 0 ? (
          <ul className="list-disc pl-5">
            {invoices.map((invoiceAddress, index) => (
              <li key={index} className="mb-2">
                {invoiceAddress}
              </li>
            ))}
          </ul>
        ) : (
          <p>No invoices found.</p>
        )}
      </div>
    </div>
  );
}