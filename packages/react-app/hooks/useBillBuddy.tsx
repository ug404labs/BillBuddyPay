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

const BILLBUDDY_PAY_CONTRACT = process.env.REACT_APP_BILLBUDDY_PAY_CONTRACT ?? "0x87C032C16D0E7d293CDbdEB7fd89d33D60fdD8E7";
const cUSDTokenAddress = process.env.REACT_APP_CUSD_TOKEN_ADDRESS ?? "0x874069fa1eb16d44d622f2e0ca25eea172369bc1"; // Testnet

export interface Payment {
    id: number;
    name: string;
    description: string;
    amount: string;
    isSettled: boolean;
    type: 'payment';
}

export interface Expense {
    id: number;
    name: string;
    description: string;
    amount: string;
    isPaid: boolean;
    type: 'expense';
}

interface BillBuddyHook {
    address: string | null;
    getUserAddress: () => Promise<void>;
    createPayment: (name: string, description: string, recipients: string[], shares: number[]) => Promise<any>;
    receivePayment: (paymentId: number, amount: string) => Promise<any>;
    createExpense: (name: string, description: string, payers: string[], shares: number[], totalAmount: string) => Promise<any>;
    payExpense: (expenseId: number) => Promise<any>;
    getUserPayments: (userAddress: string) => Promise<Payment[]>;
    getUserExpenses: (userAddress: string) => Promise<Expense[]>;
}

interface ContractPayment {
    name: string;
    description: string;
    totalReceived: bigint;
    isSettled: boolean;
}

interface ContractExpense {
    name: string;
    description: string;
    totalAmount: bigint;
    isPaid: boolean;
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

    const createPayment = async (name: string, description: string, recipients: string[], shares: number[]) => {
        let walletClient = createWalletClient({
            transport: custom(window.ethereum),
            chain: celoAlfajores,
        });

        let [address] = await walletClient.getAddresses();

        const tx = await walletClient.writeContract({
            address: BILLBUDDY_PAY_CONTRACT,
            abi: BillBuddyPayABI,
            functionName: "createPayment",
            account: address,
            args: [name, description, recipients, shares],
        });

        let receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        return receipt;
    };

    const receivePayment = async (paymentId: number, amount: string) => {
        let walletClient = createWalletClient({
            transport: custom(window.ethereum),
            chain: celoAlfajores,
        });

        let [address] = await walletClient.getAddresses();

        const amountInSmallestUnit = parseUnits(amount, 6);

        const tx = await walletClient.writeContract({
            address: BILLBUDDY_PAY_CONTRACT,
            abi: BillBuddyPayABI,
            functionName: "receivePayment",
            account: address,
            args: [paymentId, amountInSmallestUnit],
        });

        let receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        return receipt;
    };

    const createExpense = async (name: string, description: string, payers: string[], shares: number[], totalAmount: string) => {
        let walletClient = createWalletClient({
            transport: custom(window.ethereum),
            chain: celoAlfajores,
        });

        let [address] = await walletClient.getAddresses();

        const totalAmountInSmallestUnit = parseUnits(totalAmount, 6);

        const tx = await walletClient.writeContract({
            address: BILLBUDDY_PAY_CONTRACT,
            abi: BillBuddyPayABI,
            functionName: "createExpense",
            account: address,
            args: [name, description, payers, shares, totalAmountInSmallestUnit],
        });

        let receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        return receipt;
    };

    const payExpense = async (expenseId: number) => {
        let walletClient = createWalletClient({
            transport: custom(window.ethereum),
            chain: celoAlfajores,
        });

        let [address] = await walletClient.getAddresses();

        const tx = await walletClient.writeContract({
            address: BILLBUDDY_PAY_CONTRACT,
            abi: BillBuddyPayABI,
            functionName: "payExpense",
            account: address,
            args: [expenseId],
        });

        let receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        return receipt;
    };

    const getUserPayments = async (userAddress: string): Promise<Payment[]> => {
        const billBuddyContract = getContract({
            address: BILLBUDDY_PAY_CONTRACT,
            abi: BillBuddyPayABI,
            publicClient,
        });

        const paymentIds = await billBuddyContract.read.getUserPayments([userAddress]) as bigint[];
        
        const payments = await Promise.all(paymentIds.map(async (id: bigint) => {
            const payment = await billBuddyContract.read.payments([id]) as ContractPayment;
            return {
                id: Number(id),
                name: payment.name,
                description: payment.description,
                amount: formatUnits(payment.totalReceived, 6),
                isSettled: payment.isSettled,
                type: 'payment' as const,
            };
        }));

        return payments;
    };

    const getUserExpenses = async (userAddress: string): Promise<Expense[]> => {
        const billBuddyContract = getContract({
            address: BILLBUDDY_PAY_CONTRACT,
            abi: BillBuddyPayABI,
            publicClient,
        });

        const expenseIds = await billBuddyContract.read.getUserExpenses([userAddress]) as bigint[];
        
        const expenses = await Promise.all(expenseIds.map(async (id: bigint) => {
            const expense = await billBuddyContract.read.expenses([id]) as ContractExpense;
            return {
                id: Number(id),
                name: expense.name,
                description: expense.description,
                amount: formatUnits(expense.totalAmount, 6),
                isPaid: expense.isPaid,
                type: 'expense' as const,
            };
        }));

        return expenses;
    };

    return {
        address,
        getUserAddress,
        createPayment,
        receivePayment,
        createExpense,
        payExpense,
        getUserPayments,
        getUserExpenses,
    };
};
