import { useState } from "react";
import {
    createPublicClient,
    createWalletClient,
    custom,
    getContract,
    http,
    parseUnits,
    formatUnits,
} from "viem";
import { celoAlfajores } from "viem/chains";
import BillBuddyABI from "../abis/BillBuddy.abi.json"; // Corrected import path

const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
});

const BILLBUDDY_PAY_CONTRACT = process.env.REACT_APP_BILLBUDDY_PAY_CONTRACT ?? "0x19Bb51d383186369B5122B72a196A57C63f2c2bD";
const cUSDTokenAddress = process.env.REACT_APP_CUSD_TOKEN_ADDRESS ?? "0x874069fa1eb16d44d622f2e0ca25eea172369bc1"; // Testnet
console.log("Contract bill Address", BILLBUDDY_PAY_CONTRACT);

export interface SharedTransaction {
    id: number;
    name: string;
    description: string;
    amount: string;
    isSettled: boolean;
    isExpense: boolean;
}

interface BillBuddyHook {
    address: string | null;
    getUserAddress: () => Promise<void>;
    createSharedTransaction: (name: string, description: string, participants: string[], shares: number[], totalAmount: string, receiver: string, isExpense: boolean) => Promise<any>;
    contributeToTransaction: (transactionId: number, amount: string, isExpense: boolean) => Promise<any>;
    getUserTransactions: (userAddress: string) => Promise<SharedTransaction[]>;
}

interface ContractSharedTransaction {
    id: bigint;
    name: string;
    description: string;
    totalAmount: bigint;
    paidAmount: bigint;
    receiver?: string;
    payers?: string[];
    shares?: bigint[];
    recipients?: string[];
    isSettled: boolean;
    isExpense: boolean;
}

export const useBillBuddy = (): BillBuddyHook => {
    const [address, setAddress] = useState<string | null>(null);

    const getUserAddress = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            let walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celoAlfajores,
            });

            let [address] = await walletClient.getAddresses();
            setAddress(address);
        }
    };

    const createSharedTransaction = async (name: string, description: string, participants: string[], shares: number[], totalAmount: string, receiver: string, isExpense: boolean) => {
        try {
            let walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celoAlfajores,
            });

            let [address] = await walletClient.getAddresses();
            const totalAmountInSmallestUnit = parseUnits(totalAmount, 6);
            const functionName = isExpense ? "createExpense" : "createPayment";

            const tx = await walletClient.writeContract({
                address: BILLBUDDY_PAY_CONTRACT,
                abi: BillBuddyABI,
                functionName,
                account: address,
                args: isExpense ? [name, description, participants, shares, totalAmountInSmallestUnit, receiver] : [name, description, participants, shares, totalAmountInSmallestUnit],
            });

            let receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
            return receipt;
        } catch (error) {
            console.error("Error creating shared transaction:", error);
        }
    };

    const contributeToTransaction = async (transactionId: number, amount: string, isExpense: boolean) => {
        try {
            let walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celoAlfajores,
            });

            let [address] = await walletClient.getAddresses();
            const amountInSmallestUnit = parseUnits(amount, 6);
            const functionName = isExpense ? "contributeToExpense" : "contributeToPayment";

            const tx = await walletClient.writeContract({
                address: BILLBUDDY_PAY_CONTRACT,
                abi: BillBuddyABI,
                functionName,
                account: address,
                args: [transactionId, amountInSmallestUnit],
            });

            let receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
            return receipt;
        } catch (error) {
            console.error("Error contributing to transaction:", error);
        }
    };

    const getUserTransactions = async (userAddress: string): Promise<SharedTransaction[]> => {
        try {
            const billBuddyContract = getContract({
                address: BILLBUDDY_PAY_CONTRACT,
                abi: BillBuddyABI,
                publicClient,
            });

            const expenseIds = await billBuddyContract.read.getUserExpenses([userAddress]) as bigint[];
            const paymentIds = await billBuddyContract.read.getUserPayments([userAddress]) as bigint[];

            const expensePromises = expenseIds.map(async (id: bigint) => {
                const transaction = await billBuddyContract.read.getExpenseDetails([id]) as ContractSharedTransaction;
                return {
                    id: Number(id),
                    name: transaction.name,
                    description: transaction.description,
                    amount: formatUnits(transaction.totalAmount, 6),
                    isSettled: transaction.paidAmount >= transaction.totalAmount,
                    isExpense: true,
                };
            });

            const paymentPromises = paymentIds.map(async (id: bigint) => {
                const transaction = await billBuddyContract.read.getPaymentDetails([id]) as ContractSharedTransaction;
                return {
                    id: Number(id),
                    name: transaction.name,
                    description: transaction.description,
                    amount: formatUnits(transaction.totalAmount, 6),
                    isSettled: transaction.paidAmount >= transaction.totalAmount,
                    isExpense: false,
                };
            });

            const transactions = await Promise.all([...expensePromises, ...paymentPromises]);
            return transactions.filter(transaction => transaction !== null) as SharedTransaction[];
        } catch (error) {
            console.error("Error fetching user transactions:", error);
            return [];
        }
    };

    return {
        address,
        getUserAddress,
        createSharedTransaction,
        contributeToTransaction,
        getUserTransactions,
    };
};
