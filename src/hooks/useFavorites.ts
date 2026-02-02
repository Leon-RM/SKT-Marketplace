'use client';

import { useState, useEffect, useCallback } from 'react';
import { Favorites } from '@/types';

const FAVORITES_KEY = 'skt-marketplace-favorites';

const defaultFavorites: Favorites = {
    products: [],
    stores: []
};

export function useFavorites() {
    const [favorites, setFavorites] = useState<Favorites>(defaultFavorites);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY);
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
        setIsLoaded(true);
    }, []);

    // Save favorites to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            } catch (error) {
                console.error('Error saving favorites:', error);
            }
        }
    }, [favorites, isLoaded]);

    const isProductFavorite = useCallback((productId: string) => {
        return favorites.products.includes(productId);
    }, [favorites.products]);

    const isStoreFavorite = useCallback((storeId: string) => {
        return favorites.stores.includes(storeId);
    }, [favorites.stores]);

    const toggleProductFavorite = useCallback((productId: string) => {
        setFavorites(prev => {
            const isCurrentlyFavorite = prev.products.includes(productId);
            return {
                ...prev,
                products: isCurrentlyFavorite
                    ? prev.products.filter(id => id !== productId)
                    : [...prev.products, productId]
            };
        });
    }, []);

    const toggleStoreFavorite = useCallback((storeId: string) => {
        setFavorites(prev => {
            const isCurrentlyFavorite = prev.stores.includes(storeId);
            return {
                ...prev,
                stores: isCurrentlyFavorite
                    ? prev.stores.filter(id => id !== storeId)
                    : [...prev.stores, storeId]
            };
        });
    }, []);

    const clearFavorites = useCallback(() => {
        setFavorites(defaultFavorites);
    }, []);

    return {
        favorites,
        isLoaded,
        isProductFavorite,
        isStoreFavorite,
        toggleProductFavorite,
        toggleStoreFavorite,
        clearFavorites,
        favoriteProductsCount: favorites.products.length,
        favoriteStoresCount: favorites.stores.length
    };
}
