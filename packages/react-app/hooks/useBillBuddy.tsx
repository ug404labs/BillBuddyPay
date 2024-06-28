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

const BILLBUDDY_PAY_CONTRACT = process.env.REACT_APP_BILLBUDDY_PAY_CONTRACT ?? "0x304A0B32d25bc993d9a3196BC92BE3FFa4d8cb76";
const cUSDTokenAddress = process.env.REACT_APP_CUSD_TOKEN_ADDRESS ?? "0x874069fa1eb16d44d622f2e0ca25eea172369bc1"; // Testnet
console.log("Contract  bill Address", BILLBUDDY_PAY_CONTRACT);
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
    
        let paymentIds: bigint[];
        try {
            paymentIds = await billBuddyContract.read.getUserPayments([userAddress]) as bigint[];
        } catch (error) {
            console.error("Error fetching user payments:", error);
            return [];
        }
    
        const payments = await Promise.all(paymentIds.map(async (id: bigint) => {
            try {
                const payment = await billBuddyContract.read.payments([id]) as ContractPayment;
    
                if (!payment) {
                    throw new Error(`Payment with id ${id} is undefined`);
                }
    
                // Ensure totalReceived is a valid number, defaulting to 0 if undefined
                const totalReceived = payment.totalReceived ? payment.totalReceived : BigInt(0);
    
                return {
                    id: Number(id),
                    name: payment.name,
                    description: payment.description,
                    amount: formatUnits(totalReceived, 6),
                    isSettled: payment.isSettled,
                    type: 'payment' as const,
                };
            } catch (error) {
                console.error(`Error fetching payment with id ${id}:`, error);
                return null;
            }
        }));
    
        return payments.filter(payment => payment !== null) as Payment[];
    };
    
    const getUserExpenses = async (userAddress: string): Promise<Expense[]> => {
        const billBuddyContract = getContract({
            address: BILLBUDDY_PAY_CONTRACT,
            abi: BillBuddyPayABI,
            publicClient,
        });
    
        let expenseIds: bigint[];
        try {
            expenseIds = await billBuddyContract.read.getUserExpenses([userAddress]) as bigint[];
        } catch (error) {
            console.error("Error fetching user expenses:", error);
            return [];
        }
    
        const expenses = await Promise.all(expenseIds.map(async (id: bigint) => {
            try {
                const expense = await billBuddyContract.read.expenses([id]) as ContractExpense;
    
                if (!expense) {
                    throw new Error(`Expense with id ${id} is undefined`);
                }
    
                // Ensure totalAmount is a valid number, defaulting to 0 if undefined
                const totalAmount = expense.totalAmount ? expense.totalAmount : BigInt(0);
    
                return {
                    id: Number(id),
                    name: expense.name,
                    description: expense.description,
                    amount: formatUnits(totalAmount, 6),
                    isPaid: expense.isPaid,
                    type: 'expense' as const,
                };
            } catch (error) {
                console.error(`Error fetching expense with id ${id}:`, error);
                return null;
            }
        }));
    
        return expenses.filter(expense => expense !== null) as Expense[];
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
