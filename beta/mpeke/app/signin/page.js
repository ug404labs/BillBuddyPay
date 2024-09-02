"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getApps, getApp } from 'firebase/app';
import serviceAccount from '/app/lib/mpeke-beta-firebase-adminsdk-in60y-1f259298f1.json';
import axios from 'axios';

const firebaseConfig = {
  // Your Firebase configuration goes here
  apiKey: serviceAccount.apiKey,
  authDomain: serviceAccount.authDomain,
  projectId: serviceAccount.projectId,
  storageBucket: serviceAccount.storageBucket,
  messagingSenderId: serviceAccount.messagingSenderId,
  appId: serviceAccount.appId,
  measurementId: serviceAccount.measurementId,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();

const SignInPage = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber
          handleSignIn();
        },
      },
      auth
    );
  };

  const handleSignIn = async () => {
    try {
      setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmationResult);
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await confirmationResult.confirm(verificationCode);
      // Sign-in successful, redirect to the appropriate page
      router.push('/dashboard');
    } catch (error) {
      console.error('Error verifying code:', error);
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <div>
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button onClick={handleSignIn}>Send Code</button>
      </div>
      {confirmationResult && (
        <div>
          <label htmlFor="verificationCode">Verification Code:</label>
          <input
            type="text"
            id="verificationCode"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <button onClick={handleVerifyCode}>Verify</button>
        </div>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default SignInPage;