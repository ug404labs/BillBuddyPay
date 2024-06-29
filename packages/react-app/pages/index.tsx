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
// {*/  /*}
    return (
        <div className="flex flex-col justify-center items-center">
            {generalBalance !== null && (
                <EffectiveBalance balance={generalBalance} />
            )} 
            <Dashboard toggleUserProfile={() => {}} />
          
        </div>
    );
}
