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
    const [generalBalance, setGeneralBalance] = useState<string>("0");
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
            })();
        }
    }, [address]);

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
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}
