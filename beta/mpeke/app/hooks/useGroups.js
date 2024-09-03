import { useState, useEffect } from "react";
import { ethers } from "ethers";
import GroupSavingsABI from "../contracts/groupManager.abi.json"; // Replace with the actual path to your ABI

const useGroupSavings = (contractAddress, selectedChain) => {
    const [savingGroups, setSavingGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, GroupSavingsABI, signer);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const groupCount = await contract.groupCount();
                const groups = [];
                for (let i = 1; i <= groupCount; i++) {
                    const group = await contract.savingGroups(i);
                    groups.push(group);
                }
                setSavingGroups(groups);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [contract]);

    const createSavingGroup = async (name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration) => {
        try {
            const tx = await contract.createSavingGroup(name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration);
            await tx.wait();
            // Optionally refresh the groups after creation
            await fetchGroups();
        } catch (err) {
            setError(err.message);
        }
    };

    const contributeToGroup = async (groupId, amount) => {
        try {
            const tx = await contract.contributeToGroup(groupId, amount);
            await tx.wait();
            // Optionally refresh the groups after contribution
            await fetchGroups();
        } catch (err) {
            setError(err.message);
        }
    };

    const settleRound = async (groupId) => {
        try {
            const tx = await contract.settleRound(groupId);
            await tx.wait();
            // Optionally refresh the groups after settling
            await fetchGroups();
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        savingGroups,
        loading,
        error,
        createSavingGroup,
        contributeToGroup,
        settleRound,
    };
};

export default useGroupSavings;