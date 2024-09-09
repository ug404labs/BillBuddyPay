import React, { useState, useEffect } from 'react';
import { createThirdwebClient, getContract } from "thirdweb";
import { useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { alfajores } from "thirdweb/chains";

const contractAddress = '0xaCF436447981e25003cA0f5B43644621d3608943';

const InvoiceSystemDashboard = () => {
  const [contract, setContract] = useState(null);
  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  
  const [invoices, setInvoices] = useState([]);
  const [newInvoice, setNewInvoice] = useState({
    name: '',
    description: '',
    totalAmount: '',
    recipients: [''],
    percentages: [''],
  });
  const [invoiceIdToPay, setInvoiceIdToPay] = useState('');
  const [amountToPay, setAmountToPay] = useState('');

  useEffect(() => {
    const init = async () => {
      const client = createThirdwebClient({ chain: alfajores });
      const contractInstance = getContract({
        client,
        address: contractAddress,
        
      });
      setContract(contractInstance);
    };

    init();
  }, []);

  useEffect(() => {
    if (contract) {
      fetchInvoices();
    }
  }, [contract]);

  const fetchInvoices = async () => {
    try {
      const { data: invoiceCount } = await useReadContract({
        contract,
        method: "function getInvoiceCount() view returns (uint256)",
      });

      const fetchedInvoices = await Promise.all(
        Array.from({ length: invoiceCount }, (_, i) => i + 1).map(async (id) => {
          const { data: invoice } = await useReadContract({
            contract,
            method: "function getInvoice(uint256 invoiceId) view returns (uint256 id, string memory name, string memory description, uint256 totalAmount, bool isPaid, address creator)",
            params: [id],
          });

          const { data: recipients } = await useReadContract({
            contract,
            method: "function getInvoiceRecipients(uint256 invoiceId) view returns (address[] memory, uint256[] memory)",
            params: [id],
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
        })
      );

      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const transaction = await contract.prepareCall({
        method: "function createInvoice(string memory name, string memory description, uint256 totalAmount, address[] memory recipients, uint256[] memory percentages)",
        params: [
          newInvoice.name,
          newInvoice.description,
          newInvoice.totalAmount,
          newInvoice.recipients,
          newInvoice.percentages.map((p) => parseInt(p)),
        ],
      });
      await sendTransaction(transaction);
      console.log("Invoice created successfully");
      setNewInvoice({
        name: '',
        description: '',
        totalAmount: '',
        recipients: [''],
        percentages: [''],
      });
      fetchInvoices();
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handlePayInvoice = async (e) => {
    e.preventDefault();
    try {
      const transaction = await contract.prepareCall({
        method: "function payInvoice(uint256 invoiceId)",
        params: [invoiceIdToPay],
        value: amountToPay,
      });
      await sendTransaction(transaction);
      console.log("Invoice paid successfully");
      setInvoiceIdToPay('');
      setAmountToPay('');
      fetchInvoices();
    } catch (error) {
      console.error("Error paying invoice:", error);
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Invoice System Dashboard</h1>
      <p style={{ marginBottom: '20px' }}>Connected Address: {account?.address}</p>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px', padding: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Create New Invoice</h2>
        <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name</label>
            <input
              id="name"
              value={newInvoice.name}
              onChange={(e) => setNewInvoice({ ...newInvoice, name: e.target.value })}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Description</label>
            <input
              id="description"
              value={newInvoice.description}
              onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          <div>
            <label htmlFor="totalAmount" style={{ display: 'block', marginBottom: '5px' }}>Total Amount</label>
            <input
              id="totalAmount"
              type="number"
              value={newInvoice.totalAmount}
              onChange={(e) => setNewInvoice({ ...newInvoice, totalAmount: e.target.value })}
              required
              style={{ width: '100%', padding: '5px' }}
            />
          </div>
          {newInvoice.recipients.map((_, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor={`recipient-${index}`} style={{ display: 'block', marginBottom: '5px' }}>Recipient {index + 1}</label>
                <input
                  id={`recipient-${index}`}
                  value={newInvoice.recipients[index]}
                  onChange={(e) => {
                    const newRecipients = [...newInvoice.recipients];
                    newRecipients[index] = e.target.value;
                    setNewInvoice({ ...newInvoice, recipients: newRecipients });
                  }}
                  required
                  style={{ width: '100%', padding: '5px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor={`percentage-${index}`} style={{ display: 'block', marginBottom: '5px' }}>Percentage</label>
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
                  style={{ width: '100%', padding: '5px' }}
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addRecipient} style={{ padding: '10px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Add Recipient</button>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Create Invoice</button>
        </form>
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px', padding: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Pay Invoice</h2>
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

      <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Existing Invoices</h2>
        {invoices.map((invoice) => (
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
        ))}
      </div>
    </div>
  );
};

export default InvoiceSystemDashboard;