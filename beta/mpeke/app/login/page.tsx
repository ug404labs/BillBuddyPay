"use client";
import React from "react";
import { ConnectButton, ThirdwebProvider } from "thirdweb/react";
import { client } from "../../lib/client";
import { LoginButton } from "./components/login-button";
import { ArrowRight, Wallet, Users, FileText, PiggyBank } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Column - App Details */}
      <div className="hidden lg:flex w-1/2 bg-green-600 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-extrabold mb-4">Block Paddy</h1>
          <p className="text-xl mb-8">
            Your Financial Ecosystem on the Blockchain
          </p>
          <div className="space-y-6">
            <FeatureItem icon={Wallet} text="Joint Payments" />
            <FeatureItem icon={FileText} text="Group Invoicing" />
            <FeatureItem icon={Users} text="SACCOs Management" />
            <FeatureItem icon={PiggyBank} text="Joint Investments" />
          </div>
        </div>
        <div className="mt-auto">
          <p className="text-sm opacity-75">
            © 2024 Block Paddy. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column - Authentication */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Connect your wallet to access your Block Paddy dashboard
            </p>
          </div>
          <div className="mt-8 bg-white shadow-md rounded-lg p-6">
            <div className="space-y-6">
              <ConnectButton client={client} />
              <div></div>
              <p className="text-xs text-center text-gray-500">
                By connecting, you agree to our Terms of Service and Privacy
                Policy
              </p>
              <LoginButton />
            </div>
          </div>

          <div className="text-sm text-center">
            <a
              href="#"
              className="font-medium text-green-600 hover:text-green-500 flex items-center justify-center"
            >
              Learn more about blockchain wallets
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// @ts-ignore
const FeatureItem = ({ icon: Icon, text }) => (
  <div className="flex items-center space-x-3">
    <Icon className="h-6 w-6" />
    <span>{text}</span>
  </div>
);

export default LoginPage;
