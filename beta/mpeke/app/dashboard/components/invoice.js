import React, { useState, useEffect } from 'react';
import { useContract, useAddress, useContractRead, useContractWrite } from "@thirdweb-dev/react";
import FACTORY_ABI from "./factori.abi.json";
import PAYMENT_SPLITTER_ABI from "./spiltter.abi.json";

const FACTORY_ADDRESS = "0x15aaC88A95B997a0b141dB4E17c3a82E7b85d157";

export default function InvoiceManagement() {
  const address = useAddress();
  const { contract: factoryContract } = useContract(FACTORY_ADDRESS, FACTORY_ABI);
  const [invoices, setInvoices] = useState([]);
  const [newInvoice, setNewInvoice] = useState({
    tokenAddress: '',
    totalAmount: '',
    recipients: [{ address: '', percentage: '' }],
  });

  const { data: invoiceCount } = useContractRead(factoryContract, "invoiceCount");

  useEffect(() => {
    if (factoryContract && invoiceCount) {
      loadInvoices();
    }
  }, [factoryContract, invoiceCount]);

  const loadInvoices = async () => {
    try {
      const loadedInvoices = [];

      for (let i = 0; i < invoiceCount.toNumber(); i++) {
        const { data: invoiceAddress } = await useContractRead(factoryContract, "allInvoices", [i]);
        const { contract: invoiceContract } = useContract(invoiceAddress, PAYMENT_SPLITTER_ABI);
        
        const { data: isPaid } = await useContractRead(invoiceContract, "isPaid");
        const { data: totalAmount } = await useContractRead(invoiceContract, "totalAmount");

        loadedInvoices.push({
          address: invoiceAddress,
          isPaid,
          totalAmount: totalAmount.toString(),
        });
      }

      setInvoices(loadedInvoices);
    } catch (error) {
      console.error("Failed to load invoices:", error);
    }
  };

  const { mutateAsync: createInvoice } = useContractWrite(factoryContract, "createInvoice");

  const handleCreateInvoice = async () => {
    if (!factoryContract) return;

    try {
      await createInvoice({
        args: [
          newInvoice.tokenAddress,
          newInvoice.totalAmount,
          newInvoice.recipients.map(r => r.address),
          newInvoice.recipients.map(r => r.percentage)
        ],
      });

      await loadInvoices();
    } catch (error) {
      console.error("Failed to create invoice:", error);
    }
  };

  const handleAddRecipient = () => {
    setNewInvoice(prev => ({
      ...prev,
      recipients: [...prev.recipients, { address: '', percentage: '' }],
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Invoice Management</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Create New Invoice</h2>
        <input
          type="text"
          placeholder="Token Address (use 0x0 for native token)"
          value={newInvoice.tokenAddress}
          onChange={(e) => setNewInvoice(prev => ({ ...prev, tokenAddress: e.target.value }))}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Total Amount"
          value={newInvoice.totalAmount}
          onChange={(e) => setNewInvoice(prev => ({ ...prev, totalAmount: e.target.value }))}
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
                setNewInvoice(prev => ({ ...prev, recipients: updatedRecipients }));
              }}
              className="w-1/2 p-2 mr-2 border rounded"
            />
            <input
              type="text"
              placeholder="Percentage"
              value={recipient.percentage}
              onChange={(e) => {
                const updatedRecipients = [...newInvoice.recipients];
                updatedRecipients[index].percentage = e.target.value;
                setNewInvoice(prev => ({ ...prev, recipients: updatedRecipients }));
              }}
              className="w-1/2 p-2 border rounded"
            />
          </div>
        ))}
        <button onClick={handleAddRecipient} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Add Recipient</button>
        <button onClick={handleCreateInvoice} className="bg-green-500 text-white px-4 py-2 rounded">Create Invoice</button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Invoices</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">Address</th>
              <th className="border p-2 text-left">Total Amount</th>
              <th className="border p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={index}>
                <td className="border p-2">{invoice.address}</td>
                <td className="border p-2">{invoice.totalAmount} ETH</td>
                <td className="border p-2">{invoice.isPaid ? 'Paid' : 'Unpaid'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}