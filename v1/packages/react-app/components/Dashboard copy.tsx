import { PlusIcon, CreditCardIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { useState } from "react";
import MyModal from "@/components/Modal";
import Expense from "@/components/Expense";

const actions = [
    {
        name: 'Create Expense',
        description: 'Add a new expense',
        icon: <PlusIcon className="h-6 w-6 text-white" />,
        action: 'createExpense'
    },
    {
        name: 'Payment Link',
        description: 'Generate a payment link',
        icon: <CreditCardIcon className="h-6 w-6 text-white" />,
        action: () => {}
    },
    {
        name: 'Donations',
        description: 'Add a donation',
        icon: <CurrencyDollarIcon className="h-6 w-6 text-white" />,
        action: () => {}
    },
    {
        name: 'Pay Expenses',
        description: 'Settle your expenses',
        icon: <CurrencyDollarIcon className="h-6 w-6 text-white" />,
        action: () => {}
    },
    {
        name: 'Donate',
        description: 'Make a donation',
        icon: <CurrencyDollarIcon className="h-6 w-6 text-white" />,
        action: () => {}
    },
    {
        name: 'Join Groups',
        description: 'Join an existing group',
        icon: <UserGroupIcon className="h-6 w-6 text-white" />,
        action: () => {}
    },
    {
        name: 'Create Group',
        description: 'Create a new group',
        icon: <PlusIcon className="h-6 w-6 text-white" />,
        action: () => {}
    },
];

export default function Dashboard() {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (name) => {
        if (name === 'createExpense') {
            setIsOpen(true);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {actions.map((action) => (
                    <div key={action.name} className="bg-prosperity border border-black p-4 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-black">{action.name}</h3>
                                <p className="mt-1 text-sm text-gray-700">{action.description}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <button
                                    onClick={() => handleAction(action.action)}
                                    className="bg-forest p-2 rounded-full hover:bg-forest-dark"
                                >
                                    {action.icon}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <MyModal isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    );
}
