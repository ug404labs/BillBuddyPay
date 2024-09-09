"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import Header from "../../header";
import QRCode from "react-qr-code"; // Using react-qr-code library
import invoiceAbi from "../../contracts/invoice/invoice.abi.json";

const InvoiceTestPage = () => {
  const searchParams = useSearchParams();
  const invoiceAddress = searchParams.get("address");
  const [payees, setPayees] = useState([]);
  const [shares, setShares] = useState({});
  const [released, setReleased] = useState({});
  const [totalShares, setTotalShares] = useState(0);
  const [totalReleased, setTotalReleased] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!invoiceAddress) {
        setError("No invoice address provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching invoice details...");
        const wclient = createPublicClient({
          chain: baseSepolia,
          transport: http(),
        });

        // Fetch total shares and released amounts
        const [totalSharesData, totalReleasedData, payeesData] = await Promise.all([
          wclient.readContract({
            address: invoiceAddress,
            abi: invoiceAbi,
            functionName: "getTotalShares",
          }),
          wclient.readContract({
            address: invoiceAddress,
            abi: invoiceAbi,
            functionName: "getTotalReleased",
          }),
          wclient.readContract({
            address: invoiceAddress,
            abi: invoiceAbi,
            functionName: "getPayees",
          }),
        ]);

        setTotalShares(totalSharesData);
        setTotalReleased(totalReleasedData);
        setPayees(payeesData);

        // Fetch shares and released amounts for each payee
        const shareResults = await Promise.all(
          payeesData.map(async (payee) => {
            const share = await wclient.readContract({
              address: invoiceAddress,
              abi: invoiceAbi,
              functionName: "getShares",
              args: [payee],
            });
            const released = await wclient.readContract({
              address: invoiceAddress,
              abi: invoiceAbi,
              functionName: "getReleased",
              args: [payee],
            });
            return { payee, share, released };
          })
        );

        const sharesData = {};
        const releasedData = {};

        shareResults.forEach(({ payee, share, released }) => {
          sharesData[payee] = share;
          releasedData[payee] = released;
        });

        setShares(sharesData);
        setReleased(releasedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching invoice details:", err);
        setError("Failed to fetch invoice details");
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceAddress]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Header />
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold mb-2">Loading invoice details...</p>
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
        <QRCode value={invoiceAddress || ""} size={128} className="absolute top-4 right-4" />
      </div>
      <h1 className="text-2xl font-bold mb-5">Invoice Details</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <p className="text-gray-700 text-sm font-bold mb-2">Invoice Address:</p>
          <p className="text-gray-700">{invoiceAddress}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-700 text-sm font-bold mb-2">Total Shares:</p>
          <p className="text-gray-700">{totalShares}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-700 text-sm font-bold mb-2">Total Released:</p>
          <p className="text-gray-700">{totalReleased}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-700 text-sm font-bold mb-2">Payees:</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Released</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payees.map((payee, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shares[payee] || "Loading..."}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{released[payee] || "Loading..."}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <footer className="bg-gray-800 text-white py-4 mt-10">
        <div className="container mx-auto text-center">
          <p className="text-sm">© {new Date().getFullYear()} Block Buddy Pay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default InvoiceTestPage;
