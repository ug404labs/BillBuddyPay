"use client";
import React, { useState } from 'react';
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import Header from "../header";
import { useInvoiceContract } from '../hooks/useInvoiceContract';

const PayInvoicePage = () => {
  const contract = useInvoiceContract();
  const account = useActiveAccount();
  const { mutate: sendTx } = useSendTransaction();

  const [invoiceIdToPay, setInvoiceIdToPay] = useState('');
  const [amountToPay, setAmountToPay] = useState('');

  const handlePayInvoice = async (e) => {
    e.preventDefault();
    console.log("Paying invoice...");
    if (!contract) {
      console.log("Contract not found");
      return;
    }

    try {
      await sendTx({
        contract: contract,
        method: "function payInvoice(uint256 invoiceId)",
        args: [invoiceIdToPay],
        value: amountToPay,
        onSuccess: (tx) => {
          console.log("Invoice paid successfully", tx);
          setInvoiceIdToPay('');
          setAmountToPay('');
          // Show success message
        },
        onError: (error) => {
          console.error("Error paying invoice:", error);
          alert("Error paying invoice: " + error.message);
        },
      });
    } catch (error) {
      console.error("Error paying invoice:", error);
      alert("Error paying invoice: " + error.message);
    }
  };

  return (
    <div>
      <Header />
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Pay Invoice</h1>
      <p style={{ marginBottom: '20px' }}>Connected Address: {account?.address}</p>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px', padding: '20px' }}>
        <form onSubmit={handlePayInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label htmlFor="invoiceId" style={{ display: 'block', marginBottom: '5px' }}>Invoice ID</label>
            <input
              id="invoiceId"
              type="number"
              value={invoiceIdToPay}
              onChange={(e) => setInvoiceIdToPay(e.target.value)}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div>
            <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px' }}>Amount</label>
            <input
              id="amount"
              type="number"
              value={amountToPay}
              onChange={(e) => setAmountToPay(e.target.value)}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Pay Invoice</button>
        </form>
      </div>
    </div>
  );
};

export default PayInvoicePage;