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
import { parseUnits } from "viem";
import toast from "react-hot-toast";
import { LookupResponse } from "@/pages/api/socialconnect/lookup";

type ModalProps = {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function MyModal({ isOpen, setIsOpen }: ModalProps) {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { address } = useAccount();
    const { chain } = useNetwork();

    const [expenseTitle, setExpenseTitle] = useState<string>("");
    const [expenseAmount, setExpenseAmount] = useState<string>("");
    const [settlers, setSettlers] = useState<string[]>([]);
    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    useEffect(() => {
        checkIfFormValid();
    }, [expenseAmount, expenseTitle, settlers]);

    function closeModal() {
        setIsOpen(false);
        setSettlers([]);
        setExpenseTitle("");
        setExpenseAmount("");
    }

    function addSettlerField() {
        setSettlers([...settlers, ""]);
    }

    function addSettler(index: number, value: string) {
        settlers[index] = value;
        setSettlers([...settlers]);
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
                        [address, ...settlers],
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
                handle: settlers[index],
            })}`,
            {
                method: "GET",
            }
        );

        let lookupResponse: LookupResponse = await response.json();
        if (lookupResponse.accounts.length > 0) {
            addSettler(index, lookupResponse.accounts[0]);
            toast.success("Address found!", { id: lookupToast });
        } else {
            addSettler(index, "");
            toast.error("No Address found", { id: lookupToast });
        }
    }

    async function checkIfFormValid() {
        if (
            expenseTitle.length > 0 &&
            expenseAmount.length > 0 &&
            settlers.length > 0 &&
            !settlers.map((element) => element.startsWith("0x")).includes(false)
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
                                        Add a Expense
                                    </Dialog.Title>
                                    <div className="mt-2 flex flex-col gap-y-4">
                                        <div className="flex flex-col gap-y-2">
                                            <label htmlFor="title">Title</label>
                                            <input
                                                name="title"
                                                value={expenseTitle}
                                                onChange={({ target }) =>
                                                    setExpenseTitle(
                                                        target.value
                                                    )
                                                }
                                                className="w-full border border-black bg-gypsum py-2 px-4 outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-y-2">
                                            <label htmlFor="value">
                                                Value (cUSD)
                                            </label>
                                            <input
                                                name="value"
                                                type="number"
                                                onChange={({ target }) =>
                                                    setExpenseAmount(
                                                        target.value
                                                    )
                                                }
                                                className="w-full border border-black bg-gypsum py-2 px-4 outline-none"
                                            />
                                        </div>
                                        {settlers.map((settler, index) => (
                                            <div
                                                key={index}
                                                className="flex space-x-2"
                                            >
                                                <input
                                                    onChange={({ target }) =>
                                                        addSettler(
                                                            index,
                                                            target.value
                                                        )
                                                    }
                                                    value={settlers[index]}
                                                    className="border border-black w-full bg-gypsum px-4 py-2 outline-none"
                                                />
                                                {settlers[index].length > 2 &&
                                                    !settlers[index].startsWith(
                                                        "0x"
                                                    ) && (
                                                        <button
                                                            onClick={() =>
                                                                lookup(index)
                                                            }
                                                            className="border border-black px-2"
                                                        >
                                                            Lookup
                                                        </button>
                                                    )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={addSettlerField}
                                            className="self-start px-2 py-2 bg-prosperity border-black border"
                                        >
                                            + Add Friend
                                        </button>
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
