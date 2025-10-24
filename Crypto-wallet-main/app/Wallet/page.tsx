// app/wallet/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Connection,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    PublicKey,
    sendAndConfirmTransaction,
    clusterApiUrl,
} from "@solana/web3.js";
import { useWallet } from "@/context/walletcontext";
import { useRouter } from "next/navigation";
import {QRCodeSVG} from "qrcode.react";

export default function WalletPage() {
    const { wallet, logoutWallet } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [sendTo, setSendTo] = useState("");
    const [sendAmount, setSendAmount] = useState("");
    const [swapInputToken, setSwapInputToken] = useState("SOL");
    const [swapOutputToken, setSwapOutputToken] = useState("USDC");
    const [swapAmount, setSwapAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState("send");
    const router = useRouter();

    // Network selection
    const [network, setNetwork] = useState("devnet");
    const getEndpoint = () => {
        return clusterApiUrl(network === "mainnet-beta" ? "mainnet-beta" : "devnet");
    };

    useEffect(() => {
        if (!wallet) {
            router.replace('/login');
            return;
        }

        fetchBalance();
    }, [wallet, network, router]);

    const fetchBalance = async () => {
        if (!wallet) return;

        setRefreshing(true);
        try {
            const connection = new Connection(getEndpoint());
            const bal = await connection.getBalance(wallet.publicKey);
            setBalance(bal / LAMPORTS_PER_SOL);
        } catch (error) {
            console.error("Error fetching balance:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleSend = async (e:any) => {
        e.preventDefault();

        if (!sendTo || !sendAmount || isNaN(parseFloat(sendAmount)) || parseFloat(sendAmount) <= 0) {
            alert("Please enter a valid recipient address and amount");
            return;
        }

        setLoading(true);
        try {
            const connection = new Connection(getEndpoint());
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: new PublicKey(sendTo),
                    lamports: parseFloat(sendAmount) * LAMPORTS_PER_SOL,
                })
            );

            const signature = await sendAndConfirmTransaction(
                connection,
                transaction,
                [wallet]
            );

            alert(`Transaction sent successfully!\nSignature: ${signature}`);
            setSendTo("");
            setSendAmount("");
            fetchBalance();
        } catch (error) {
            console.error("Error sending transaction:", error);
            alert(`Error sending transaction: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSwap = async (e:any) => {
        e.preventDefault();

        if (!swapAmount || isNaN(parseFloat(swapAmount)) || parseFloat(swapAmount) <= 0) {
            alert("Please enter a valid amount to swap");
            return;
        }

        alert(
            `Swap ${swapAmount} ${swapInputToken} to ${swapOutputToken} not implemented yet. You would integrate Jupiter API here.`
        );
    };

    const handleLogout = () => {
        if (confirm("Are you sure you want to logout?")) {
            logoutWallet();
        }
    };

    if (!wallet) {
        return <div className="text-center p-8">Loading wallet...</div>;
    }

    return (
        <div className="w-96 mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Your Solana Wallet</h1>
                <div className="flex items-center space-x-4">
                    <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-gray-500"
                    >
                        <option value="mainnet-beta">Mainnet</option>
                        <option value="devnet">Devnet</option>
                    </select>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-gray-700">
                <div className="flex flex-col md:flex-row md:items-start justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                        <p className="text-gray-500 mb-1">Wallet Address</p>
                        <p className="font-mono text-sm break-all">{wallet.publicKey.toString()}</p>
                    </div>
                    <div className="flex-1 text-right">
                        <p className="text-gray-500 mb-1">Balance</p>
                        <div className="flex flex-col items-end">
                            <p className="text-2xl font-bold mb-2">
                                {balance !== null ? `${balance.toFixed(2)} SOL` : "Loading..."}
                            </p>
                            <button
                                onClick={fetchBalance}
                                className="p-2 text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                                disabled={refreshing}
                            >
                                ↻
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden text-black">
                <div className="flex border-b">
                    <button
                        className={`flex-1 py-3 font-medium ${activeTab === 'send' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                        onClick={() => setActiveTab('send')}
                    >
                        Send
                    </button>
                    <button
                        className={`flex-1 py-3 font-medium ${activeTab === 'receive' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                        onClick={() => setActiveTab('receive')}
                    >
                        Receive
                    </button>
                    <button
                        className={`flex-1 py-3 font-medium ${activeTab === 'swap' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                        onClick={() => setActiveTab('swap')}
                    >
                        Swap
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'send' && (
                        <form onSubmit={handleSend}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Recipient Address</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Solana address"
                                    value={sendTo}
                                    onChange={(e) => setSendTo(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Amount (SOL)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="0.00"
                                    value={sendAmount}
                                    onChange={(e) => setSendAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send SOL"}
                            </button>
                        </form>
                    )}

                    {activeTab === 'receive' && (
                        <div className="flex flex-col items-center">
                            <p className="mb-4 text-center">Share this address to receive SOL and other tokens:</p>
                            <div className="p-4 bg-white border rounded-lg mb-4">
                                <QRCodeSVG value={wallet.publicKey.toString()} size={200} />
                            </div>
                            <div className="w-full p-3 bg-gray-100 rounded-lg font-mono text-sm break-all text-center">
                                {wallet.publicKey.toString()}
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(wallet.publicKey.toString());
                                    alert("Address copied to clipboard!");
                                }}
                                className="mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Copy Address
                            </button>
                        </div>
                    )}

                    {activeTab === 'swap' && (
                        <form onSubmit={handleSwap}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">From</label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        className="flex-1 px-3 py-2 border rounded-l-lg"
                                        placeholder="0.00"
                                        value={swapAmount}
                                        onChange={(e) => setSwapAmount(e.target.value)}
                                        required
                                    />
                                    <select
                                        value={swapInputToken}
                                        onChange={(e) => {
                                            setSwapInputToken(e.target.value);
                                            if (e.target.value === swapOutputToken) {
                                                setSwapOutputToken(swapInputToken);
                                            }
                                        }}
                                        className="px-3 py-2 border border-l-0 rounded-r-lg bg-gray-50"
                                    >
                                        <option value="SOL">SOL</option>
                                        <option value="USDC">USDC</option>
                                        <option value="USDT">USDT</option>
                                        <option value="BTC">BTC</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-center my-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const temp = swapInputToken;
                                        setSwapInputToken(swapOutputToken);
                                        setSwapOutputToken(temp);
                                    }}
                                    className="p-2 bg-gray-200 rounded-full"
                                >
                                    ↓↑
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">To (Estimated)</label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        className="flex-1 px-3 py-2 border rounded-l-lg bg-gray-100"
                                        placeholder="0.00"
                                        disabled
                                        value=""
                                    />
                                    <select
                                        value={swapOutputToken}
                                        onChange={(e) => {
                                            setSwapOutputToken(e.target.value);
                                            if (e.target.value === swapInputToken) {
                                                setSwapInputToken(swapOutputToken);
                                            }
                                        }}
                                        className="px-3 py-2 border border-l-0 rounded-r-lg bg-gray-50"
                                    >
                                        <option value="USDC">USDC</option>
                                        <option value="SOL">SOL</option>
                                        <option value="USDT">USDT</option>
                                        <option value="BTC">BTC</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors"
                            >
                                Swap Tokens
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}