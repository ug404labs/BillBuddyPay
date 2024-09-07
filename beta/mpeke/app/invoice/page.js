"use client";
import React, { useState, useEffect } from 'react';
import Header from "../header"; // Adjust the import path as necessary
import { useInvoiceSystem } from '../hooks/useInvoicing'; // Adjust the import path as necessary

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="float-right text-gray-600 hover:text-gray-800">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

const InvoiceDashboard = () => {
  const { createInvoice, payInvoice, getInvoice, getInvoiceRecipients, isReady, userAddress } = useInvoiceSystem();
  const [invoices, setInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    name: '',
    description: '',
    totalAmount: '',
    recipients: [{ address: '', percentage: '' }],
  });

  useEffect(() => {
    const loadInvoices = async () => {
      if (!isReady) return;

      const loadedInvoices = [];
      for (let i = 1; i <= (await getInvoiceCount()); i++) {
        const invoice = await getInvoice(i);
        const recipients = await getInvoiceRecipients(i);
        loadedInvoices.push({
          ...invoice,
          recipients,
        });
      }
      setInvoices(loadedInvoices);
    };

    if (isReady) {
      loadInvoices();
    }
  }, [isReady, getInvoice, getInvoiceRecipients]);

  const addRecipient = () => {
    setNewInvoice({
      ...newInvoice,
      recipients: [...newInvoice.recipients, { address: '', percentage: '' }],
    });
  };

  const updateRecipient = (index, field, value) => {
    const updatedRecipients = newInvoice.recipients.map((recipient, i) => 
      i === index ? { ...recipient, [field]: value } : recipient
    );
    setNewInvoice({ ...newInvoice, recipients: updatedRecipients });
  };

  const handleCreateInvoice = async () => {
    try {
      await createInvoice(
        newInvoice.name,
        newInvoice.description,
        newInvoice.totalAmount,
        newInvoice.recipients.map(r => r.address),
        newInvoice.recipients.map(r => r.percentage)
      );
      setIsModalOpen(false);
      setNewInvoice({
        name: '',
        description: '',
        totalAmount: '',
        recipients: [{ address: '', percentage: '' }],
      });
      // Reload invoices after creating a new one
      await loadInvoices();
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      const invoice = await getInvoice(invoiceId);
      await payInvoice(invoiceId, invoice.totalAmount);
      // Reload invoices after paying
      await loadInvoices();
    } catch (error) {
      console.error("Error paying invoice:", error);
    }
  };

  const totalInvoices = invoices.length;
  const totalPayments = invoices.filter(inv => inv.isPaid).length;
  const unpaidInvoices = totalInvoices - totalPayments;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Header />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Invoice Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: "Total Invoices", value: totalInvoices },
          { title: "Total Payments", value: totalPayments },
          { title: "Unpaid Invoices", value: unpaidInvoices }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">{stat.title}</h2>
            <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Create New Invoice
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.totalAmount} (in stablecoin)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {invoice.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                      onClick={() => handleViewInvoice(invoice.id)}
                    >
                      View
                    </button>
                    {!invoice.isPaid && (
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => handlePayInvoice(invoice.id)}
                      >
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Invoice</h2>
        <div className="space-y-4">
          <input
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Invoice Name"
            value={newInvoice.name}
            onChange={(e) => setNewInvoice({ ...newInvoice, name: e.target.value })}
          />
          <input
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Description"
            value={newInvoice.description}
            onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
          />
          <input
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Total Amount (in stablecoin)"
            type="number"
            value={newInvoice.totalAmount}
            onChange={(e) => setNewInvoice({ ...newInvoice, totalAmount: e.target.value })}
          />
          <h3 className="font-semibold text-lg text-gray-700">Recipients</h3>
          {newInvoice.recipients.map((recipient, index) => (
            <div key={index} className="flex space-x-2">
              <input
                className="flex-1 p-2 border border-gray-300 rounded"
                placeholder="Address"
                value={recipient.address}
                onChange={(e) => updateRecipient(index, 'address', e.target.value)}
              />
              <input
                className="w-24 p-2 border border-gray-300 rounded"
                placeholder="Percentage"
                type="number"
                value={recipient.percentage}
                onChange={(e) => updateRecipient(index, 'percentage', e.target.value)}
              />
              <button 
                className="text-red-600 hover:text-red-800"
                onClick={() => setNewInvoice({
                  ...newInvoice,
                  recipients: newInvoice.recipients.filter((_, i) => i !== index),
                })}
              >
                Remove
              </button>
            </div>
          ))}
          <button 
            className="text-blue-500 hover:text-blue-700"
            onClick={addRecipient}
          >
            Add Recipient
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={handleCreateInvoice}
          >
            Create Invoice
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default InvoiceDashboard;
