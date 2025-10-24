// contexts/WalletContext.js
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Create the WalletContext
const WalletContext = createContext<any>(null);

// Export the WalletContext for use in other components
export const useWallet = () => useContext(WalletContext);

// WalletProvider component
export function WalletProvider({ children }: { children: ReactNode }) {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathname = window.location.pathname;
            if (pathname === '/login' || pathname === '/create') {
                setLoading(false);
                return;
            }

            const walletData = localStorage.getItem('walletData');
            if (!walletData && pathname !== '/') {
                router.replace('/');
                return;
            }
            setLoading(false);
        }
    }, [router]);

    const loginWallet = (keyPair: any) => {
        setWallet(keyPair);
    };

    const logoutWallet = () => {
        setWallet(null);
        router.replace('/login');
    };

    return (
        <WalletContext.Provider value={{ wallet, loginWallet, logoutWallet, loading }}>
            {children}
        </WalletContext.Provider>
    );
}