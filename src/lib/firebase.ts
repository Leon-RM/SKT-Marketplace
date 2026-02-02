// Firebase Configuration
// ต้องใส่ค่า Firebase credentials ของคุณที่นี่

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

// Firebase config - ใส่ค่าจาก Firebase Console
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Allowed email domain for sellers
const ALLOWED_EMAIL_DOMAIN = '@sk-thonburi.ac.th';

// ===== Authentication Functions =====

/**
 * ลงชื่อเข้าใช้ด้วย Google
 * ตรวจสอบว่าอีเมลลงท้ายด้วย @sk-thonburi.ac.th
 */
export async function signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string; isNewUser?: boolean }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check email domain
    if (!user.email?.endsWith(ALLOWED_EMAIL_DOMAIN)) {
      try {
        await user.delete();
      } catch (deleteErr) {
        console.error('Cleanup failed:', deleteErr);
      }
      await signOut(auth);
      return {
        success: false,
        error: 'ใช้อีเมลโรงเรียนเท่านั้น (@sk-thonburi.ac.th)'
      };
    }

    // Check if user exists in Firestore
    const sellerDoc = await getDoc(doc(db, 'sellers', user.uid));
    const isNewUser = !sellerDoc.exists();

    return { success: true, user, isNewUser };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
    return { success: false, error: errorMessage };
  }
}

/**
 * ออกจากระบบ
 */
export async function logOut() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
    return { success: false, error: errorMessage };
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ===== Seller Functions =====

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
  category: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * สร้างบัญชีผู้ขายใหม่
 */
export async function createSellerProfile(
  uid: string,
  email: string,
  realName: string,
  nickname: string,
  studentId: string
) {
  try {
    const now = Timestamp.now();
    await setDoc(doc(db, 'sellers', uid), {
      uid,
      email,
      realName,
      nickname,
      studentId,
      createdAt: now,
      updatedAt: now
    });
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
    return { success: false, error: errorMessage };
  }
}

/**
 * ดึงข้อมูลผู้ขาย
 */
export async function getSellerProfile(uid: string): Promise<SellerProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, 'sellers', uid));
    if (docSnap.exists()) {
      return docSnap.data() as SellerProfile;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * สร้างหรืออัพเดทร้านค้า
 */
export async function createOrUpdateStore(
  sellerId: string,
  name: string,
  bio: string,
  profilePic: string,
  bannerPic: string,
  category: string
) {
  try {
    const now = Timestamp.now();
    const storeRef = doc(db, 'stores', sellerId);
    const storeSnap = await getDoc(storeRef);

    if (storeSnap.exists()) {
      await updateDoc(storeRef, {
        name,
        bio,
        profilePic,
        bannerPic,
        category,
        updatedAt: now
      });
    } else {
      await setDoc(storeRef, {
        sellerId,
        name,
        bio,
        profilePic,
        bannerPic,
        category,
        createdAt: now,
        updatedAt: now
      });
    }
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
    return { success: false, error: errorMessage };
  }
}

/**
 * ดึงข้อมูลร้านค้า
 */
export async function getStoreProfile(sellerId: string): Promise<StoreProfile | null> {
  try {
    const docSnap = await getDoc(doc(db, 'stores', sellerId));
    if (docSnap.exists()) {
      return docSnap.data() as StoreProfile;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * ดึงร้านค้าทั้งหมด
 */
export async function getAllStores(): Promise<StoreProfile[]> {
  try {
    const q = query(collection(db, 'stores'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as StoreProfile);
  } catch {
    return [];
  }
}

// ===== Product Functions =====

export interface Product {
  id?: string;
  sellerId: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  buyLink: string;
  type: 'secondhand' | 'homemade' | 'preorder';
  inStock: boolean;
  preorderEnabled?: boolean;
  preorderStartDate?: Timestamp;
  preorderEndDate?: Timestamp;
  preorderRepeat?: 'none' | 'weekly';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * สร้างสินค้าใหม่
 */
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = Timestamp.now();

    // Remove undefined fields which Firestore doesn't like
    const cleanData = JSON.parse(JSON.stringify({
      ...product,
      createdAt: now,
      updatedAt: now
    }));

    // Convert timestamps back since JSON.stringify/parse clears them
    cleanData.createdAt = now;
    cleanData.updatedAt = now;

    const docRef = await addDoc(collection(db, 'products'), cleanData);
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
    return { success: false, error: errorMessage };
  }
}

/**
 * อัพเดทสินค้า
 */
export async function updateProduct(productId: string, updates: Partial<Product>) {
  try {
    const now = Timestamp.now();

    // Remove undefined fields which Firestore doesn't like
    const cleanUpdates = JSON.parse(JSON.stringify({
      ...updates,
      updatedAt: now
    }));

    // Convert timestamp back
    cleanUpdates.updatedAt = now;

    await updateDoc(doc(db, 'products', productId), cleanUpdates);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
    return { success: false, error: errorMessage };
  }
}

/**
 * ลบสินค้า
 */
export async function deleteProduct(productId: string) {
  try {
    await deleteDoc(doc(db, 'products', productId));
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
    return { success: false, error: errorMessage };
  }
}

/**
 * ดึงสินค้าของผู้ขาย
 */
export async function getSellerProducts(sellerId: string): Promise<Product[]> {
  try {
    const q = query(
      collection(db, 'products'),
      where('sellerId', '==', sellerId)
    );
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

    // Sort in-memory to avoid needing a composite index in Firestore
    return products.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error) {
    console.error('Error getting seller products:', error);
    return [];
  }
}

/**
 * ดึงสินค้าทั้งหมด
 */
export async function getAllProducts(limitCount?: number): Promise<Product[]> {
  try {
    let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    if (limitCount) {
      q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(limitCount));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch {
    return [];
  }
}

/**
 * ดึงสินค้าตาม ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const docSnap = await getDoc(doc(db, 'products', productId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch {
    return null;
  }
}

// ===== Review Functions =====

export interface Review {
  id?: string;
  productId: string;
  rating: number;
  text: string;
  authorName: string;
  images: string[];
  createdAt: Timestamp;
}

/**
 * สร้างรีวิว
 */
export async function createReview(review: Omit<Review, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
    return { success: false, error: errorMessage };
  }
}

/**
 * ดึงรีวิวของสินค้า
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId)
    );
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));

    // Sort in-memory to avoid needing a composite index in Firestore
    return reviews.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch {
    return [];
  }
}

export { auth, db };
