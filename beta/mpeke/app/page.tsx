"use client";
import { NextPage } from "next";
import { useEffect } from "react";

const Home: NextPage = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, 3000); // Redirect after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-green-600">
          Welcome to Block Buddy Universe
        </h1>
        <p className="text-xl text-gray-700 mb-8">Loading your experience...</p>
        <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default Home;
