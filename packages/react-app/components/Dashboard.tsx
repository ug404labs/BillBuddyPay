import { useState } from "react";
import MyModal from "@/components/Modal";
import { PlusIcon, CreditCardIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/solid';

interface Action {
    name: string;
    description: string;
    icon: JSX.Element;
    action: string | (() => void);
}

const actions: Action[] = [
    {
        name: 'Create Expense',
        description: 'Add a new expense',
        icon: <PlusIcon className="h-6 w-6 text-white" />,
        action: 'createExpense'
    },
    // Other actions...
];

export default function Dashboard() {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (actionName: string | (() => void)) => {
        if (typeof actionName === 'string' && actionName === 'createExpense') {
            setIsOpen(true); // Open the expense modal
        } else if (typeof actionName === 'function') {
            actionName(); // Call the action function if provided
        }
        // Add handling for other actions as needed
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {actions.map((action, index) => (
                    <div key={index} className="bg-prosperity border border-black p-4 rounded-lg shadow-lg">
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
