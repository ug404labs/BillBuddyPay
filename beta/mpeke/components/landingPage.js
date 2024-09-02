import React from 'react';
import { useRouter } from 'next/router';

const LandingPage = () => {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/get-started');
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-green-500 text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome to Mpeke</h1>
            <p className="text-lg mb-8">
                Simplifying group payments and sacco management on the Celo chain.
            </p>
            <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleGetStarted}
            >
                Get Started
            </button>
        </main>
    );
};

export default LandingPage;