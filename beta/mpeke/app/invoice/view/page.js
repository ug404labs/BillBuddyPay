
"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { getContract, prepareContractCall, sendAndConfirmTransaction } from "thirdweb";
import { client } from "../../../lib/client";
import { baseSepolia } from "thirdweb/chains";
import Header from "../../header";
import invoiceFactoryAbi from '../../contracts/invoice/invoiceFactory.abi.json';
import invoiceAbi from '../../contracts/invoice/invoice.abi.json';

const InvoiceViewPage = () => {
  const searchParams = useSearchParams();
  const invoiceAddress = searchParams.get('address');
  const connectedAccount = useActiveAccount();
  const [invoice, setInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const factoryAddress = '0x7baC6c206C90e73B19844D1dF4507CC33Fd2A5e1';

  const invoiceContrcat = getContract({
    client,
    address: invoiceAddress,
    abi: invoiceAbi,
    chain: baseSepolia,
  });

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!invoiceAddress) {
        setError("No invoice address provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Fetching invoice details for address:", invoiceAddress);

        const { data: payeesData } = await useReadContract({
          contract: invoiceContrcat,
          abi: invoiceAbi,
          functionName: "getPayees",
        });

        const { data: totalShares } = await useReadContract({
          contract: invoiceContrcat,
          abi: invoiceAbi,
          functionName: "getTotalShares",
        });

        if (payeesData && totalShares) {
          const sharesPromises = payeesData.map(payee => 
            useReadContract({
              contract: invoiceContrcat,
              abi: invoiceAbi,
              functionName: "getShares",
              args: [payee],
            })
          );
          const shares = await Promise.all(sharesPromises);
          
          setInvoice({
            address: invoiceAddress,
            payees: payeesData,
            shares: shares,
            totalShares: totalShares.toString(),
          });
        } else {
          throw new Error("Failed to fetch invoice data");
        }
      } catch (error) {
        console.error("Error fetching invoice details:", error);
        setError("Failed to load invoice details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceAddress]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!connectedAccount) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const transaction = await prepareContractCall({
        client,
        contract: invoiceContrcat,
        abi: invoiceAbi,
        method: "receive",
        value: paymentAmount,
      });

      const receipt = await sendAndConfirmTransaction({
        transaction,
        account: connectedAccount,
      });

      console.log("Payment successful. Transaction receipt:", receipt);
      alert("Payment successful!");
    } catch (error) {
      console.error("Error making payment:", error);
      alert("Error making payment: " + error.message);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <Header />
      <h1 className="text-2xl font-bold mb-5">Invoice Details</h1>
      {loading ? (
        <div className="text-center">
          <p className="mb-2">Loading invoice details for {invoiceAddress}</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : invoice ? (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <p className="text-gray-700 text-sm font-bold mb-2">Invoice Address:</p>
            <p className="text-gray-700">{invoice.address}</p>
          </div>
          <div className="mb-4">
            <p className="text-gray-700 text-sm font-bold mb-2">Total Shares:</p>
            <p className="text-gray-700">{invoice.totalShares}</p>
          </div>
          <div className="mb-4">
            <p className="text-gray-700 text-sm font-bold mb-2">Payees and Shares:</p>
            <ul>
              {invoice.payees.map((payee, index) => (
                <li key={payee} className="text-gray-700">
                  {payee}: {invoice.shares[index].toString()} shares
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={handlePayment} className="mt-6">
            <div className="mb-4">
              <label htmlFor="paymentAmount" className="block text-gray-700 text-sm font-bold mb-2">
                Payment Amount (in wei):
              </label>
              <input
                type="number"
                id="paymentAmount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Pay Invoice
            </button>
          </form>
        </div>
      ) : (
        <p>No invoice data available.</p>
      )}
    </div>
  );
};

export default InvoiceViewPage;