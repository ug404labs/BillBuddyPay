import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useSacco, SaccoGroup } from '../hooks/useSacco'; // Adjust path as per your project structure

const SACCO_CREATION_FEE = BigInt(1e18); // 1 USDC (assuming 18 decimal places)

// In your handleCreateGroup function:

const SaccoPage: React.FC = () => {
    const { address, createSaccoGroup, contribute, withdrawFixedTerm, getSaccoGroups, isMember } = useSacco();
    const [isOpen, setIsOpen] = useState(false);
    const [saccoGroups, setSaccoGroups] = useState<SaccoGroup[]>([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupType, setNewGroupType] = useState<'ROTATING' | 'FIXED_TERM'>('ROTATING');
    const [newGroupPeriod, setNewGroupPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'FORTNIGHTLY' | 'YEARLY'>('MONTHLY');
    const [newGroupContribution, setNewGroupContribution] = useState('');
    const [newGroupDuration, setNewGroupDuration] = useState('');
    const [newGroupMembers, setNewGroupMembers] = useState('')

    useEffect(() => {
        fetchSaccoGroups();
    }, []);

    const fetchSaccoGroups = async () => {
        const groups = await getSaccoGroups();
        setSaccoGroups(groups);
    };

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) return;

        try {
            await createSaccoGroup(
                newGroupName,
                newGroupType,
                newGroupPeriod,
                newGroupContribution,
                parseInt(newGroupDuration),
                newGroupMembers.split(',').map(m => m.trim()),
                SACCO_CREATION_FEE // Pass the creation fee
            );
            fetchSaccoGroups();
            // Reset form fields
            setNewGroupName('');
            setNewGroupType('ROTATING');
            setNewGroupPeriod('MONTHLY');
            setNewGroupContribution('');
            setNewGroupDuration('');
            setNewGroupMembers('');
            closeModal();
        } catch (error) {
            console.error("Error creating Sacco group:", error);
            // Here you might want to show an error message to the user
        }
    };
    const handleContribute = async (groupId: number) => {
        if (!address) return;
        await contribute(groupId);
        fetchSaccoGroups();
    };

    const handleWithdraw = async (groupId: number) => {
        if (!address) return;
        await withdrawFixedTerm(groupId);
        fetchSaccoGroups();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Sacco Management</h1>

            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Create New Sacco Group</h2>
                <button
                    onClick={openModal}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Create Sacco Group
                </button>
            </div>

            {/* Modal for creating new Sacco group */}
            <Transition appear show={isOpen} as={React.Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-50 overflow-y-auto"
                    onClose={closeModal}
                >
                    <div className="min-h-screen px-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
                        </Transition.Child>

                        <span
                            className="inline-block h-screen align-middle"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>

                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    Create New Sacco Group
                                </Dialog.Title>
                                <form onSubmit={handleCreateGroup} className="mt-6 space-y-4">
                                    <div>
                                        <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
                                            Group Name
                                        </label>
                                        <input
                                            id="groupName"
                                            name="groupName"
                                            type="text"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="groupType" className="block text-sm font-medium text-gray-700">
                                            Group Type
                                        </label>
                                        <select
                                            id="groupType"
                                            name="groupType"
                                            value={newGroupType}
                                            onChange={(e) => setNewGroupType(e.target.value as 'ROTATING' | 'FIXED_TERM')}
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                        >
                                            <option value="ROTATING">Rotating Savings</option>
                                            <option value="FIXED_TERM">Fixed-Term Savings</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="groupPeriod" className="block text-sm font-medium text-gray-700">
                                            Contribution Period
                                        </label>
                                        <select
                                            id="groupPeriod"
                                            name="groupPeriod"
                                            value={newGroupPeriod}
                                            onChange={(e) => setNewGroupPeriod(e.target.value as 'WEEKLY' | 'MONTHLY' | 'FORTNIGHTLY' | 'YEARLY')}
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                        >
                                            <option value="WEEKLY">Weekly</option>
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="FORTNIGHTLY">Fortnightly</option>
                                            <option value="YEARLY">Yearly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="groupContribution" className="block text-sm font-medium text-gray-700">
                                            Contribution Amount (USDC)
                                        </label>
                                        <input
                                            id="groupContribution"
                                            name="groupContribution"
                                            type="number"
                                            value={newGroupContribution}
                                            onChange={(e) => setNewGroupContribution(e.target.value)}
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="groupDuration" className="block text-sm font-medium text-gray-700">
                                            Duration (number of periods)
                                        </label>
                                        <input
                                            id="groupDuration"
                                            name="groupDuration"
                                            type="number"
                                            value={newGroupDuration}
                                            onChange={(e) => setNewGroupDuration(e.target.value)}
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="groupMembers" className="block text-sm font-medium text-gray-700">
                                            Members (comma-separated addresses)
                                        </label>
                                        <textarea
                                            id="groupMembers"
                                            name="groupMembers"
                                            value={newGroupMembers}
                                            onChange={(e) => setNewGroupMembers(e.target.value)}
                                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                            <label htmlFor="creationFee" className="block text-sm font-medium text-gray-700">
                                Sacco Creation Fee (USDC)
                            </label>
                            <input
                                id="creationFee"
                                name="creationFee"
                                type="number"
                                value="1 USDC"
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-gray-100"
                                disabled
                            />
                        </div>
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                                            onClick={closeModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Create Sacco Group
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>

            {/* Display existing Sacco groups */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Existing Sacco Groups</h2>
                {saccoGroups.length === 0 ? (
                    <p>No Sacco groups found.</p>
                ) : (
                    <div className="space-y-6">
                        {saccoGroups.map((group) => (
                            <div key={group.id} className="border p-4 rounded">
                                <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                                <p>Type: {group.saccoType}</p>
                                <p>Period: {group.period}</p>
                                <p>Contribution Amount: {group.contributionAmount} USDC</p>
                                <p>Total Contributed: {group.totalContributed} USDC</p>
                                <p>Start Date: {group.startDate.toLocaleDateString()}</p>
                                <p>End Date: {group.endDate.toLocaleDateString()}</p>
                                <p>Members: {group.memberCount}</p>
                                {group.saccoType === 'ROTATING' && (
                                    <p>Current Round: {group.currentRound}</p>
                                )}
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleContribute(group.id)}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
                                    >
                                        Contribute
                                    </button>
                                    {group.saccoType === 'FIXED_TERM' && (
                                        <button
                                            onClick={() => handleWithdraw(group.id)}
                                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                        >
                                            Withdraw
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SaccoPage;