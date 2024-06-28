import { useState } from "react";
import BillBuddyPayABI from "../abis/BillBuddyPay.abi.json";
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

const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
});

const BILLBUDDY_PAY_CONTRACT = process.env.REACT_APP_BILLBUDDY_PAY_CONTRACT ?? "0x988784dca23bD96718353C5d4c965346eb8963dF";
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
    contributeToTransaction: (transactionId: number, amount: string) => Promise<any>;
    getUserTransactions: (userAddress: string) => Promise<SharedTransaction[]>;
}

interface ContractSharedTransaction {
    name: string;
    description: string;
    totalAmount: bigint;
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
        let walletClient = createWalletClient({
            transport: custom(window.ethereum),
            chain: celoAlfajores,
        });

        let [address] = await walletClient.getAddresses();

        const totalAmountInSmallestUnit = parseUnits(totalAmount, 6);

        const tx = await walletClient.writeContract({
            address: BILLBUDDY_PAY_CONTRACT,
            abi: BillBuddyPayABI,
            functionName: "createSharedTransaction",
            account: address,
            args: [name, description, participants, shares, totalAmountInSmallestUnit, receiver, isExpense],
        });

        let receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        return receipt;
    };

    const contributeToTransaction = async (transactionId: number, amount: string) => {
        let walletClient = createWalletClient({
            transport: custom(window.ethereum),
            chain: celoAlfajores,
        });

        let [address] = await walletClient.getAddresses();

        const amountInSmallestUnit = parseUnits(amount, 6);

        const tx = await walletClient.writeContract({
            address: BILLBUDDY_PAY_CONTRACT,
            abi: BillBuddyPayABI,
            functionName: "contributeToTransaction",
            account: address,
            args: [transactionId],
            value: amountInSmallestUnit,
        });

        let receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        return receipt;
    };

    const getUserTransactions = async (userAddress: string): Promise<SharedTransaction[]> => {
        const billBuddyContract = getContract({
            address: BILLBUDDY_PAY_CONTRACT,
            abi: BillBuddyPayABI,
            publicClient,
        });

        let transactionIds: bigint[];
        try {
            transactionIds = await billBuddyContract.read.getUserTransactions([userAddress]) as bigint[];
        } catch (error) {
            console.error("Error fetching user transactions:", error);
            return [];
        }

        const transactions = await Promise.all(transactionIds.map(async (id: bigint) => {
            try {
                const transaction = await billBuddyContract.read.sharedTransactions([id]) as ContractSharedTransaction;

                if (!transaction) {
                    throw new Error(`Transaction with id ${id} is undefined`);
                }

                // Ensure totalAmount is a valid number, defaulting to 0 if undefined
                const totalAmount = transaction.totalAmount ? transaction.totalAmount : BigInt(0);

                return {
                    id: Number(id),
                    name: transaction.name,
                    description: transaction.description,
                    amount: formatUnits(totalAmount, 6),
                    isSettled: transaction.isSettled,
                    isExpense: transaction.isExpense,
                };
            } catch (error) {
                console.error(`Error fetching transaction with id ${id}:`, error);
                return null;
            }
        }));

        return transactions.filter(transaction => transaction !== null) as SharedTransaction[];
    };

    return {
        address,
        getUserAddress,
        createSharedTransaction,
        contributeToTransaction,
        getUserTransactions,
    };
};