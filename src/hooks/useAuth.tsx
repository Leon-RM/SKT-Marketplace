'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
    onAuthChange,
    getSellerProfile,
    getStoreProfile,
    SellerProfile,
    StoreProfile
} from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    seller: SellerProfile | null;
    store: StoreProfile | null;
    loading: boolean;
    isNewUser: boolean;
    needsStoreSetup: boolean;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    seller: null,
    store: null,
    loading: true,
    isNewUser: false,
    needsStoreSetup: false,
    refreshUserData: async () => { }
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [seller, setSeller] = useState<SellerProfile | null>(null);
    const [store, setStore] = useState<StoreProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const isNewUser = user && !seller;
    const needsStoreSetup = seller && !store;

    const refreshUserData = async () => {
        if (!user) return;

        const sellerData = await getSellerProfile(user.uid);
        setSeller(sellerData);

        if (sellerData) {
            const storeData = await getStoreProfile(user.uid);
            setStore(storeData);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                const sellerData = await getSellerProfile(firebaseUser.uid);
                setSeller(sellerData);

                if (sellerData) {
                    const storeData = await getStoreProfile(firebaseUser.uid);
                    setStore(storeData);
                } else {
                    setStore(null);
                }
            } else {
                setSeller(null);
                setStore(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            seller,
            store,
            loading,
            isNewUser: !!isNewUser,
            needsStoreSetup: !!needsStoreSetup,
            refreshUserData
        }}>{children}</AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
