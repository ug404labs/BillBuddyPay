import React, { useState } from 'react';
import { ethers } from 'ethers';

const ContributeModal = ({ isOpen, onClose, onSubmit, groups }) => {
    const [contributionForm, setContributionForm] = useState({
        groupId: '',
        amount: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContributionForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { groupId, amount } = contributionForm;
        onSubmit(groupId, ethers.utils.parseUnits(amount, 6));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Contribute to Group</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select
                        name="groupId"
                        value={contributionForm.groupId}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded bg-white"
                    >
                        <option value="">Select a group</option>
                        {groups.map(group => (
                            <option key={group.id.toString()} value={group.id.toString()}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                    <input
                        name="amount"
                        type="number"
                        step="0.000001"
                        placeholder="Contribution Amount (USDC)"
                        value={contributionForm.amount}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
                    >
                        Contribute
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContributeModal;