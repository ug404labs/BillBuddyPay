// test adress 0xE864620B2D3A8DadeC5BF9C4b30DDf182df37E69
"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createPublicClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";
import Header from "../../header";
import QRCode from "react-qr-code";

const saccoAbi = parseAbi([
  "function getSaccoGroupInfo() external view returns (string, uint8, uint8, uint256, uint256, uint256, uint256, uint256, uint256)",
  "function isMember(address) public view returns (bool)",
  "function contribute() external payable",
  "function withdrawFixedTerm() external"
]);

const SaccoViewPage = () => {
  const searchParams = useSearchParams();
  const saccoAddress = searchParams.get("address");
  const [saccoInfo, setSaccoInfo] = useState(null);
  const [isMemberStatus, setIsMemberStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const saccoTypes = ["ROTATING", "FIXED_TERM"];
  const periodTypes = ["WEEKLY", "MONTHLY", "FORTNIGHTLY", "YEARLY"];

  useEffect(() => {
    const fetchSaccoDetails = async () => {
      if (!saccoAddress) {
        setError("No Sacco address provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching Sacco details...");
        const client = createPublicClient({
          chain: baseSepolia,
          transport: http(),
        });

        const saccoInfoData = await client.readContract({
          address: saccoAddress,
          abi: saccoAbi,
          functionName: "getSaccoGroupInfo",
        });

        setSaccoInfo({
          name: saccoInfoData[0],
          saccoType: saccoTypes[saccoInfoData[1]],
          period: periodTypes[saccoInfoData[2]],
          contributionAmount: saccoInfoData[3],
          totalContributed: saccoInfoData[4],
          startDate: new Date(Number(saccoInfoData[5]) * 1000).toLocaleDateString(),
          endDate: new Date(Number(saccoInfoData[6]) * 1000).toLocaleDateString(),
          memberCount: saccoInfoData[7],
          currentRound: saccoInfoData[8],
        });

        // Check if the current user is a member
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const currentAccount = accounts[0];
        const memberStatus = await client.readContract({
          address: saccoAddress,
          abi: saccoAbi,
          functionName: "isMember",
          args: [currentAccount],
        });
        setIsMemberStatus(memberStatus);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching Sacco details:", err);
        setError("Failed to fetch Sacco details");
        setLoading(false);
      }
    };

    fetchSaccoDetails();
  }, [saccoAddress]);

  const handleContribute = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to contribute!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentAccount = accounts[0];

      const transaction = {
        from: currentAccount,
        to: saccoAddress,
        value: saccoInfo.contributionAmount.toString(16), // Convert to hex
        data: saccoAbi.encodeFunctionData("contribute"),
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      });

      console.log("Contribution transaction sent:", txHash);
      alert("Contribution successful! Transaction hash: " + txHash);
    } catch (error) {
      console.error("Error contributing:", error);
      alert("Failed to contribute. Please try again.");
    }
  };

  const handleWithdraw = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to withdraw!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentAccount = accounts[0];

      const transaction = {
        from: currentAccount,
        to: saccoAddress,
        data: saccoAbi.encodeFunctionData("withdrawFixedTerm"),
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      });

      console.log("Withdrawal transaction sent:", txHash);
      alert("Withdrawal successful! Transaction hash: " + txHash);
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Failed to withdraw. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Header />
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold mb-2">Loading Sacco details...</p>
            <div className="relative flex items-center justify-center">
              <div className="absolute animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
              <div className="absolute animate-pulse rounded-full h-24 w-24 bg-blue-100"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Header />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Header />
      <div className="relative mb-4">
        <QRCode value={saccoAddress || ""} size={128} className="absolute top-4 right-4" />
      </div>
      <h1 className="text-2xl font-bold mb-5">Sacco Group Details</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <p className="text-gray-700 text-sm font-bold mb-2">Sacco Address:</p>
          <p className="text-gray-700">{saccoAddress}</p>
        </div>
        {saccoInfo && (
          <>
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold mb-2">Name:</p>
              <p className="text-gray-700">{saccoInfo.name}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold mb-2">Type:</p>
              <p className="text-gray-700">{saccoInfo.saccoType}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold mb-2">Period:</p>
              <p className="text-gray-700">{saccoInfo.period}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold mb-2">Contribution Amount:</p>
              <p className="text-gray-700">{saccoInfo.contributionAmount.toString()} wei</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold mb-2">Total Contributed:</p>
              <p className="text-gray-700">{saccoInfo.totalContributed.toString()} wei</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold mb-2">Start Date:</p>
              <p className="text-gray-700">{saccoInfo.startDate}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold mb-2">End Date:</p>
              <p className="text-gray-700">{saccoInfo.endDate}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold mb-2">Member Count:</p>
              <p className="text-gray-700">{saccoInfo.memberCount.toString()}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm font-bold mb-2">Current Round:</p>
              <p className="text-gray-700">{saccoInfo.currentRound.toString()}</p>
            </div>
          </>
        )}
        <div className="mb-4">
          <p className="text-gray-700 text-sm font-bold mb-2">Member Status:</p>
          <p className="text-gray-700">{isMemberStatus ? "You are a member" : "You are not a member"}</p>
        </div>
        {isMemberStatus && (
          <div className="flex justify-between mt-6">
            <button
              onClick={handleContribute}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Contribute
            </button>
            {saccoInfo && saccoInfo.saccoType === "FIXED_TERM" && (
              <button
                onClick={handleWithdraw}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Withdraw
              </button>
            )}
          </div>
        )}
      </div>
      <footer className="bg-gray-800 text-white py-4 mt-10">
        <div className="container mx-auto text-center">
          <p className="text-sm">© {new Date().getFullYear()} Block Buddy Pay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SaccoViewPage;