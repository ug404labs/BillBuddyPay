"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from "../config";
import { useRouter } from "next/navigation";
import { socialConnect } from "../utils/socialconnect";

import GroupSavingsABI from "../contracts/groupManager.abi.json";
import { ethers } from "ethers";

import useGroupSavings from "../hooks/useGroupManagement";

import { PlusCircle, DollarSign, Users } from 'lucide-react';
import CreateGroupModal from './CreateGroupModal';
import ContributeModal from './ContributeModal';


export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedChain, setSelectedChain] = useState("Celo");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
    const router = useRouter();
    const auth = getAuth(app);

    const contractAddress = process.env.NEXT_PUBLIC_GROUP_CELO_ADDRESS || "0x180d2967Cb720DCA95dAB7306AA34369837d9345";
    const { savingGroups, error: groupError, createSavingGroup, contributeToGroup } = useGroupSavings(contractAddress, selectedChain);

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
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div>
                        <button onClick={handleChainToggle} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
                            {selectedChain === "Celo" ? "Switch to Arbitrum" : "Switch to Celo"}
                        </button>
                        <button onClick={handleSignOut} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">User Info</h2>
                        <p className="mb-2">Phone: {user?.phoneNumber || 'N/A'}</p>
                        <p>Wallet: {user?.address || 'N/A'}</p>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Total Groups</h2>
                        <p className="text-4xl font-bold">{savingGroups?.length || 0}</p>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                        <button onClick={() => setIsCreateModalOpen(true)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 flex items-center">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Group
                        </button>
                        <button 
                            onClick={() => setIsContributeModalOpen(true)} 
                            className={`bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center ${!savingGroups?.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!savingGroups?.length}
                        >
                            <DollarSign className="mr-2 h-4 w-4" /> Contribute
                        </button>
                    </div>
                </div>

                <button onClick={() => router.push('/sacco')} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-6 flex items-center">
                    <Users className="mr-2 h-4 w-4" /> Manage SACCO Groups
                </button>

                <CreateGroupModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={createSavingGroup}
                />

                <ContributeModal
                    isOpen={isContributeModalOpen}
                    onClose={() => setIsContributeModalOpen(false)}
                    onSubmit={contributeToGroup}
                    groups={savingGroups || []}
                />

                {groupError && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-red-500 text-white text-center">
                        {groupError}
                    </div>
                )}
            </div>
        </div>
    );
}