import { Dialog, Transition } from "@headlessui/react";
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import {
    useAccount,
    useNetwork,
    usePublicClient,
    useWalletClient,
} from "wagmi";
import SplitPayAbi from "../abis/SplitPay";
import { SPLITPAY_CONTRACT_ADDRESS } from "@/pages";
import { parseUnits } from "ethers/lib/utils"; // Correct import assuming ethers library
import toast from "react-hot-toast";
import { LookupResponse } from "@/pages/api/socialconnect/lookup";

type ModalProps = {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
};

type Payer = {
    address: string;
    shares: string;
};

export default function MyModal({ isOpen, setIsOpen }: ModalProps) {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address } = useAccount();
    const { chain } = useNetwork();

    const [expenseTitle, setExpenseTitle] = useState<string>("");
    const [expenseAmount, setExpenseAmount] = useState<string>("");
    const [payers, setPayers] = useState<Payer[]>([{ address: address || "", shares: "1" }]);
    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    useEffect(() => {
        checkIfFormValid();
    }, [expenseAmount, expenseTitle, payers]);

    function closeModal() {
        setIsOpen(false);
        setPayers([{ address: address || "", shares: "1" }]);
        setExpenseTitle("");
        setExpenseAmount("");
    }

    function addPayerField() {
        setPayers([...payers, { address: "", shares: "1" }]);
    }

    function updatePayer(index: number, field: "address" | "shares", value: string) {
        const updatedPayers = [...payers];
        updatedPayers[index][field] = value;
        setPayers(updatedPayers);
    }

    async function createExpense() {
        if (walletClient) {
            let createToast = toast.loading("Creating Expense", {
                duration: 15000,
                position: "top-center",
            });
            try {
                let hash = await walletClient.writeContract({
                    abi: SplitPayAbi,
                    address: SPLITPAY_CONTRACT_ADDRESS,
                    functionName: "createExpense",
                    chain,
                    args: [
                        expenseTitle,
                        parseUnits(expenseAmount as `${number}`, 18),
                        payers.map(p => p.address),
                        payers.map(p => parseInt(p.shares)),
                    ],
                });
                await publicClient.waitForTransactionReceipt({ hash });
                toast.success("Expense Created!", { id: createToast });
            } catch (e) {
                toast.error("Something Went Wrong!", { id: createToast });
            } finally {
                closeModal();
            }
        }
    }

    async function lookup(index: number) {
        let lookupToast = toast.loading("Looking up the address");
        let response: Response = await fetch(
            `/api/socialconnect/lookup?${new URLSearchParams({
                handle: payers[index].address,
            })}`,
            {
                method: "GET",
            }
        );

        let lookupResponse: LookupResponse = await response.json();
        if (lookupResponse.accounts.length > 0) {
            updatePayer(index, "address", lookupResponse.accounts[0]);
            toast.success("Address found!", { id: lookupToast });
        } else {
            updatePayer(index, "address", "");
            toast.error("No Address found", { id: lookupToast });
        }
    }

    async function checkIfFormValid() {
        if (
            expenseTitle.length > 0 &&
            expenseAmount.length > 0 &&
            payers.length > 0 &&
            !payers.some(p => !p.address.startsWith("0x") || parseInt(p.shares) <= 0)
        ) {
            return setIsFormValid(true);
        }

        return setIsFormValid(false);
    }

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-gypsum p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Add an Expense
                                    </Dialog.Title>
                            
                                    
                                    <div className="mt-2 flex flex-col gap-y-4">
                            {/* Title and Amount fields remain the same */}
                            <div className="flex flex-col gap-y-2">
                                <label htmlFor="title">Title</label>
                                <input
                                    name="title"
                                    value={expenseTitle}
                                    onChange={({ target }) => setExpenseTitle(target.value)}
                                    className="w-full border border-black bg-gypsum py-2 px-4 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <label htmlFor="value">Value (cUSD)</label>
                                <input
                                    name="value"
                                    type="number"
                                    value={expenseAmount}
                                    onChange={({ target }) => setExpenseAmount(target.value)}
                                    className="w-full border border-black bg-gypsum py-2 px-4 outline-none"
                                />
                            </div>
                            {/* Payers section */}
                            <div className="flex flex-col gap-y-2">
                                <label>Payers</label>
                                {payers.map((payer, index) => (
                                    <div key={index} className="flex space-x-2">
                                        <input
                                            placeholder="Address"
                                            value={payer.address}
                                            onChange={({ target }) => updatePayer(index, "address", target.value)}
                                            className="border border-black w-2/3 bg-gypsum px-4 py-2 outline-none"
                                        />
                                        <input
                                            placeholder="Shares"
                                            type="number"
                                            value={payer.shares}
                                            onChange={({ target }) => updatePayer(index, "shares", target.value)}
                                            className="border border-black w-1/3 bg-gypsum px-4 py-2 outline-none"
                                        />
                                        {payer.address.length > 2 && !payer.address.startsWith("0x") && (
                                            <button
                                                onClick={() => lookup(index)}
                                                className="border border-black px-2"
                                            >
                                                Lookup
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={addPayerField}
                                    className="self-start px-2 py-2 bg-prosperity border-black border"
                                >
                                    + Add Payer
                                </button>
                            </div>
                        </div>
                                    <div className="mt-4 flex justify-end w-full space-x-2">
                                        <button
                                            type="button"
                                            className="border-black inline-flex justify-center border  bg-prosperity px-4 py-2 text-sm font-medium text-black hover:bg-prosperity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                            onClick={closeModal}
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="button"
                                            className="border-black inline-flex justify-center border  bg-prosperity px-4 py-2 text-sm font-medium text-black hover:bg-prosperity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:bg-gray-200"
                                            onClick={createExpense}
                                            disabled={!isFormValid}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
