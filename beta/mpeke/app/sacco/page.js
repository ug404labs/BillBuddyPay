import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useGroupSavings from "../hooks/useGroupSavings";
import { ethers } from "ethers";
import { Button, Card, CardContent, CardHeader, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
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
                    <Button onClick={() => router.push('/')} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Your SACCO Groups</h2>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Current Round</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {savingGroups.map((group) => (
                                    <TableRow key={group.id.toString()}>
                                        <TableCell>{group.id.toString()}</TableCell>
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell>{group.savingType === 0 ? "Fixed" : "Circular"}</TableCell>
                                        <TableCell>{ethers.utils.formatUnits(group.totalAmount, 6)} USDC</TableCell>
                                        <TableCell>{group.currentRound.toString()}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleSettleRound(group.id)} size="sm">
                                                <RefreshCw className="mr-2 h-4 w-4" /> Settle Round
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {error && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-red-500 text-white text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}