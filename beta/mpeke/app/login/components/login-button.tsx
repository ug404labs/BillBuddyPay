"use client";

import { useActiveAccount } from "thirdweb/react";
import { generatePayload, verifyPayload } from "../actions/auth";
import { signLoginPayload } from "thirdweb/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const LoginButton: React.FC = () => {
    const account = useActiveAccount();
    const router = useRouter();
    const [loading, setLoading] = useState(false); // Loading state

    async function handleClick() {
        if (!account) {
            return alert("Please connect your wallet");
        }

        setLoading(true); // Show spinner when login starts

        try {
            // Step 1: Generate the payload
            const payload = await generatePayload({ address: account.address });
            // Step 2: Sign the payload
            const signatureResult = await signLoginPayload({ account, payload });
            // Step 3: Send the signature to the server for verification
            const finalResult = await verifyPayload(signatureResult);

            if (finalResult.valid) {
                router.push('/dashboard'); // Redirect on success
            } else {
                alert("Login Failed");
                router.refresh(); // Reload the page if login fails
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false); // Hide spinner when login process finishes
        }
    }

    return (
        <button
            disabled={!account || loading}
            onClick={handleClick}
            className={`relative flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {loading ? (
                <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                </svg>
            ) : (
                "Login"
            )}
        </button>
    );
};
