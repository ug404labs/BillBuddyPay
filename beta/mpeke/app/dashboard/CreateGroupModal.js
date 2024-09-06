import React, { useState } from 'react';
import { parseUnits } from 'viem';

const CreateGroupModal = ({ isOpen, onClose, onSubmit }) => {
    const [groupForm, setGroupForm] = useState({
        name: '',
        savingType: '0',
        members: '',
        totalAmount: '',
        contributionAmount: '',
        rounds: '',
        roundDuration: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGroupForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, savingType, members, totalAmount, contributionAmount, rounds, roundDuration } = groupForm;
        onSubmit(
            name,
            parseInt(savingType),
            members.split(','),
            parseUnits(totalAmount, 6),
            parseUnits(contributionAmount, 6),
            parseInt(rounds),
            parseInt(roundDuration)
        );
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Create Saving Group</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                    >
                        ✕
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="name"
                        placeholder="Group Name"
                        value={groupForm.name}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <select
                        name="savingType"
                        value={groupForm.savingType}
                        onChange={handleChange}
                        className="w-full p-2 border rounded bg-white"
                    >
                        <option value="0">Fixed</option>
                        <option value="1">Circular</option>
                    </select>
                    <input
                        name="members"
                        placeholder="Members (comma-separated addresses)"
                        value={groupForm.members}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <input
                        name="totalAmount"
                        type="number"
                        step="0.000001"
                        placeholder="Total Amount (USDC)"
                        value={groupForm.totalAmount}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <input
                        name="contributionAmount"
                        type="number"
                        step="0.000001"
                        placeholder="Contribution Amount (USDC)"
                        value={groupForm.contributionAmount}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <input
                        name="rounds"
                        type="number"
                        placeholder="Total Rounds"
                        value={groupForm.rounds}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <input
                        name="roundDuration"
                        type="number"
                        placeholder="Round Duration (seconds)"
                        value={groupForm.roundDuration}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
                    >
                        Create Group
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
