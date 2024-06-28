import { useState } from "react";
import MyModal from "@/components/Modal";
import { PlusIcon, CreditCardIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/solid';

interface Action {
    name: string;
    description: string;
    icon: JSX.Element;
    action: string | (() => void);
}

interface DashboardProps {
    toggleUserProfile: () => void; // Function to toggle to user profile
}

const actions: Action[] = [
    {
        name: 'Create Shared Expense',
        description: 'Add a new shared expense',
        icon: <PlusIcon className="h-6 w-6 text-white" />,
        action: 'createExpense'
    },
    {
        name: 'Create Shared Payment',
        description: 'Generate a payment link',
        icon: <PlusIcon className="h-6 w-6 text-white" />,
        action: 'createPayment'
    },
    {
        name: 'Sacco',
        description: 'Manage Sacco Data',
        icon: <CurrencyDollarIcon className="h-6 w-6 text-white" />,
        action: () => {}
    },
    {
        name: 'My Transactions',
        description: 'Report and More',
        icon: <CurrencyDollarIcon className="h-6 w-6 text-white" />,
        action: 'profile'
    },
];

const Dashboard: React.FC<DashboardProps> = ({ toggleUserProfile }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (actionName: string | (() => void)) => {
        if (typeof actionName === 'string' && actionName === 'createExpense') {
            setIsOpen(true); // Open the expense modal
        } else if (typeof actionName === 'function') {
            actionName(); // Call the action function if provided
        } else if (actionName === 'profile') {
            toggleUserProfile(); // Toggle to user profile
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

export default Dashboard;
