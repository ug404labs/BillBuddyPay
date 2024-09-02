import { SPLITPAY_CONTRACT_ADDRESS } from "@/pages";
import {
    useAccount,
    useNetwork,
    usePublicClient,
    useWalletClient,
} from "wagmi";
import SplitPayAbi from "../abis/SplitPay";
import StableToken from "@celo/abis/StableToken.json";
import { formatEther } from "viem";
import toast from "react-hot-toast";
import { STABLE_TOKEN_ADDRESS } from "@/SocialConnect/utils";

type SettleProps = {
    className?: string;
    paid?: boolean;
    title: string;
    amount: bigint;
    settlementId: number;
};

function Settle(props: SettleProps) {
    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const { chain } = useNetwork();

    let { className, title, paid, amount, settlementId } = props;

    async function approveCUSD() {
        if (walletClient) {
            let hash = await walletClient.writeContract({
                abi: StableToken.abi,
                address: STABLE_TOKEN_ADDRESS,
                functionName: "approve",
                chain,
                args: [SPLITPAY_CONTRACT_ADDRESS, amount],
            });

            await publicClient.waitForTransactionReceipt({ hash });
        }
    }

    async function callSettle() {
        if (walletClient) {
            let hash = await walletClient.writeContract({
                address: SPLITPAY_CONTRACT_ADDRESS,
                abi: SplitPayAbi,
                chain,
                functionName: "settle",
                args: [settlementId],
            });
            await publicClient.waitForTransactionReceipt({ hash });
        }
    }

    async function checkIfApprovalNeeded() {
        let allowance = (await publicClient.readContract({
            abi: StableToken.abi,
            address: STABLE_TOKEN_ADDRESS,
            functionName: "allowance",
            args: [address, SPLITPAY_CONTRACT_ADDRESS],
        })) as bigint;

        if (allowance >= amount) {
            return false;
        }

        return true;
    }

    async function settle() {
        if (walletClient) {
            let settleToast = toast.loading("Checking if approval needed", {
                position: "top-center",
                duration: 10000,
            });

            try {
                let isApprovalNeeded = await checkIfApprovalNeeded();
                if (isApprovalNeeded) {
                    toast.loading("Approving cUSD", { id: settleToast });
                    await approveCUSD();
                }
                toast.loading("Paying up", { id: settleToast });
                await callSettle();
            } catch (error) {
                toast.error("Something went wrong", { id: settleToast });
            }
        }
    }

    return (
        <div
            className={`w-full px-4 py-4 border-b border-black items-center flex justify-between ${className}`}
        >
            <div>
                <h3>{title}</h3>
                <div className="flex items-center gap-x-2">
                    {paid ? (
                        <span className="text-green-600">Squared</span>
                    ) : (
                        <span className="text-red-600">Pending</span>
                    )}
                </div>
            </div>
            <div className="flex space-x-2 items-center">
                {!paid && (
                    <button
                        onClick={settle}
                        className="border bg-prosperity border-black px-4 py-2"
                    >
                        Pay up
                    </button>
                )}
                <h3>{formatEther(amount)} cUSD</h3>
            </div>
        </div>
    );
}

export default Settle;
