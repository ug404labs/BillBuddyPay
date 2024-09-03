import { useState } from "react";
import { ethers } from "ethers";
import GroupSavingsABI from "../contracts/groupManager.abi.json";

const useGroupManagement = (contractAddress, selectedChain) => {
    const [error, setError] = useState(null);

    const getProvider = () => {
        // Ensure window.ethereum is available and MetaMask is installed
        if (!window.ethereum) {
            throw new Error("No Ethereum provider found. Install MetaMask.");
        }
        return new ethers.providers.Web3Provider(window.ethereum);
    };

    const createSavingGroup = async (name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration) => {
        try {
            const provider = getProvider();
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, GroupSavingsABI, signer);

            const tx = await contract.createSavingGroup(name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration);
            await tx.wait();
        } catch (err) {
            setError(`Failed to create saving group: ${err.message}`);
            console.error(err);
        }
    };

    const contributeToGroup = async (groupId, amount) => {
        try {
            const provider = getProvider();
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, GroupSavingsABI, signer);

            const tx = await contract.contributeToGroup(groupId, amount);
            await tx.wait();
        } catch (err) {
            setError(`Failed to contribute to group: ${err.message}`);
            console.error(err);
        }
    };

    return {
        createSavingGroup,
        contributeToGroup,
        error,
    };
};

export default useGroupManagement;
