"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [hasWallet, setHasWallet] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if wallet already exists
    if (typeof window !== 'undefined') {
      const walletData = localStorage.getItem('walletData');
      setHasWallet(!!walletData);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Solana Wallet App</h1>
        <p className="text-xl text-gray-600">A secure web-based wallet for Solana blockchain</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-black">Create New Wallet</h2>
          <p className="text-gray-600 text-center mb-4">
            Create a new Solana wallet with a secure seed phrase and password protection.
          </p>
          <Link href="/create" className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-center">
            Create Wallet
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-black">Access Your Wallet</h2>
          <p className="text-gray-600 text-center mb-4">
            Already have a wallet? Login to access your funds and manage your assets.
          </p>
          <Link href="/login" className={`w-full py-2 px-4 rounded-lg text-center transition-colors ${hasWallet ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
            Login to Wallet
          </Link>
          {!hasWallet && <p className="text-sm text-gray-500 mt-2">No wallet found on this device</p>}
        </div>
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-lg p-6 text-gray-900">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <ul className="grid md:grid-cols-2 gap-4">
          <li className="flex items-start">
            <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Secure local encryption</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Send and receive SOL</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Token swaps (via Jupiter)</span>
          </li>
          <li className="flex items-start">
            <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Mainnet and Devnet support</span>
          </li>
        </ul>
      </div>

      <div className="mt-8 text-center text-gray-500">
        <p>Your keys are encrypted and stored locally. Never share your seed phrase with anyone.</p>
      </div>
    </div>
  );
}