import { useState } from "react";
import { ethers } from "ethers";
import GroupSavingsABI from "../contracts/groupManager.abi.json"; // Replace with the actual path to your ABI

const useGroupManagement = (contractAddress, selectedChain) => {
    const [error, setError] = useState(null);

    const createSavingGroup = async (name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, GroupSavingsABI, signer);
            
            const tx = await contract.createSavingGroup(name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration);
            await tx.wait();
        } catch (err) {
            setError(err.message);
        }
    };

    const contributeToGroup = async (groupId, amount) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, GroupSavingsABI, signer);
            
            const tx = await contract.contributeToGroup(groupId, amount);
            await tx.wait();
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        createSavingGroup,
        contributeToGroup,
        error,
    };
};

export default useGroupManagement;