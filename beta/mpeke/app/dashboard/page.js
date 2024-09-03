"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from "../config";
import { useRouter } from "next/navigation";
import { socialConnect } from "../utils/socialconnect";
import useGroupManagement from "../hooks/useGroupManagement"; // Import the custom hook

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedChain, setSelectedChain] = useState("Celo");
    const [groupForm, setGroupForm] = useState({ name: "", savingType: 0, members: [], totalAmount: "", contributionAmount: "", rounds: "", roundDuration: "" });
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
        setGroupForm({ name: "", savingType: 0, members: [], totalAmount: "", contributionAmount: "", rounds: "", roundDuration: "" });
    };

    const handleContributionSubmit = async (e) => {
        e.preventDefault();
        await contributeToGroup(contributionForm.groupId, ethers.utils.parseUnits(contributionForm.amount, 6));
        setContributionForm({ groupId: "", amount: "" });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Phone Number: {user.phoneNumber}</p>
            <p>Wallet Address: {user.address}</p>

            <button onClick={handleChainToggle}>
                Switch to {selectedChain === "Celo" ? "Arbitrum" : "Celo"}
            </button>

            <h2>Create Saving Group</h2>
            <form onSubmit={handleGroupSubmit}>
                <input type="text" name="name" placeholder="Group Name" value={groupForm.name} onChange={handleGroupChange} required />
                <select name="savingType" value={groupForm.savingType} onChange={handleGroupChange}>
                    <option value="0">Fixed</option>
                    <option value="1">Circular</option>
                </select>
                <input type="text" name="members" placeholder="Members (comma-separated addresses)" value={groupForm.members} onChange={handleGroupChange} required />
                <input type="text" name="totalAmount" placeholder="Total Amount" value={groupForm.totalAmount} onChange={handleGroupChange} required />
                <input type="text" name="contributionAmount" placeholder="Contribution Amount" value={groupForm.contributionAmount} onChange={handleGroupChange} required />
                <input type="text" name="rounds" placeholder="Total Rounds" value={groupForm.rounds} onChange={handleGroupChange} required />
                <input type="text" name="roundDuration" placeholder="Round Duration (seconds)" value={groupForm.roundDuration} onChange={handleGroupChange} required />
                <button type="submit">Create Group</button>
            </form>

            <h2>Contribute to Group</h2>
            <form onSubmit={handleContributionSubmit}>
                <input type="text" name="groupId" placeholder="Group ID" value={contributionForm.groupId} onChange={handleContributionChange} required />
                <input type="text" name="amount" placeholder="Amount" value={contributionForm.amount} onChange={handleContributionChange} required />
                <button type="submit">Contribute</button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}