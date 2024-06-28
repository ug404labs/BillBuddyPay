import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { createWalletClient, custom, getContract, http, parseUnits, formatUnits, createPublicClient } from "viem";
import { celoAlfajores } from "viem/chains";
import SaccoABI from "../abis/Sacco.abi.json"; // You'll need to create this ABI file

const SACCO_CONTRACT = process.env.REACT_APP_SACCO_CONTRACT ?? "0x896657d5BC3A5B84197E91B5a4B797aeE9987710";
const USDC_TOKEN_ADDRESS = process.env.REACT_APP_USDC_TOKEN_ADDRESS ?? "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

export interface SaccoGroup {
    id: number;
    name: string;
    saccoType: "ROTATING" | "FIXED_TERM";
    period: "WEEKLY" | "MONTHLY" | "FORTNIGHTLY" | "YEARLY";
    contributionAmount: string;
    totalContributed: string;
    startDate: Date;
    endDate: Date;
    memberCount: number;
    currentRound: number;
}

interface UseSaccoHook {
    address: string | null;
    getUserAddress: () => Promise<void>;
    createSaccoGroup: (name: string, type: "ROTATING" | "FIXED_TERM", period: "WEEKLY" | "MONTHLY" | "FORTNIGHTLY" | "YEARLY", contributionAmount: string, durationInPeriods: number, members: string[]) => Promise<any>;
    contribute: (groupId: number) => Promise<any>;
    withdrawFixedTerm: (groupId: number) => Promise<any>;
    getSaccoGroups: () => Promise<SaccoGroup[]>;
    isMember: (groupId: number, address: string) => Promise<boolean>;
}

export const useSacco = (): UseSaccoHook => {
    const [address, setAddress] = useState<string | null>(null);
    const { address: accountAddress } = useAccount();

    useEffect(() => {
        if (accountAddress) {
            setAddress(accountAddress);
        }
    }, [accountAddress]);

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

    const createSaccoGroup = async (name: string, type: "ROTATING" | "FIXED_TERM", period: "WEEKLY" | "MONTHLY" | "FORTNIGHTLY" | "YEARLY", contributionAmount: string, durationInPeriods: number, members: string[]) => {
        try {
            let walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celoAlfajores,
            });

            let [address] = await walletClient.getAddresses();
            const contributionAmountInSmallestUnit = parseUnits(contributionAmount, 6); // Assuming USDC has 6 decimal places

            const tx = await walletClient.writeContract({
                address: SACCO_CONTRACT,
                abi: SaccoABI,
                functionName: "createSaccoGroup",
                account: address,
                args: [name, type === "ROTATING" ? 0 : 1, ["WEEKLY", "MONTHLY", "FORTNIGHTLY", "YEARLY"].indexOf(period), contributionAmountInSmallestUnit, durationInPeriods, members],
                value: saccoCreationFee, // Ensure the fee is provided
            });

            return tx;
        } catch (error) {
            console.error("Error creating Sacco group:", error);
        }
    };

    const contribute = async (groupId: number) => {
        try {
            let walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celoAlfajores,
            });

            let [address] = await walletClient.getAddresses();

            const tx = await walletClient.writeContract({
                address: SACCO_CONTRACT,
                abi: SaccoABI,
                functionName: "contribute",
                account: address,
                args: [groupId],
            });

            return tx;
        } catch (error) {
            console.error("Error contributing to Sacco:", error);
        }
    };

    const withdrawFixedTerm = async (groupId: number) => {
        try {
            let walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celoAlfajores,
            });

            let [address] = await walletClient.getAddresses();

            const tx = await walletClient.writeContract({
                address: SACCO_CONTRACT,
                abi: SaccoABI,
                functionName: "withdrawFixedTerm",
                account: address,
                args: [groupId],
            });

            return tx;
        } catch (error) {
            console.error("Error withdrawing from fixed-term Sacco:", error);
        }
    };

    const getSaccoGroups = async (): Promise<SaccoGroup[]> => {
        const publicClient = createPublicClient({
            chain: celoAlfajores,
            transport: http(),
        });

        const saccoContract = getContract({
            address: SACCO_CONTRACT,
            abi: SaccoABI,
            publicClient,
        });

        const groupCount = await saccoContract.read.groupCounter();
        const groups: SaccoGroup[] = [];

        for (let i = 0; i < groupCount; i++) {
            const groupInfo = await saccoContract.read.getSaccoGroupInfo([i]);
            groups.push({
                id: i,
                name: groupInfo[0],
                saccoType: groupInfo[1] === 0 ? "ROTATING" : "FIXED_TERM",
                period: ["WEEKLY", "MONTHLY", "FORTNIGHTLY", "YEARLY"][groupInfo[2]],
                contributionAmount: formatUnits(groupInfo[3], 6),
                totalContributed: formatUnits(groupInfo[4], 6),
                startDate: new Date(Number(groupInfo[5]) * 1000),
                endDate: new Date(Number(groupInfo[6]) * 1000),
                memberCount: Number(groupInfo[7]),
                currentRound: Number(groupInfo[8]),
            });
        }

        return groups;
    };

    const isMember = async (groupId: number, address: string): Promise<boolean> => {
        const publicClient = createPublicClient({
            chain: celoAlfajores,
            transport: http(),
        });

        const saccoContract = getContract({
            address: SACCO_CONTRACT,
            abi: SaccoABI,
            publicClient,
        });

        return saccoContract.read.isMember([groupId, address]);
    };

    return {
        address,
        getUserAddress,
        createSaccoGroup,
        contribute,
        withdrawFixedTerm,
        getSaccoGroups,
        isMember,
    };
};
