import { useState, useEffect, useCallback } from "react";
import GroupSavingsABI from "../contracts/groupManager.abi.json";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useMemo } from 'react';

import db from '../utils/firestone';
import { http } from 'viem'
import { createPublicClient,publicActions, createWalletClient,parseUnits } from 'viem';
import { mainnet, celoAlfajores, optimismGoerli, liskSepolia} from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';


const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GROUP_CELO_ADDRESS || "0x180d2967Cb720DCA95dAB7306AA34369837d9345";

const useGroupSavings = (contractAddress, selectedChain, firebaseUser) => {
    const [savingGroups, setSavingGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [account, setAccount] = useState(null);

    console.log('Selected Chain:', selectedChain);
    const publicClient = useMemo(() => {
        return createPublicClient({
            chain: celoAlfajores || mainnet,
            transport: http(),
        });
    }, [selectedChain]);  // Memoize based on the selected chain
    
    useEffect(() => {
        if (!firebaseUser || !firebaseUser.phoneNumber) {
            setError('Firebase user or phone number not available');
            setLoading(false);
            return;
        }
    
        const initializeProviderAndContract = async () => {
            try {
                const userRef = doc(db, 'users', firebaseUser.phoneNumber);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const { privateKey } = userSnap.data();
                    setAccount(privateKeyToAccount(privateKey));
                } else {
                    throw new Error('User not found in Firestore');
                }
            } catch (err) {
                setError(`Failed to initialize provider and contract: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
    
        initializeProviderAndContract();
    }, [firebaseUser, selectedChain]);  // Remove publicClient and account from dependencies
    

   
    const fetchGroups = useCallback(async () => {
        if (!contractAddress) return;
    
        try {
            const groups = await publicClient.readContract({
                address: contractAddress,
                abi: GroupSavingsABI,
                functionName: 'savingGroups',
            });
            setSavingGroups(groups);
        } catch (err) {
            setError(`Failed to fetch groups: ${err.message}`);
        }
    }, [contractAddress, publicClient]);
    
    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);
    
    

    const createSavingGroup = async (name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration) => {
        console.log('Creating saving group with details:', { name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration });
    
        try {
            // Convert totalAmount and contributionAmount to strings if they are not already
            const totalAmountStr = typeof totalAmount === 'string' ? totalAmount : totalAmount.toString();
            const contributionAmountStr = typeof contributionAmount === 'string' ? contributionAmount : contributionAmount.toString();
    
            // Convert amounts to smallest units
            const totalAmountInSmallestUnit = parseUnits(totalAmountStr, 18); // Adjust decimals as needed
            const contributionAmountInSmallestUnit = parseUnits(contributionAmountStr, 18); // Adjust decimals as needed
    
            // Create wallet client
            const walletClient = createWalletClient({
                account,
                chain: celoAlfajores,
                transport: http(),
            }).extend(publicActions) ;
            //log wallet network
            console.log('Wallet network:', walletClient.network);
    
            // Send the transaction to create a saving group
            const tx = await walletClient.writeContract({
                address: CONTRACT_ADDRESS,
                abi: GroupSavingsABI,
                functionName: 'createSavingGroup',
                args: [name, savingType, members, totalAmountInSmallestUnit,
                    contributionAmountInSmallestUnit, rounds, roundDuration],
                // feeCurrency: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
            });

            console.log('Transaction sent:', tx);
    
            // Wait for transaction confirmation
            await walletClient.waitForTransactionReceipt({ hash: tx.hash });
            console.log('Transaction confirmed.');
    
            // Fetch the updated groups
            await fetchGroups();
        } catch (err) {
            setError(`Failed to create saving group: ${err.message}`);
            console.error(err);
        }
    };
    
    const contributeToGroup = async (groupId, amount) => {
        if (!contract) return;

        try {
            console.log(`Contributing ${amount} to group ${groupId}`);
            const amountInSmallestUnit = parseUnits(amount, 18); // Adjust decimals as needed
            const  walletClient = createPublicClient({
                chain: celoAlfajores || optimismGoerli || mainnet,
                transport: http(),
            })
            console.log('Contract instance created:', contract);
            const tx = await walletClient.writeContract({
                address: contractAddress,
                abi: GroupSavingsABI,
                functionName: 'contributeToGroup',
                args: [groupId, amountInSmallestUnit],
                overrides: {
                    gasLimit: 1000000
                }
            })

            await fetchGroups();
        } catch (err) {
            setError(`Failed to contribute to group: ${err.message}`);
            console.error(err);
        }
    };

    const settleRound = async (groupId) => {
        try {
            const  walletClient = createWalletClient({
                account,
                chain: celoAlfajores || optimismGoerli || mainnet,
                transport: http(),
            })
            console.log('Contract instance created:', contract);
            const tx = await walletClient.writeContract({
                address: contractAddress,
                abi: GroupSavingsABI,
                functionName: 'settleRound',
                args: [groupId],
                overrides: {
                    gasLimit: 1000000
                }
            })
            console.log('Transaction sent:', tx);
            await walletClient.waitForTransactionReceipt({ hash: tx.hash });
            console.log('Transaction confirmed.');
        } catch (err) {
            setError(`Failed to settle round: ${err.message}`);
            console.error(err);
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
