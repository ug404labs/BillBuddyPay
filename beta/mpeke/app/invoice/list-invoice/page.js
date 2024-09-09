"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useActiveAccount, useReadContract } from "thirdweb/react";
import Header from "../header";
import { useInvoiceContract } from '../../hooks/useInvoiceContract';

const ListInvoicesPage = () => {
  const contract = useInvoiceContract();
  const account = useActiveAccount();
  const [invoices, setInvoices] = useState([]);

  const fetchInvoices = useCallback(async () => {
    if (!contract) return;
  
    try {
      const invoiceCount = await useReadContract({
        contract: contract,
        method: "function getInvoiceCount() view returns (uint256)",
        args: [],
      });
      console.log("Invoice count:", invoiceCount);
  
      if (invoiceCount === 0) {
        console.log("No invoices found");
        setInvoices([]);
        return;
      }

      const fetchedInvoices = await Promise.all(
        Array.from({ length: Number(invoiceCount) }, (_, i) => i + 1).map(async (i) => {
          try {
            const invoice = await useReadContract({
              contract: contract,
              method: "function getInvoice(uint256 id) view returns (uint256 id, string name, string description, uint256 totalAmount, bool isPaid, address creator, address[] recipients)",
              args: [i],
            });
            console.log(`Invoice ${i}:`, invoice);
  
            const recipients = await useReadContract({
              contract: contract,
              method: "function getInvoiceRecipients(uint256 id) view returns (address[] recipients, uint256[] percentages)",
              args: [i],
            });
  
            return {
              id: invoice[0],
              name: invoice[1],
              description: invoice[2],
              totalAmount: invoice[3],
              isPaid: invoice[4],
              creator: invoice[5],
              recipients: recipients[0].map((address, index) => ({
                address,
                percentage: recipients[1][index],
              })),
            };
          } catch (error) {
            console.error(`Error fetching invoice ${i}:`, error);
            return null;
          }
        })
      );
  
      setInvoices(fetchedInvoices.filter(Boolean));
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, [contract]);

  useEffect(() => {
    if (contract) {
      fetchInvoices();
    }
  }, [contract, fetchInvoices]);

  return (
    <div>
      <Header />
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Existing Invoices</h1>
      <p style={{ marginBottom: '20px' }}>Connected Address: {account?.address}</p>

      <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '20px' }}>
        {invoices.length === 0 ? (
          <p>No invoices found.</p>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h3 style={{ fontWeight: 'bold' }}>{invoice.name}</h3>
              <p>{invoice.description}</p>
              <p>Total Amount: {invoice.totalAmount}</p>
              <p>Paid: {invoice.isPaid ? 'Yes' : 'No'}</p>
              <p>Creator: {invoice.creator}</p>
              <h4 style={{ fontWeight: 'bold', marginTop: '10px' }}>Recipients:</h4>
              <ul>
                {invoice.recipients.map((recipient, index) => (
                  <li key={index}>
                    {recipient.address}: {recipient.percentage}%
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListInvoicesPage;