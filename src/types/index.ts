// Types for SK Thonburi Marketplace

import { Timestamp } from 'firebase/firestore';

// ===== Seller & Store Types =====

export interface SellerProfile {
    uid: string;
    email: string;
    realName: string;
    nickname: string;
    studentId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface StoreProfile {
    sellerId: string;
    name: string;
    bio: string;
    profilePic: string;
    bannerPic?: string;
    category: StoreCategory;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export type StoreCategory =
    | 'food'           // อาหาร
    | 'secondhand'     // ของมือสอง
    | 'homemade'       // งานฝีมือ
    | 'gadgets'        // อุปกรณ์
    | 'books'          // หนังสือ
    | 'clothing'       // เสื้อผ้า
    | 'other';         // อื่นๆ

export const STORE_CATEGORIES: Record<StoreCategory, { emoji: string; label: string }> = {
    food: { emoji: '🍔', label: 'อาหาร' },
    secondhand: { emoji: '♻️', label: 'ของมือสอง' },
    homemade: { emoji: '🎨', label: 'งานฝีมือ' },
    gadgets: { emoji: '📱', label: 'อุปกรณ์' },
    books: { emoji: '📚', label: 'หนังสือ' },
    clothing: { emoji: '👕', label: 'เสื้อผ้า' },
    other: { emoji: '🎁', label: 'อื่นๆ' }
};

// ===== Product Types =====

export type ProductType = 'secondhand' | 'homemade' | 'preorder';

export const PRODUCT_TYPES: Record<ProductType, { emoji: string; label: string; description: string }> = {
    secondhand: {
        emoji: '♻️',
        label: 'มือสอง',
        description: 'สินค้าที่ใช้แล้ว'
    },
    homemade: {
        emoji: '🎨',
        label: 'งานฝีมือ',
        description: 'สินค้าที่ทำเอง'
    },
    preorder: {
        emoji: '⏰',
        label: 'พรีออเดอร์',
        description: 'สั่งจองล่วงหน้า'
    }
};

export interface Product {
    id?: string;
    sellerId: string;
    name: string;
    description: string;
    images: string[];
    category: string;
    buyLink: string;
    type: ProductType;
    inStock: boolean;
    // Preorder specific
    preorderEnabled?: boolean;
    preorderStartDate?: Timestamp;
    preorderEndDate?: Timestamp;
    preorderRepeat?: 'none' | 'weekly';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== Review Types =====

export interface Review {
    id?: string;
    productId: string;
    rating: number; // 1-5
    text: string;
    authorName: string; // "ไม่ระบุชื่อ" for anonymous
    images: string[];
    createdAt: Timestamp;
}

// ===== Favorites (localStorage) =====

export interface Favorites {
    products: string[]; // product IDs
    stores: string[];   // store/seller IDs
}

// ===== UI Types =====

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}

export interface ModalState {
    isOpen: boolean;
    type?: string;
    data?: unknown;
}
