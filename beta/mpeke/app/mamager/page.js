"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from "next/navigation";
import { socialConnect } from "../utils/socialconnect";
import { app } from "../config";
import { PlusCircle, DollarSign, Users, CreditCard, FileText, TrendingUp } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';
import ContributeModal from './ContributeModal';
import useGroupSavings from "../hooks/useGroups";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedChain, setSelectedChain] = useState("Celo");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
    const [contractAddress, setContractAddress] = useState(process.env.NEXT_PUBLIC_GROUP_CELO_ADDRESS || "0x180d2967Cb720DCA95dAB7306AA34369837d9345");
    const router = useRouter();
    const auth = getAuth(app);

    const { savingGroups, error: groupError, createSavingGroup, contributeToGroup } = useGroupSavings(contractAddress, selectedChain, user);

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
        const newChain = selectedChain === "Celo" ? "Optimism" : "Celo";
        setSelectedChain(newChain);
        setContractAddress(newChain === "Celo" ? process.env.NEXT_PUBLIC_GROUP_CELO_ADDRESS : process.env.NEXT_PUBLIC_GROUP_ARBITRUM_ADDRESS);
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

    const handleCreateSavingGroup = async (name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration) => {
        try {
            console.log(name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration);
            await createSavingGroup(name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error("Error creating saving group:", error);
            alert("Failed to create saving group. Please try again.");
        }
    };

    const handleContributeToGroup = async (groupId, amount) => {
        try {
            await contributeToGroup(groupId, amount);
            setIsContributeModalOpen(false);
        } catch (error) {
            console.error("Error contributing to group:", error);
            alert("Failed to contribute to group. Please try again.");
        }
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
                    <h1 className="text-3xl font-bold">Mpeke - Dashboard</h1>
                    <div>
                        <button onClick={handleChainToggle} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
                            {selectedChain === "Celo" ? "Switch to Optimism" : "Switch to Celo"}
                        </button>
                        <button onClick={handleSignOut} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Payments and Cards Section */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Payments and Cards</h2>
                        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 flex items-center mb-2">
                            <CreditCard className="mr-2 h-4 w-4" /> View Cards
                        </button>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
                            <FileText className="mr-2 h-4 w-4" /> Transaction History
                        </button>
                    </div>

                    {/* SACCO Payments Section */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">SACCO Payments</h2>
                        <button onClick={() => setIsCreateModalOpen(true)} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-2 flex items-center">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create SACCO
                        </button>
                        <button onClick={() => router.push('/sacco/join')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 flex items-center">
                            <Users className="mr-2 h-4 w-4" /> Join SACCO
                        </button>
                        <button onClick={() => setIsContributeModalOpen(true)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2 flex items-center">
                            <DollarSign className="mr-2 h-4 w-4" /> Contribute to SACCO
                        </button>
                        <button onClick={() => router.push('/sacco/history')} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center">
                            <FileText className="mr-2 h-4 w-4" /> SACCO Transaction History
                        </button>
                    </div>

                    {/* Staking and Investments Section */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Staking and Investments</h2>
                        <button onClick={() => router.push('/investments/my')} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-2 flex items-center">
                            <TrendingUp className="mr-2 h-4 w-4" /> My Investments
                        </button>
                        <button onClick={() => router.push('/investments/earnings')} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2 flex items-center">
                            <DollarSign className="mr-2 h-4 w-4" /> My Earnings
                        </button>
                        <button onClick={() => router.push('/investments/browse')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 flex items-center">
                            <Users className="mr-2 h-4 w-4" /> Browse Investments
                        </button>
                        <button onClick={() => router.push('/investments/upload')} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center">
                            <PlusCircle className="mr-2 h-4 w-4" /> Upload Investment
                        </button>
                    </div>
                </div>

                <CreateGroupModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateSavingGroup}
                />

                <ContributeModal
                    isOpen={isContributeModalOpen}
                    onClose={() => setIsContributeModalOpen(false)}
                    onSubmit={handleContributeToGroup}
                    savingGroups={savingGroups}
                />
            </div>
        </div>
    );
}