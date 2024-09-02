'use client'

import React, { useState, useEffect } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { app } from '../config'
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [confirmationResult, setConfirmationResult] = useState(null)
    const [otpSent, setOtpSent] = useState(false)
    const [loading, setLoading] = useState(false)

    const auth = getAuth(app);
    const router = useRouter();

    useEffect(() => {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            'size': 'invisible',
            'callback': (response) => {},
            'expired-callback': () => {},
        });
    }, [auth]);

    const handlePhoneNumberChange = (e) => {
        setPhoneNumber(e.target.value);
    };

    const handleOTPChange = (e) => {
        setOtp(e.target.value);
    }

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            const formattedPhoneNumber = `+${phoneNumber.replace(/\D/g, '')}`;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier)
            setConfirmationResult(confirmation);
            setOtpSent(true);
            setPhoneNumber('');
            alert('OTP has been sent');
        } catch (error) {
            console.error(error)
            alert('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async () => {
        setLoading(true);
        try {
            await confirmationResult.confirm(otp)
            setOtp('');
            router.push('/dashboard')
        } catch (error) {
            console.error(error)
            alert('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const LoadingSpinner = () => (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign In
                </h2>
                {!otpSent && (
                    <div id="recaptcha-container" className="flex justify-center"></div>
                )}
                <div className="mt-8 space-y-6">
                    {!otpSent ? (
                        <div>
                            <label htmlFor="phone-number" className="sr-only">Phone Number</label>
                            <input
                                id="phone-number"
                                type="tel"
                                value={phoneNumber}
                                onChange={handlePhoneNumberChange}
                                placeholder="Enter Phone Number with Country Code"
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                required
                            />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="otp" className="sr-only">OTP</label>
                            <input
                                id="otp"
                                type="text"
                                value={otp}
                                onChange={handleOTPChange}
                                placeholder="Enter OTP"
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <button
                            onClick={otpSent ? handleOTPSubmit : handleSendOtp}
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                                otpSent ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                otpSent ? 'focus:ring-green-500' : 'focus:ring-blue-500'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading && <LoadingSpinner />}
                            {otpSent ? 'Verify OTP' : 'Send OTP'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}