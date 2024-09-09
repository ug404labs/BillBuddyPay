"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useActiveAccount } from "thirdweb/react";
import { prepareContractCall, sendAndConfirmTransaction, getContract, readContract } from "thirdweb";
import { client } from "../../../lib/client";
import { baseSepolia } from "thirdweb/chains";
import Header from "../../header";
const invoiceFactoryAddress = '0x7baC6c206C90e73B19844D1dF4507CC33Fd2A5e1'; //base
import invoiceAbi from '../../contracts/invoice/invoice.abi.json';
import invoiceFactoryAbi from "../../contracts/invoice/invoiceFactory.abi.json";

const InvoiceViewPage = () => {
  console.log("Rendering InvoiceViewPage");
  const searchParams = useSearchParams();
  const invoiceAddress = searchParams.get('address');
  console.log("Invoice Address:", invoiceAddress);
  const connectedAccount = useActiveAccount();
  console.log("Connected Account:", connectedAccount);
  const [invoice, setInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("Initializing invoice contract");
  const invoiceContract = getContract({
    address: invoiceAddress,
    abi: invoiceAbi,
    chain: baseSepolia,
  });

  const invoiceFactoryContract = getContract({
    address: invoiceFactoryAddress,
    abi: invoiceFactoryAbi,
    chain: baseSepolia,
  })
  console.log("Invoice Contract:", invoiceContract);

  const fetchInvoiceDetails = useCallback(async () => {
    console.log("Fetching invoice details");
    if (!invoiceAddress) {
      console.log("No invoice address provided");
      setError("No invoice address provided");
      setLoading(false);
      return;
    }
    else{
      //log invoice details
      
    }

    try {
      console.log("Fetching payees data");
      const payeesData = await readContract({
        client,
        contract: invoiceFactoryContract,
        method: 'function getInvoiceDetails() view returns (invoice[])',
        params: [invoiceAddress],
      });
      console.log("Payees Data:", payeesData);
    }
    


      console.log("Payment successful. Transaction receipt:", receipt);
      alert("Payment successful!");
    } catch (error) {
      console.error("Error making payment:", error);
      alert("Error making payment: " + error.message);
    }
  };

  console.log("Rendering component");
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