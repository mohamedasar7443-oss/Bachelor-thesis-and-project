// app/login/page.js
"use client"

import { decryptData } from '@/utils/crypto';
import { getSolanaKeyPair } from '@/utils/solana';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useWallet } from '@/context/walletcontext';
import Link from 'next/link';

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { loginWallet } = useWallet();

    useEffect(() => {
        // Check if wallet data exists
        if (typeof window !== 'undefined' && !localStorage.getItem("walletData")) {
            router.replace('/create');
        }
    }, [router]);

    const handleLogin = async (e:any) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const storedData = JSON.parse(localStorage.getItem("walletData") || "{}");

            if (!storedData.salt || !storedData.iv || !storedData.encryptedContent) {
                throw new Error("Wallet data is corrupted");
            }

            const encryptedData = {
                salt: new Uint8Array(storedData.salt),
                iv: new Uint8Array(storedData.iv),
                encryptedContent: new Uint8Array(storedData.encryptedContent)
            };

            const mnemonics = await decryptData(password, encryptedData);
            const keyPair = await getSolanaKeyPair(mnemonics);

            loginWallet(keyPair);
            router.push('/wallet');
        } catch (error) {
            console.error("Login error:", error);
            setError("Invalid password or corrupted wallet data");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to reset your wallet? This will delete your encrypted wallet data. Make sure you have your seed phrase backed up!")) {
            localStorage.removeItem("walletData");
            router.replace('/create');
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-900'>
            <div className="w-96 mx-auto p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl text-black font-bold text-center mb-6">Login to Your Wallet</h1>

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Enter Your Password</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your wallet password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="mt-6 flex flex-col space-y-2">
                    <Link href="/create" className="text-blue-500 hover:text-blue-700 text-center">
                        Create a new wallet
                    </Link>

                    <button
                        onClick={handleReset}
                        className="text-red-500 hover:text-red-700 text-center"
                    >
                        Reset wallet
                    </button>
                </div>
            </div>
        </div>
    );
}