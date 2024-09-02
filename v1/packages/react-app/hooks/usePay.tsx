import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { formatEther } from 'viem';
import SharedPaymentsAbi from '../abis/SharedPayments.json';

export const SHARED_PAYMENTS_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with your contract address

export type Participant = {
  wallet: string;
  percentage: number;
};

export type Transaction = {
  id: bigint;
  transactionType: 'Expense' | 'Income';
  amount: bigint;
  receiver: string;
  sharedIncomeId: bigint;
  participants: Participant[];
  isUnlimited: boolean;
  isCompleted: boolean;
};

export function useSharedPayments() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (address) {
      fetchTransactions();
    }

    return () => {
      setTransactions(null);
    };
  }, [address]);

  const fetchTransactions = useCallback(async () => {
    if (!address) return;

    try {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let sharedPaymentsContract = new ethers.Contract(
        SHARED_PAYMENTS_CONTRACT_ADDRESS,
        SharedPaymentsAbi,
        provider
      );

      const transactionCount = await sharedPaymentsContract.transactionCount();
      let _transactions = [];

      for (let i = 0; i < transactionCount; i++) {
        let _transaction = await getTransactionFromId(i);
        _transactions.push(_transaction);
      }

      setTransactions(_transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  }, [address]);

  const getTransactionFromId = async (transactionId: number): Promise<Transaction> => {
    const result = await publicClient.readContract({
      address: SHARED_PAYMENTS_CONTRACT_ADDRESS,
      abi: SharedPaymentsAbi,
      functionName: 'getTransaction',
      args: [transactionId],
    });

    return {
      id: BigInt(transactionId),
      transactionType: result[0] === 0 ? 'Expense' : 'Income',
      amount: result[1],
      receiver: result[2],
      sharedIncomeId: result[3],
      participants: result[4].map((p: any) => ({ wallet: p.wallet, percentage: Number(p.percentage) })),
      isUnlimited: result[5],
      isCompleted: result[6],
    };
  };

  const createSharedExpense = useCallback(async (
    amount: bigint,
    receiver: string,
    participants: Participant[],
    title: string
  ) => {
    if (!isConnected) throw new Error('Wallet not connected');

    try {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      let sharedPaymentsContract = new ethers.Contract(
        SHARED_PAYMENTS_CONTRACT_ADDRESS,
        SharedPaymentsAbi,
        signer
      );

      const tx = await sharedPaymentsContract.createSharedExpense(amount, receiver, participants, title);
      await tx.wait();
      await fetchTransactions(); // Refresh transactions after creating a new one
    } catch (error) {
      console.error('Failed to create shared expense:', error);
      throw error;
    }
  }, [isConnected, fetchTransactions]);

  const processPayment = useCallback(async (transactionId: number, value: bigint) => {
    if (!isConnected) throw new Error('Wallet not connected');

    try {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let signer = provider.getSigner();
      let sharedPaymentsContract = new ethers.Contract(
        SHARED_PAYMENTS_CONTRACT_ADDRESS,
        SharedPaymentsAbi,
        signer
      );

      const tx = await sharedPaymentsContract.processPayment(transactionId, { value });
      await tx.wait();
      await fetchTransactions(); // Refresh transactions after processing payment
    } catch (error) {
      console.error('Failed to process payment:', error);
      throw error;
    }
  }, [isConnected, fetchTransactions]);

  return {
    transactions,
    createSharedExpense,
    processPayment,
    fetchTransactions,
  };
}