import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { useBillBuddy } from "../hooks/useBillBuddy";

function CreateTransactionModal({ isOpen, onClose, createTransaction }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState("");
  const [shares, setShares] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [isExpense, setIsExpense] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    createTransaction(
      name,
      description,
      participants.split(',').map(p => p.trim()),
      shares.split(',').map(s => parseInt(s.trim())),
      totalAmount,
      receiver,
      isExpense
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Create Transaction</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Participants (comma-separated)"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Shares (comma-separated)"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Total Amount"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Receiver"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
            required
          />
          <div className="mb-2">
            <label className="mr-2">
              <input
                type="radio"
                checked={isExpense}
                onChange={() => setIsExpense(true)}
              /> Expense
            </label>
            <label>
              <input
                type="radio"
                checked={!isExpense}
                onChange={() => setIsExpense(false)}
              /> Payment
            </label>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewTransactionModal({ isOpen, onClose, transaction }) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
        <p><strong>Name:</strong> {transaction.name}</p>
        <p><strong>Description:</strong> {transaction.description}</p>
        <p><strong>Amount:</strong> ${transaction.amount}</p>
        <p><strong>Type:</strong> {transaction.isExpense ? 'Expense' : 'Payment'}</p>
        <p><strong>Status:</strong> {transaction.isSettled ? 'Settled' : 'Pending'}</p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const [userTransactions, setUserTransactions] = useState([]);
  const [totalIncoming, setTotalIncoming] = useState("0");
  const [totalOutgoing, setTotalOutgoing] = useState("0");
  const [generalBalance, setGeneralBalance] = useState("0");
  const [provider, setProvider] = useState(null);
  const billBuddy = useBillBuddy();
  const { address, isConnected } = useAccount();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

  useEffect(() => {
    if (address && provider) {
      (async () => {
        await billBuddy.getUserAddress();
        await fetchUserData();
        console.log("Fetching general balance for address:", address);
        let balance = await provider.getBalance(address);
        console.log("General Balance:", ethers.utils.formatEther(balance));
        setGeneralBalance(ethers.utils.formatEther(balance));
      })();
    }
  }, [address, billBuddy, provider]);

  const fetchUserData = async () => {
    if (address) {
      try {
        const transactions = await billBuddy.getUserTransactions(address);
        setUserTransactions(transactions);
        const incomingTotal = transactions
          .filter(tx => !tx.isExpense)
          .reduce((sum, tx) => sum + Number(tx.amount), 0);
        const outgoingTotal = transactions
          .filter(tx => tx.isExpense)
          .reduce((sum, tx) => sum + Number(tx.amount), 0);
        setTotalIncoming(incomingTotal.toFixed(2));
        setTotalOutgoing(outgoingTotal.toFixed(2));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const handlePay = async (id, amount, isExpense) => {
    try {
      await billBuddy.contributeToTransaction(id, amount, isExpense);
      fetchUserData(); // Refresh the transaction list
    } catch (error) {
      console.error("Error contributing to transaction:", error);
    }
  };

  const handleCreateTransaction = async (name, description, participants, shares, totalAmount, receiver, isExpense) => {
    try {
      await billBuddy.createSharedTransaction(name, description, participants, shares, totalAmount, receiver, isExpense);
      fetchUserData(); // Refresh the transaction list
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-2xl mb-8">
        <p className="text-l mb-4">Your Web3 addresss, {address}</p>
        <p className="text-xl font-semibold mb-4">Your General Balance: {generalBalance}</p>
      </div>
      <div className="flex flex-col md:flex-row justify-between w-full max-w-2xl mb-8">
        <div className="bg-green-100 p-4 rounded-lg shadow-md w-full md:w-[48%] mb-4 md:mb-0">
          <h2 className="text-lg font-semibold mb-2">Total Incoming</h2>
          <p className="text-2xl font-bold text-green-600">${totalIncoming}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg shadow-md w-full md:w-[48%]">
          <h2 className="text-lg font-semibold mb-2">Total Outgoing</h2>
          <p className="text-2xl font-bold text-red-600">${totalOutgoing}</p>
        </div>
      </div>
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="px-6 py-3 mb-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
      >
        Create New Transaction
      </button>

      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        createTransaction={handleCreateTransaction}
      />

      <ViewTransactionModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        transaction={selectedTransaction}
      />

      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Your Transactions</h2>
        <ul>
          {userTransactions.map((tx, index) => (
            <li key={index} className="mb-4 p-4 bg-gray-100 rounded-lg shadow-md">
              <p className="font-semibold">{tx.name}</p>
              <p>{tx.description}</p>
              <p><strong>Amount:</strong> ${tx.amount}</p>
              <p><strong>Type:</strong> {tx.isExpense ? 'Expense' : 'Payment'}</p>
              <p><strong>Status:</strong> {tx.isSettled ? 'Settled' : 'Pending'}</p>
              <div className="flex justify-end mt-2">
                {!tx.isSettled && (
                  <button
                    onClick={() => handlePay(tx.id, tx.amount, tx.isExpense)}
                    className="px-4 py-2 mr-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none"
                  >
                    Pay
                  </button>
                )}
                <button
                  onClick={() => handleViewDetails(tx)}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
                >
                  View Details
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
