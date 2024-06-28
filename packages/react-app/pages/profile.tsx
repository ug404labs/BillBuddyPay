import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useBillBuddy, Payment, Expense } from "../hooks/useBillBuddy";

export default function UserProfile() {
    const [userPayments, setUserPayments] = useState<Payment[]>([]);
    const [userExpenses, setUserExpenses] = useState<Expense[]>([]);
    const [totalPayments, setTotalPayments] = useState<string>("0");
    const [totalExpenses, setTotalExpenses] = useState<string>("0");
    const { address, isConnected } = useAccount();
    const billBuddy = useBillBuddy();

    useEffect(() => {
        if (address) {
            fetchUserData();
        }
    }, [address, billBuddy]);
  
    async function fetchUserData() {
        if (address) {
            const payments = await billBuddy.getUserPayments(address);
            const expenses = await billBuddy.getUserExpenses(address);
            setUserPayments(payments);
            setUserExpenses(expenses);
            const paymentsTotal = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
            const expensesTotal = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
            setTotalPayments(paymentsTotal.toFixed(2));
            setTotalExpenses(expensesTotal.toFixed(2));
        }
    }

    

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            
            <div className="flex justify-between w-full max-w-2xl mb-8">
                <div className="bg-green-100 p-4 rounded-lg shadow-md w-[48%]">
                    <h2 className="text-lg font-semibold mb-2">Total Payments</h2>
                    <p className="text-2xl font-bold text-green-600">${totalPayments}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg shadow-md w-[48%]">
                    <h2 className="text-lg font-semibold mb-2">Total Expenses</h2>
                    <p className="text-2xl font-bold text-red-600">${totalExpenses}</p>
                </div>
            </div>

            <div className="w-full max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">Transactions History</h2>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 text-left">Type</th>
                            <th className="p-2 text-left">Description</th>
                            <th className="p-2 text-left">Amount</th>
                            <th className="p-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...userPayments, ...userExpenses]
                            .sort((a, b) => Number(b.id) - Number(a.id))
                            .map((item, index) => (
                                <tr key={index} className={item.type === 'payment' ? 'bg-green-50' : 'bg-red-50'}>
                                    <td className="p-2">{item.type === 'payment' ? 'Payment' : 'Expense'}</td>
                                    <td className="p-2">{item.description}</td>
                                    <td className="p-2">${item.amount}</td>
                                    <td className="p-2">{item.type === 'payment' ? (item.isSettled ? 'Settled' : 'Pending') : (item.isPaid ? 'Paid' : 'Unpaid')}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}