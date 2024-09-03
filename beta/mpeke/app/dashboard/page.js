"use client";

import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from "../config";
import { useRouter } from "next/navigation";
import { socialConnect } from "../utils/socialconnect";
import useGroupManagement from "../hooks/useGroupManagement"; // Import the custom hook
import { ethers, JsonRpcApiProvider } from "ethers";


export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedChain, setSelectedChain] = useState("Celo");
    const [groupForm, setGroupForm] = useState({ name: "", savingType: 0, members: "", totalAmount: "", contributionAmount: "", rounds: "", roundDuration: "" });
    const [contributionForm, setContributionForm] = useState({ groupId: "", amount: "" });
    const router = useRouter();
    const auth = getAuth(app);

    // Replace with your contract address
    const contractAddress = process.env.NEXT_PUBLIC_GROUP_CELO_ADDRESS || "0x180d2967Cb720DCA95dAB7306AA34369837d9345"; 
    const { createSavingGroup, contributeToGroup, error } = useGroupManagement(contractAddress, selectedChain);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userData = await socialConnect(firebaseUser.phoneNumber);
                    setUser(userData);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    alert("Failed to fetch user data. Please try signing in again.");
                    await signOut(auth);
                    router.push("/signin");
                }
            } else {
                router.push("/signin");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth, router]);

    const handleChainToggle = () => {
        setSelectedChain(selectedChain === "Celo" ? "Arbitrum" : "Celo");
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push("/signin");
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Failed to sign out. Please try again.");
        }
    };

    const handleGroupChange = (e) => {
        const { name, value } = e.target;
        setGroupForm({ ...groupForm, [name]: value });
    };

    const handleContributionChange = (e) => {
        const { name, value } = e.target;
        setContributionForm({ ...contributionForm, [name]: value });
    };

    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        const { name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration } = groupForm;
        await createSavingGroup(name, savingType, members.split(','), ethers.utils.parseUnits(totalAmount, 6), ethers.utils.parseUnits(contributionAmount, 6), rounds, roundDuration);
        setGroupForm({ name: "", savingType: 0, members: "", totalAmount: "", contributionAmount: "", rounds: "", roundDuration: "" });
    };

    const handleContributionSubmit = async (e) => {
        e.preventDefault();
        await contributeToGroup(contributionForm.groupId, ethers.utils.parseUnits(contributionForm.amount, 6));
        setContributionForm({ groupId: "", amount: "" });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-semibold">Dashboard</h1>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                            >
                                Sign Out
                            </button>
                        </div>
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <p>Phone Number: <span className="font-semibold">{user.phoneNumber}</span></p>
                                <p>Wallet Address: <span className="font-semibold">{user.address}</span></p>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-lg font-medium">Selected Chain: {selectedChain}</span>
                                    <button
                                        onClick={handleChainToggle}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                    >
                                        Toggle Chain
                                    </button>
                                </div>
                            </div>

                            <div className="pt-8">
                                <h2 className="text-xl font-semibold mb-4">Create Saving Group</h2>
                                <form onSubmit={handleGroupSubmit} className="space-y-4">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Group Name"
                                        value={groupForm.name}
                                        onChange={handleGroupChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <select
                                        name="savingType"
                                        value={groupForm.savingType}
                                        onChange={handleGroupChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="0">Fixed</option>
                                        <option value="1">Circular</option>
                                    </select>
                                    <input
                                        type="text"
                                        name="members"
                                        placeholder="Members (comma-separated addresses)"
                                        value={groupForm.members}
                                        onChange={handleGroupChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="totalAmount"
                                        placeholder="Total Amount"
                                        value={groupForm.totalAmount}
                                        onChange={handleGroupChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="contributionAmount"
                                        placeholder="Contribution Amount"
                                        value={groupForm.contributionAmount}
                                        onChange={handleGroupChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="rounds"
                                        placeholder="Total Rounds"
                                        value={groupForm.rounds}
                                        onChange={handleGroupChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="roundDuration"
                                        placeholder="Round Duration (seconds)"
                                        value={groupForm.roundDuration}
                                        onChange={handleGroupChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                    >
                                        Create Group
                                    </button>
                                </form>
                            </div>

                            <div className="pt-8">
                                <h2 className="text-xl font-semibold mb-4">Contribute to Group</h2>
                                <form onSubmit={handleContributionSubmit} className="space-y-4">
                                    <input
                                        type="text"
                                        name="groupId"
                                        placeholder="Group ID"
                                        value={contributionForm.groupId}
                                        onChange={handleContributionChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="amount"
                                        placeholder="Amount"
                                        value={contributionForm.amount}
                                        onChange={handleContributionChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                    >
                                        Contribute
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-red-500 text-white text-center">
                    {error}
                </div>
            )}
        </div>
    );
}
