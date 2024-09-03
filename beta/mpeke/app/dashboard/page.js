"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from "../config";
import { useRouter } from "next/navigation";
import { socialConnect } from "../utils/socialconnect";
import useGroupSavings from "../hooks/useGroupSavings";
import { ethers } from "ethers";
import { Button, Card, CardContent, CardHeader, Modal } from '@/components/ui';
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
                        <Button onClick={handleChainToggle} className="mr-4">
                            {selectedChain === "Celo" ? "Switch to Arbitrum" : "Switch to Celo"}
                        </Button>
                        <Button onClick={handleSignOut} variant="destructive">
                            Sign Out
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">User Info</h2>
                        </CardHeader>
                        <CardContent>
                            <p>Phone: {user.phoneNumber}</p>
                            <p>Wallet: {user.address}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Total Groups</h2>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{savingGroups.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Quick Actions</h2>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setIsCreateModalOpen(true)} className="mr-2">
                                <PlusCircle className="mr-2 h-4 w-4" /> Create Group
                            </Button>
                            <Button onClick={() => setIsContributeModalOpen(true)}>
                                <DollarSign className="mr-2 h-4 w-4" /> Contribute
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Button onClick={() => router.push('/sacco')} className="mb-6">
                    <Users className="mr-2 h-4 w-4" /> Manage SACCO Groups
                </Button>

                <CreateGroupModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={createSavingGroup}
                />

                <ContributeModal
                    isOpen={isContributeModalOpen}
                    onClose={() => setIsContributeModalOpen(false)}
                    onSubmit={contributeToGroup}
                    groups={savingGroups}
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