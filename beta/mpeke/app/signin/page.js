"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getApps, getApp } from 'firebase/app';
import serviceAccount from '/app/lib/mpeke-beta-firebase-adminsdk-in60y-1f259298f1.json';
import axios from 'axios';


const SignInPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isOTPRequested, setIsOTPRequested] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            await axios.post('/api/send-otp', { phoneNumber });
            setIsOTPRequested(true);
        } catch (error) {
            console.error('Failed to send OTP', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/verify-otp', { phoneNumber, otp });
            if (response.data.success) {
                router.push('/dashboard'); // Redirect to dashboard on successful OTP verification
            } else {
                alert('Verification failed. Please try again.');
            }
        } catch (error) {
            console.error('Failed to verify OTP', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Sign In</h1>
                <input
                    type="text"
                    placeholder="Phone Number"
                    className="w-full p-3 border border-gray-300 rounded mb-4"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                {isOTPRequested && (
                    <>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            className="w-full p-3 border border-gray-300 rounded mb-4"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                            onClick={handleVerifyOtp}
                            disabled={loading}
                        >
                            Verify OTP
                        </button>
                    </>
                )}
                {!isOTPRequested && (
                    <button
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                        onClick={handleSendOtp}
                        disabled={loading}
                    >
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SignInPage;