"use client";
import React from "react";
import { NextPage } from "next";
import { useRouter } from "next/navigation";
import Header from "../header";
import InvoiceManagement from "./components/invoice";

const Dashboard: NextPage = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Your Dashboard
        </h1>
        <p className="text-gray-600">
          This is where you'll see an overview of your Block Buddy Pay
          activities.
        </p>
        <InvoiceManagement />
      </main>
    </div>
  );
};

export default Dashboard;
