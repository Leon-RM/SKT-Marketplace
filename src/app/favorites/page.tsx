'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { getProductById, getStoreProfile, Product, StoreProfile } from '@/lib/firebase';
import { ProductGrid } from '@/components/products/ProductCard';
import { useFavorites } from '@/hooks/useFavorites';
import { STORE_CATEGORIES, StoreCategory } from '@/types';
import { FeatureHint } from '@/components/ui/Helpers';
import { HeartIcon, PackageIcon, StoreIcon, ShoppingBagIcon, InfoIcon } from '@/components/ui/Icons';

export default function FavoritesPage() {
    const { favorites, isLoaded, toggleStoreFavorite } = useFavorites();
    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<StoreProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');

    useEffect(() => {
        if (isLoaded) {
            loadFavorites();
        }
    }, [isLoaded, favorites]);

    const loadFavorites = async () => {
        setLoading(true);

        // Load favorite products
        const productPromises = favorites.products.map(id => getProductById(id));
        const productResults = await Promise.all(productPromises);
        setProducts(productResults.filter((p): p is Product => p !== null));

        // Load favorite stores
        const storePromises = favorites.stores.map(id => getStoreProfile(id));
        const storeResults = await Promise.all(storePromises);
        setStores(storeResults.filter((s): s is StoreProfile => s !== null));

        setLoading(false);
    };

    return (
        <>
            <Header />
            <MobileNav />

            <main className="page-container">
                <h1 style={{ marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ color: 'var(--color-primary)', display: 'flex' }}><HeartIcon filled size={32} /></span>
                    รายการโปรด
                </h1>

                <FeatureHint
                    icon={<InfoIcon size={20} />}
                    title="รายการโปรดของคุณ"
                    text="รายการโปรดจะถูกบันทึกไว้ในเครื่องของคุณ ถ้าเปลี่ยนเครื่องหรือล้างข้อมูลเบราว์เซอร์จะหายไป"
                />

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
                    <button
                        className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('products')}
                        style={{ flex: 1, justifyContent: 'center', gap: 'var(--space-2)' }}
                    >
                        <PackageIcon size={18} />
                        <span>สินค้า ({favorites.products.length})</span>
                    </button>
                    <button
                        className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('stores')}
                        style={{ flex: 1, justifyContent: 'center', gap: 'var(--space-2)' }}
                    >
                        <StoreIcon size={18} />
                        <span>ร้านค้า ({favorites.stores.length})</span>
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : (
                    <>
                        {/* Products Tab */}
                        {activeTab === 'products' && (
                            products.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                                    <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'center' }}>
                                        <HeartIcon size={48} />
                                    </div>
                                    <h3>ยังไม่มีสินค้าโปรด</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                                        กดปุ่มหัวใจบนสินค้าที่ชอบเพื่อเพิ่มในรายการโปรด
                                    </p>
                                    <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>
                                        <ShoppingBagIcon size={18} />
                                        <span>ดูสินค้าทั้งหมด</span>
                                    </Link>
                                </div>
                            ) : (
                                <ProductGrid products={products} />
                            )
                        )}

                        {/* Stores Tab */}
                        {activeTab === 'stores' && (
                            stores.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                                    <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'center' }}>
                                        <StoreIcon size={48} />
                                    </div>
                                    <h3>ยังไม่ได้ติดตามร้านค้า</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                                        กดปุ่ม &quot;ติดตามร้าน&quot; บนร้านที่ชอบเพื่อเพิ่มในรายการโปรด
                                    </p>
                                    <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>
                                        <StoreIcon size={18} />
                                        <span>ดูร้านค้าทั้งหมด</span>
                                    </Link>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                    gap: 'var(--space-4)'
                                }}>
                                    {stores.map((store) => (
                                        <div key={store.sellerId} className="card" style={{ padding: 'var(--space-4)' }}>
                                            <Link href={`/store/${store.sellerId}`} style={{ textDecoration: 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                                    {store.profilePic ? (
                                                        <Image
                                                            src={store.profilePic}
                                                            alt={store.name}
                                                            width={60}
                                                            height={60}
                                                            style={{ borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            borderRadius: 'var(--radius-full)',
                                                            background: 'var(--bg-secondary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'var(--text-tertiary)'
                                                        }}>
                                                            <StoreIcon size={24} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{store.name}</h4>
                                                        <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                                                            {STORE_CATEGORIES[store.category as StoreCategory]?.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                <Link href={`/store/${store.sellerId}`} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                                                    ดูร้าน
                                                </Link>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => toggleStoreFavorite(store.sellerId)}
                                                    style={{ padding: '8px 16px', color: '#EF4444' }}
                                                >
                                                    <HeartIcon filled size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </main>
        </>
    );
}
