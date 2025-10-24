// app/create/page.js
"use client";

import { encryptData } from "@/utils/crypto";
import { getSolanaKeyPair } from "@/utils/solana";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useWallet } from "@/context/walletcontext";
import Link from "next/link";

export default function CreateWalletPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mnemonics, setMnemonics] = useState("");
    const [verificationWords, setVerificationWords] = useState<{ index: number; word: string }[]>([]);
    const [userInput, setUserInput] = useState(["", "", ""]);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { loginWallet } = useWallet();

    useEffect(() => {
        // Redirect if wallet already exists
        if (typeof window !== 'undefined' && localStorage.getItem("walletData")) {
            router.replace('/login');
        }
    }, [router]);

    const handlePasswordSubmit = (e:any) => {
        e.preventDefault();
        if (password.length < 8) {
            alert("Password must be at least 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        generateMnemonic();
        setStep(2);
    };

    const generateMnemonic = () => {
        const mnemonicPhrase = mnemonicGenerate(12);
        setMnemonics(mnemonicPhrase);
        const words = mnemonicPhrase.split(" ");
        const indices = [2, 5, 8];
        setVerificationWords(indices.map((i) => ({ index: i, word: words[i] })));
    };

    const handleVerificationSubmit = async (e:any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const words = mnemonics.split(" ");
            const isValid = verificationWords.every(({ index }, i) =>
                userInput[i].toLowerCase() === words[index].toLowerCase()
            );

            if (isValid) {
                const encryptedData = await encryptData(password, mnemonics);
                localStorage.setItem("walletData", JSON.stringify({
                    salt: encryptedData.salt,
                    iv: encryptedData.iv,
                    encryptedContent: encryptedData.encryptedContent
                }));

                const solanaKeyPair = await getSolanaKeyPair(mnemonics);
                loginWallet(solanaKeyPair);
                router.push('/wallet');
            } else {
                alert("Verification Failed! Please enter the correct words.");
            }
        } catch (error) {
            console.error("Error during verification:", error);
            alert("An error occurred during wallet creation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-96 mx-auto p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center mb-6 text-black">Create New Wallet</h1>

                {step === 1 ? (
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Set Password</label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Set a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Continue
                        </button>
                        <div className="mt-4 text-center">
                            <Link href="/login" className="text-blue-500 hover:text-blue-700">
                                Already have a wallet? Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800 font-bold mb-2">Write down these 12 words securely:</p>
                            <p className="bg-white p-3 text-gray-500 rounded border font-mono text-sm break-words">{mnemonics}</p>
                            <p className="mt-2 text-red-600 text-sm font-bold">Important: Never share your seed phrase with anyone!</p>
                        </div>

                        <form onSubmit={handleVerificationSubmit} className="text-black">
                            <p className="mb-3 font-medium">
                                Verify by entering words #{" "}
                                {verificationWords.map((w) => w.index + 1).join(", ")}
                            </p>

                            <div className="space-y-3 mb-4">
                                {verificationWords.map((vw, i) => (
                                    <div key={i} className="flex items-center">
                                        <span className="mr-2 font-medium">Word {vw.index + 1}:</span>
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={userInput[i]}
                                            onChange={(e) => {
                                                const newInput = [...userInput];
                                                newInput[i] = e.target.value;
                                                setUserInput(newInput);
                                            }}
                                            placeholder={`Enter word #${vw.index + 1}`}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Verify and Create Wallet"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full mt-3 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Back
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}