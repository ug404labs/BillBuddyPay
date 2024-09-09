
"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { getContract, prepareContractCall, sendAndConfirmTransaction, prepareEvent } from "thirdweb";
import { useActiveAccount, useContractEvents } from "thirdweb/react";
import Header from "../../header";
import saccoFactoryAbi from '../../contracts/sacco/saccoFactory.abi.json';
import saccoAbi from '../../contracts/sacco/sacco.abi.json';
import { client } from "../../../lib/client";
import { baseSepolia } from "thirdweb/chains";

const saccoFactoryAddress = "0x95fF7d01Bb929d5Af4631D75F506ED3f5EAe52d6"; // base address

const CreateSaccoPage = () => {
  const router = useRouter();
  const connectedAccount = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [newSacco, setNewSacco] = useState({
    name: '',
    saccoType: '0', // 0 for ROTATING, 1 for FIXED_TERM
    period: '0', // 0 for WEEKLY, 1 for MONTHLY, 2 for FORTNIGHTLY, 3 for YEARLY
    contributionAmount: '',
    durationInPeriods: '',
    members: [''],
  });

  const contract = getContract({
    client,
    address: saccoFactoryAddress,
    abi: saccoFactoryAbi,
    chain: baseSepolia,
  });

  const saccoGroupCreatedEvent = prepareEvent({
    signature: "event SaccoGroupCreated(uint256 groupId, string name, uint8 saccoType, address saccoAddress)",
  });

  const { data: events } = useContractEvents({
    contract,
    events: [saccoGroupCreatedEvent],
  });

  useEffect(() => {
    if (events && events.length > 0) {
      const lastEvent = events[events.length - 1];
      const saccoAddress = lastEvent.args.saccoAddress;
      console.log("New Sacco address from event:", saccoAddress);
      router.push(`/sacco/view?address=${saccoAddress}`);
    }
  }, [events, router]);

  const handleCreateSacco = async (e) => {
    e.preventDefault();
    console.log("Creating Sacco group...");

    if (!connectedAccount) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Contract instance:", contract);

      // Prepare the parameters for the createSaccoGroup function
      const { name, saccoType, period, contributionAmount, durationInPeriods, members } = newSacco;

      const transaction = await prepareContractCall({
        contract,
        method: "createSaccoGroup",
        params: [name, parseInt(saccoType), parseInt(period), contributionAmount, durationInPeriods, members],
      });

      console.log("Transaction:", transaction);

      const receipt = await sendAndConfirmTransaction({
        transaction,
        account: connectedAccount,
      });

      console.log("Receipt:", receipt);
      
      // The useEffect hook will handle the redirection once the event is detected
    } catch (error) {
      console.error("Error creating Sacco group:", error);
      alert("Error creating Sacco group: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = () => {
    setNewSacco({
      ...newSacco,
      members: [...newSacco.members, ''],
    });
  };

  return (
    <div>
      <Header />
      <h1 className="text-2xl font-bold mb-5">Create New Sacco Group</h1>
      <p className="mb-5">Connected Address: {connectedAccount?.address}</p>

      <div className="mb-5 border border-gray-300 rounded-md p-5">
        <form onSubmit={handleCreateSacco} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block mb-1">Group Name</label>
            <input
              id="name"
              value={newSacco.name}
              onChange={(e) => setNewSacco({ ...newSacco, name: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="saccoType" className="block mb-1">Sacco Type</label>
            <select
              id="saccoType"
              value={newSacco.saccoType}
              onChange={(e) => setNewSacco({ ...newSacco, saccoType: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="0">Rotating</option>
              <option value="1">Fixed Term</option>
            </select>
          </div>
          <div>
            <label htmlFor="period" className="block mb-1">Contribution Period</label>
            <select
              id="period"
              value={newSacco.period}
              onChange={(e) => setNewSacco({ ...newSacco, period: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="0">Weekly</option>
              <option value="1">Monthly</option>
              <option value="2">Fortnightly</option>
              <option value="3">Yearly</option>
            </select>
          </div>
          <div>
            <label htmlFor="contributionAmount" className="block mb-1">Contribution Amount (in Wei)</label>
            <input
              id="contributionAmount"
              type="number"
              value={newSacco.contributionAmount}
              onChange={(e) => setNewSacco({ ...newSacco, contributionAmount: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="durationInPeriods" className="block mb-1">Duration (in periods)</label>
            <input
              id="durationInPeriods"
              type="number"
              value={newSacco.durationInPeriods}
              onChange={(e) => setNewSacco({ ...newSacco, durationInPeriods: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {newSacco.members.map((member, index) => (
            <div key={index}>
              <label htmlFor={`member-${index}`} className="block mb-1">Member {index + 1} Address</label>
              <input
                id={`member-${index}`}
                value={member}
                onChange={(e) => {
                  const newMembers = [...newSacco.members];
                  newMembers[index] = e.target.value;
                  setNewSacco({ ...newSacco, members: newMembers });
                }}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          ))}
          <button type="button" onClick={addMember} className="p-2 bg-gray-200 rounded-md cursor-pointer">
            Add Member
          </button>
          <button 
            type="submit" 
            className="p-2 bg-green-500 text-white rounded-md cursor-pointer disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Sacco Group...
              </span>
            ) : (
              'Create Sacco Group'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSaccoPage;