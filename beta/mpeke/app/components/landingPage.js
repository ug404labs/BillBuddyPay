"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FaDollarSign, FaUsers, FaRegCalendarAlt, FaHandHoldingUsd, FaPhone } from 'react-icons/fa'; // Font Awesome icons

const LandingPage = () => {
    const [loading, setLoading] = useState(false);

    const handleSignInClick = () => {
        setLoading(true);
        setTimeout(() => { // Simulate loading
            setLoading(false);
        }, 2000); // Adjust the timeout as needed
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-green-100 text-gray-800">
            <section className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-extrabold mb-6 text-green-600">Welcome to Mpeke</h1>
                <p className="text-lg mb-8 text-gray-700">
                    Leverage the power of blockchain technology to
                </p>
                <p className="text-lg mb-8 text-gray-700">
                    Manage Savings, Group Expense Splitting, Automatic Payments, and Joint Financial Moves.
                </p>
                <p className="text-lg mb-8 text-gray-700">
                    Risk-free, transparent, and secure.
                </p>
                <Link href="/signin" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-center">
                    Sign In
                </Link>

            </section>

            <section className="bg-orange-100 w-full py-12 mt-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4 text-orange-600">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                            <FaDollarSign className="text-3xl text-green-500 mb-3" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Group Expense Splitting</h3>
                            <p className="text-gray-600">
                                Easily split bills and expenses among friends, with automatic tracking of who owes what.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                            <FaUsers className="text-3xl text-green-500 mb-3" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Sacco Group Management</h3>
                            <p className="text-gray-600">
                                Create and manage savings groups with customizable settings for contributions, duration, and member management.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                            <FaRegCalendarAlt className="text-3xl text-green-500 mb-3" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Automatic Payments</h3>
                            <p className="text-gray-600">
                                Set up recurring payments within groups to ensure that contributions and payments are made on time.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                            <FaHandHoldingUsd className="text-3xl text-green-500 mb-3" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Joint Investments</h3>
                            <p className="text-gray-600">
                                Pool resources with friends for joint investments, with transparent tracking and management of funds.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                            <FaPhone className="text-3xl text-green-500 mb-3" />
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Phone Number Linking</h3>
                            <p className="text-gray-600">
                                Link EVM wallets to phone numbers for easy access and management of group finances.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-4xl mx-auto text-center mt-12">
                <h2 className="text-3xl font-bold mb-4 text-green-600">How It Works</h2>
                <p className="text-lg text-gray-700 mb-8">
                    Sign up, create or join groups, manage transactions, and track your progress—all from one convenient app.
                </p>
                <div className="bg-green-200 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold text-green-800 mb-3">Getting Started</h3>
                    <p className="text-gray-600">
                        Download Mpeke as a WebApp today. Android and iOS versions are coming soon. Register with your phone number, and start managing your group finances with ease.
                    </p>
                </div>
            </section>

            <footer className="w-full py-6 mt-12 bg-green-500 text-white text-center">
                <p>&copy; {new Date().getFullYear()} Mpeke. Empowering group finances, one transaction at a time.</p>
                <p className="mt-2">For support or feedback, contact us at <a href="mailto:support@mpeke.com" className="underline">support@mpeke.com</a></p>
            </footer>
        </main>
    );
};

export default LandingPage;
