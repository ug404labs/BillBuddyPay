"use client";

import React, { useState, useEffect } from "react";
import {getAuth , signOut} from 'firebase/auth'
import {app}  from "../config"
import { useRouter } from "next/navigation";
import { socialConnect } from "../utils/socialconnect";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState("Celo");
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await socialConnect(firebaseUser.phoneNumber);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Handle error (e.g., show error message to user)
        }
      } else {
        router.push("/signin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChainToggle = () => {
    setSelectedChain(selectedChain === "Celo" ? "Arbitrum" : "Celo");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <div>No user data available.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <p>Phone Number: {user.phoneNumber}</p>
                <p>Wallet Address: {user.address}</p>
                <div className="flex items-center justify-between">
                  <span>Selected Chain: {selectedChain}</span>
                  <button
                    onClick={handleChainToggle}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    Toggle Chain
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
