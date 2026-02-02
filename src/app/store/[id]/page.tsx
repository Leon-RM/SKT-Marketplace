'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { getStoreProfile, getSellerProducts, StoreProfile, Product } from '@/lib/firebase';
import { ProductGrid } from '@/components/products/ProductCard';
import { useFavorites } from '@/hooks/useFavorites';
import { STORE_CATEGORIES, StoreCategory } from '@/types';
import { StoreIcon, PackageIcon, ChevronLeftIcon, HeartIcon, AlertIcon } from '@/components/ui/Icons';

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [store, setStore] = useState<StoreProfile | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { isStoreFavorite, toggleStoreFavorite } = useFavorites();

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        const [storeData, productsData] = await Promise.all([
            getStoreProfile(id),
            getSellerProducts(id)
        ]);
        setStore(storeData);
        setProducts(productsData);
        setLoading(false);
    };

    if (loading) {
        return (
            <>
                <Header />
                <MobileNav />
                <main className="page-container">
                    <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                </main>
            </>
        );
    }

    if (!store) {
        return (
            <>
                <Header />
                <MobileNav />
                <main className="page-container">
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                        <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'center' }}>
                            <AlertIcon size={48} />
                        </div>
                        <h2>ไม่พบร้านค้า</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                            ร้านค้านี้อาจถูกลบหรือไม่มีอยู่
                        </p>
                        <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>
                            <ChevronLeftIcon size={20} />
                            <span>กลับหน้าหลัก</span>
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    const storeNames = { [store.sellerId]: store.name };

    return (
        <>
            <Header />
            <MobileNav />

            <main className="page-container">
                <Link href="/" style={{
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-6)',
                    width: 'fit-content'
                }}>
                    <ChevronLeftIcon size={20} />
                    <span>กลับหน้าหลัก</span>
                </Link>

                {/* Store Header */}
                <section className="card" style={{ marginBottom: 'var(--space-8)', padding: 0, overflow: 'hidden' }}>
                    {store.bannerPic && (
                        <div style={{
                            height: '200px',
                            position: 'relative'
                        }}>
                            <Image
                                src={store.bannerPic}
                                alt="Banner"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    )}

                    <div style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <div style={{ marginTop: store.bannerPic ? '-60px' : '0', position: 'relative' }}>
                            {store.profilePic ? (
                                <Image
                                    src={store.profilePic}
                                    alt={store.name}
                                    width={100}
                                    height={100}
                                    style={{
                                        borderRadius: 'var(--radius-full)',
                                        objectFit: 'cover',
                                        border: '4px solid var(--bg-primary)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-tertiary)',
                                    border: '4px solid var(--bg-primary)'
                                }}>
                                    <StoreIcon size={40} />
                                </div>
                            )}
                        </div>

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                                <div>
                                    <h1 style={{ marginBottom: 'var(--space-2)', fontSize: '1.75rem' }}>{store.name}</h1>
                                    {store.bio && (
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>{store.bio}</p>
                                    )}
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                        <span className="badge badge-primary">
                                            {STORE_CATEGORIES[store.category as StoreCategory]?.label}
                                        </span>
                                        <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <PackageIcon size={14} /> {products.length} สินค้า
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className={`btn ${isStoreFavorite(store.sellerId) ? 'btn-secondary' : 'btn-outline'}`}
                                    onClick={() => toggleStoreFavorite(store.sellerId)}
                                    style={{ gap: 'var(--space-2)' }}
                                >
                                    <HeartIcon size={20} filled={isStoreFavorite(store.sellerId)} />
                                    <span>{isStoreFavorite(store.sellerId) ? 'ติดตามแล้ว' : 'ติดตามร้าน'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Products */}
                <section>
                    <h2 style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ color: 'var(--color-primary)', display: 'flex' }}><PackageIcon size={24} /></span>
                        สินค้าในร้าน
                    </h2>
                    <ProductGrid products={products} storeNames={storeNames} />
                </section>
            </main>
        </>
    );
}
