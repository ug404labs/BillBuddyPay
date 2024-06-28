import { useState } from "react";
import {
    createPublicClient,
    createWalletClient,
    custom,
    formatEther,
    getContract,
    http,
    parseEther,
    stringToHex,
} from "viem";
import { celoAlfajores } from "viem/chains";

import BILLYABI from "../../../hardhat/contracts/abi/billbuddy.abi.json"

const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
});

const cUSDTokenAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Testnet
const MINIPAY_NFT_CONTRACT = "0xE8F4699baba6C86DA9729b1B0a1DA1Bd4136eFeF"; // Testnet

let BILLBUDDY = "0x87C032C16D0E7d293CDbdEB7fd89d33D60fdD8E7" as const;
let STABLE_TOKEN_ADDRESS = "0x874069fa1eb16d44d622f2e0ca25eea172369bc1";



export const useWeb3 = () => {
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);


    const addExpense = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            let walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celoAlfajores,
            });
            let [address] = await walletClient.getAddresses();

            const expResults = await walletClient.writeContract({
                address: BILLBUDDY,
                abi: BILLYABI,
                functionName: "createExpense",
                account: address,
                args: ["test", 10, [], [], []],

            })

            let receipt = await publicClient.waitForTransactionReceipt({
                hash: expResults,
            });

            console.log("receipt from add expense :", receipt)

            return receipt;
        }
    }
    return {
        address,
        balance,
        addExpense
    };
};

export default useWeb3