import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { ethers } from "ethers";
import BillBuddyPayABI from "../abis/BillBuddyPay.abi.json";
import EffectiveBalance from "@/components/EffectiveBalance";
import Expenses from "@/components/Expenses";
import Settlements from "@/components/Settlements";
import Dashboard from "@/components/Dashboard";
import CustomTab from "@/components/CustomTab";
import MyModal from "@/components/Modal";
import { Tab } from "@headlessui/react";

export const REACT_APP_BILLBUDDY_ADDRESS = process.env.REACT_APP_BILLBUDDY_ADDRESS as string;

export type UserStats = {
    effectiveBalance: bigint;
    settlements: any[];
    expenses: any[];
};

export type Expense = {
    id: bigint;
    amount: bigint;
    settlements: number[];
    receiver: string;
    isSettled: boolean;
    title: string;
};

export type Settlement = {
    id: bigint;
    amount: bigint;
    expenseId: bigint;
    expense?: Expense;
    isSettled: boolean;
    settler: string;
};

export default function Home() {
    const [generalBalance, setGeneralBalance] = useState<null | string>("0");
    const [expenses, setExpenses] = useState<null | Expense[]>(null);
    const [settlements, setSettlements] = useState<null | Settlement[]>(null);
    const publicClient = usePublicClient();
    const { address, isConnected } = useAccount();
    const [isOpen, setIsOpen] = useState(false);
    
    useEffect(() => {
        if (address) {
            (async () => {
                console.log("Fetching general balance for address:", address);

                let provider = new ethers.providers.Web3Provider(window.ethereum);
                let balance = await provider.getBalance(address);
                console.log("General Balance:", ethers.utils.formatEther(balance));
                setGeneralBalance(ethers.utils.formatEther(balance));

                let splitPayContract = new ethers.Contract(
                    REACT_APP_BILLBUDDY_ADDRESS,
                    BillBuddyPayABI,
                    provider
                );

                let { expenses, settlements } = await splitPayContract.getUserStats(address);
                
                console.log("Expenses:", expenses);
                console.log("Settlements:", settlements);

                let _expenses = [];

                for (let i = 0; i < expenses.length; i++) {
                    let _expense = (await getExpenseFromExpenseId(expenses[i])) as Expense;

                    _expense.id = expenses[i];
                    console.log("Fetched Expense:", _expense);

                    _expenses.push(_expense);
                }

                setExpenses(_expenses);

                let _settlements = [];

                for (let i = 0; i < settlements.length; i++) {
                    let _settlement = (await getSettlementFromSettlementId(settlements[i])) as Settlement;

                    let _expense = (await getExpenseFromExpenseId(Number(_settlement.expenseId))) as Expense;

                    _settlement.id = settlements[i];

                    _settlement.expense = _expense;
                    console.log("Fetched Settlement:", _settlement);

                    _settlements.push(_settlement);
                }

                setSettlements(_settlements);
            })();
        }

        return () => {
            console.log("Cleaning up...");
            setExpenses(null);
            setSettlements(null);
            setGeneralBalance("0");
        };
    }, [address]);

    async function getExpenseFromExpenseId(expenseId: number) {
        console.log("Fetching Expense with ID:", expenseId);
        const expense = await publicClient.readContract({
            abi: BillBuddyPayABI,
            address: REACT_APP_BILLBUDDY_ADDRESS,
            functionName: "getExpense",
            args: [expenseId],
        });
        console.log("Fetched Expense:", expense);
        return expense;
    }

    async function getSettlementFromSettlementId(settlementId: number) {
        console.log("Fetching Settlement with ID:", settlementId);
        const settlement = await publicClient.readContract({
            abi: BillBuddyPayABI,
            address: REACT_APP_BILLBUDDY_ADDRESS,
            functionName: "getSettlement",
            args: [settlementId],
        });
        console.log("Fetched Settlement:", settlement);
        return settlement;
    }

    return (
        <div className="flex flex-col justify-center items-center">
            {generalBalance !== null && (
                <EffectiveBalance balance={generalBalance} />
            )}
            <Dashboard />
            <Tab.Group defaultIndex={0}>
                <Tab.List className="mt-10 border border-green-700 w-screen grid grid-cols-2 max-w-[500px] bg-transparent">
                    <CustomTab>Expenses</CustomTab>
                    <CustomTab>Square it Up</CustomTab>
                </Tab.List>
                <Tab.Panels className="w-full h-full">
                    <Tab.Panel className="w-full pt-2 flex flex-col items-center h-full">
                        <p>Address: {address}</p>
                        <button
                            onClick={() => setIsOpen(true)}
                            className="border bg-green-500 border-green-700 px-2 py-2 text-white"
                        >
                            Add Expense
                        </button>
    
                        <MyModal isOpen={isOpen} setIsOpen={setIsOpen} />
                        <div className="mt-2 w-full">
                            {expenses && <Expenses expenses={expenses} />}
                        </div>
                    </Tab.Panel>
                    <Tab.Panel>
                        <Settlements settlements={settlements} />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}
