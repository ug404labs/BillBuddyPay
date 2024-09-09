"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { getContract, prepareContractCall, sendAndConfirmTransaction, prepareEvent } from "thirdweb";
import { useActiveAccount, useContractEvents } from "thirdweb/react";
import Header from "../../header";
import invoiceFactoryAbi from '../../contracts/invoice/invoiceFactory.abi.json';
import { client } from "../../../lib/client";
import { baseSepolia } from "thirdweb/chains";

const contractAddress = '0x7baC6c206C90e73B19844D1dF4507CC33Fd2A5e1'; //base

const CreateInvoicePage = () => {
  const router = useRouter();
  const connectedAccount = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    name: '',
    description: '',
    totalAmount: '',
    recipients: [''],
    percentages: [''],
  });

  const contract = getContract({
    client,
    address: contractAddress,
    abi: invoiceFactoryAbi,
    chain: baseSepolia,
  });

  const invoiceCreatedEvent = prepareEvent({
    signature: "event InvoiceCreated(address invoiceAddress, address[] payees, uint256[] shares)",
  });

  const { data: events } = useContractEvents({
    contract,
    events: [invoiceCreatedEvent],
  });

  useEffect(() => {
    if (events && events.length > 0) {
      const lastEvent = events[events.length - 1];
      const invoiceAddress = lastEvent.args.invoiceAddress;
      console.log("New invoice address from event:", invoiceAddress);
      router.push(`/invoice/view?address=${invoiceAddress}`);
    }
  }, [events, router]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    console.log("Creating invoice...");

    if (!connectedAccount) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Contract instance:", contract);

      // Prepare the parameters for the createInvoice function
      const payees = newInvoice.recipients;
      const shares = newInvoice.percentages.map(p => parseInt(p));

      const transaction = await prepareContractCall({
        contract,
        method: "createInvoice", // Make sure this matches the function name in your ABI
        params: [payees, shares],
      });

      console.log("Transaction:", transaction);

      const receipt = await sendAndConfirmTransaction({
        transaction,
        account: connectedAccount,
      });

      console.log("Receipt:", receipt);
      
      // The useEffect hook will handle the redirection once the event is detected
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Error creating invoice: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addRecipient = () => {
    setNewInvoice({
      ...newInvoice,
      recipients: [...newInvoice.recipients, ''],
      percentages: [...newInvoice.percentages, ''],
    });
  };

  return (
    <div>
      <Header />
      <h1 className="text-2xl font-bold mb-5">Create New Invoice</h1>
      <p className="mb-5">Connected Address: {connectedAccount?.address}</p>

      <div className="mb-5 border border-gray-300 rounded-md p-5">
        <form onSubmit={handleCreateInvoice} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block mb-1">Name</label>
            <input
              id="name"
              value={newInvoice.name}
              onChange={(e) => setNewInvoice({ ...newInvoice, name: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="description" className="block mb-1">Description</label>
            <input
              id="description"
              value={newInvoice.description}
              onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="totalAmount" className="block mb-1">Total Amount</label>
            <input
              id="totalAmount"
              type="number"
              value={newInvoice.totalAmount}
              onChange={(e) => setNewInvoice({ ...newInvoice, totalAmount: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {newInvoice.recipients.map((_, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <label htmlFor={`recipient-${index}`} className="block mb-1">Recipient {index + 1}</label>
                <input
                  id={`recipient-${index}`}
                  value={newInvoice.recipients[index]}
                  onChange={(e) => {
                    const newRecipients = [...newInvoice.recipients];
                    newRecipients[index] = e.target.value;
                    setNewInvoice({ ...newInvoice, recipients: newRecipients });
                  }}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`percentage-${index}`} className="block mb-1">Percentage</label>
                <input
                  id={`percentage-${index}`}
                  type="number"
                  value={newInvoice.percentages[index]}
                  onChange={(e) => {
                    const newPercentages = [...newInvoice.percentages];
                    newPercentages[index] = e.target.value;
                    setNewInvoice({ ...newInvoice, percentages: newPercentages });
                  }}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addRecipient} className="p-2 bg-gray-200 rounded-md cursor-pointer">
            Add Recipient
          </button>
          <button 
            type="submit" 
            className="p-2 bg-green-500 text-white rounded-md cursor-pointer disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Invoice...
              </span>
            ) : (
              'Create Invoice'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoicePage;