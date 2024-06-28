import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useBillBuddy, SharedTransaction } from "../hooks/useBillBuddy";

export default function UserProfile() {
    const [userTransactions, setUserTransactions] = useState<SharedTransaction[]>([]);
    const [totalIncoming, setTotalIncoming] = useState<string>("0");
    const [totalOutgoing, setTotalOutgoing] = useState<string>("0");
    const { address, isConnected } = useAccount();
    const billBuddy = useBillBuddy();

    useEffect(() => {
        if (address) {
            fetchUserData();
        }
    }, [address, billBuddy]);
  
    async function fetchUserData() {
        if (address) {
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
        }
    }

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            
            <div className="flex justify-between w-full max-w-2xl mb-8">
                <div className="bg-green-100 p-4 rounded-lg shadow-md w-[48%]">
                    <h2 className="text-lg font-semibold mb-2">Total Incoming</h2>
                    <p className="text-2xl font-bold text-green-600">${totalIncoming}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg shadow-md w-[48%]">
                    <h2 className="text-lg font-semibold mb-2">Total Outgoing</h2>
                    <p className="text-2xl font-bold text-red-600">${totalOutgoing}</p>
                </div>
            </div>

            <div className="w-full max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">Transactions History</h2>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 text-left">Type</th>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Description</th>
                            <th className="p-2 text-left">Amount</th>
                            <th className="p-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userTransactions
                            .sort((a, b) => Number(b.id) - Number(a.id))
                            .map((item, index) => (
                                <tr key={index} className={item.isExpense ? 'bg-red-50' : 'bg-green-50'}>
                                    <td className="p-2">{item.isExpense ? 'Expense' : 'Payment'}</td>
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2">{item.description}</td>
                                    <td className="p-2">${item.amount}</td>
                                    <td className="p-2">{item.isSettled ? 'Settled' : 'Pending'}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}