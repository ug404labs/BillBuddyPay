"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useGroupSavings from "../hooks/useGroupManagement";
import { ethers } from "ethers";
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function SACCOPage() {
    const router = useRouter();
    const [selectedChain, setSelectedChain] = useState("Celo");
    const contractAddress = process.env.NEXT_PUBLIC_GROUP_CELO_ADDRESS || "0x180d2967Cb720DCA95dAB7306AA34369837d9345";
    const { savingGroups, loading, error, settleRound } = useGroupSavings(contractAddress, selectedChain);

    const handleSettleRound = async (groupId) => {
        await settleRound(groupId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">SACCO Group Management</h1>
                    <button 
                        onClick={() => router.push('/dashboard')} 
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </button>
                </div>
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-4 py-5 sm:px-6">
                        <h2 className="text-xl font-semibold">Your SACCO Groups</h2>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        {savingGroups && savingGroups.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Round</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {savingGroups.map((group) => (
                                            <tr key={group.id.toString()}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.id.toString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{group.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.savingType === 0 ? "Fixed" : "Circular"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ethers.utils.formatUnits(group.totalAmount, 6)} USDC</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.currentRound.toString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button 
                                                        onClick={() => handleSettleRound(group.id)}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        <RefreshCw className="mr-2 h-4 w-4" /> Settle Round
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No SACCO groups found. Create a group to get started.</p>
                        )}
                    </div>
                </div>
                {error && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-red-500 text-white text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}