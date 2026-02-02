'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { ProductGrid } from '@/components/products/ProductCard';
import { getAllProducts, getAllStores, Product, StoreProfile } from '@/lib/firebase';
import { STORE_CATEGORIES, StoreCategory } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import {
    StoreIcon, PackageIcon, ChevronLeftIcon,
    UtensilsIcon, RecycleIcon, PaletteIcon,
    SmartphoneIcon, BookIcon, ShirtIcon, GiftIcon
} from '@/components/ui/Icons';

export default function CategoriesPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<StoreProfile[]>([]);
    const [storeNames, setStoreNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [productsData, storesData] = await Promise.all([
            getAllProducts(),
            getAllStores()
        ]);

        setProducts(productsData);
        setStores(storesData);

        const names: Record<string, string> = {};
        storesData.forEach(store => {
            names[store.sellerId] = store.name;
        });
        setStoreNames(names);

        setLoading(false);
    };

    // Count products per category
    const categoryCounts: Record<string, number> = {};
    products.forEach(product => {
        const cat = product.category || 'other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Filter products by selected category
    const filteredProducts = selectedCategory
        ? products.filter(p => p.category === selectedCategory)
        : [];

    // Filter stores by selected category
    const filteredStores = selectedCategory
        ? stores.filter(s => s.category === selectedCategory)
        : [];

    const getCategoryIcon = (category: string, size: number = 24) => {
        switch (category) {
            case 'food': return <UtensilsIcon size={size} />;
            case 'secondhand': return <RecycleIcon size={size} />;
            case 'homemade': return <PaletteIcon size={size} />;
            case 'gadgets': return <SmartphoneIcon size={size} />;
            case 'books': return <BookIcon size={size} />;
            case 'clothing': return <ShirtIcon size={size} />;
            case 'other': return <GiftIcon size={size} />;
            default: return <StoreIcon size={size} />;
        }
    };

    return (
        <>
            <Header />
            <MobileNav />

            <main className="page-container">
                <h1 style={{ marginBottom: 'var(--space-8)' }}>หมวดหมู่สินค้า</h1>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : (
                    <>
                        {/* Category Grid */}
                        {!selectedCategory && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: 'var(--space-4)',
                                marginBottom: 'var(--space-8)'
                            }}>
                                {Object.entries(STORE_CATEGORIES).map(([key, { label }]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCategory(key)}
                                        className="card"
                                        style={{
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            border: '1px solid var(--border-light)',
                                            padding: 'var(--space-8) var(--space-4)',
                                            background: 'var(--bg-primary)',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = 'var(--border-light)';
                                        }}
                                    >
                                        <div style={{ marginBottom: 'var(--space-2)', color: 'var(--text-primary)', display: 'flex', justifyContent: 'center' }}>
                                            {getCategoryIcon(key, 40)}
                                        </div>
                                        <div style={{ fontWeight: '600', marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>{label}</div>
                                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                            {categoryCounts[key] || 0} สินค้า
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Selected Category View */}
                        {selectedCategory && (
                            <>
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        marginBottom: 'var(--space-6)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-2)',
                                        fontWeight: '500'
                                    }}
                                >
                                    <span style={{ display: 'flex' }}><ChevronLeftIcon size={20} /></span>
                                    <span>กลับไปหมวดหมู่ทั้งหมด</span>
                                </button>

                                <div className="card" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-6)',
                                    marginBottom: 'var(--space-8)',
                                    padding: 'var(--space-6)'
                                }}>
                                    <span style={{ color: 'var(--color-primary)', display: 'flex' }}>
                                        {getCategoryIcon(selectedCategory, 48)}
                                    </span>
                                    <div>
                                        <h2 style={{ marginBottom: 'var(--space-1)' }}>{STORE_CATEGORIES[selectedCategory as StoreCategory].label}</h2>
                                        <p style={{ color: 'var(--text-secondary)' }}>
                                            {filteredProducts.length} สินค้า • {filteredStores.length} ร้านค้า
                                        </p>
                                    </div>
                                </div>

                                {/* Stores in Category */}
                                {filteredStores.length > 0 && (
                                    <section style={{ marginBottom: 'var(--space-12)' }}>
                                        <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <span style={{ color: 'var(--color-primary)', display: 'flex' }}><StoreIcon size={24} /></span>
                                            ร้านค้าในหมวดหมู่นี้
                                        </h3>
                                        <div style={{
                                            display: 'flex',
                                            gap: 'var(--space-4)',
                                            overflowX: 'auto',
                                            paddingBottom: 'var(--space-4)',
                                            paddingLeft: '1px' // fix shadow clip
                                        }}>
                                            {filteredStores.map((store) => (
                                                <Link
                                                    key={store.sellerId}
                                                    href={`/store/${store.sellerId}`}
                                                    className="card"
                                                    style={{
                                                        minWidth: '160px',
                                                        textAlign: 'center',
                                                        textDecoration: 'none',
                                                        padding: 'var(--space-4)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: 'var(--space-2)'
                                                    }}
                                                >
                                                    {store.profilePic ? (
                                                        <Image
                                                            src={store.profilePic}
                                                            alt={store.name}
                                                            width={60}
                                                            height={60}
                                                            style={{
                                                                borderRadius: 'var(--radius-full)',
                                                                objectFit: 'cover',
                                                                border: '2px solid var(--border-light)'
                                                            }}
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
                                                            color: 'var(--text-tertiary)',
                                                            border: '2px solid var(--border-light)'
                                                        }}>
                                                            <StoreIcon size={24} />
                                                        </div>
                                                    )}
                                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.925rem' }}>{store.name}</div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Products in Category */}
                                <section>
                                    <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <span style={{ color: 'var(--color-primary)', display: 'flex' }}><PackageIcon size={24} /></span>
                                        สินค้าในหมวดหมู่นี้
                                    </h3>
                                    {filteredProducts.length === 0 ? (
                                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                                            <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'center' }}>
                                                <PackageIcon size={48} />
                                            </div>
                                            <h4>ยังไม่มีสินค้าในหมวดหมู่นี้</h4>
                                        </div>
                                    ) : (
                                        <ProductGrid products={filteredProducts} storeNames={storeNames} />
                                    )}
                                </section>
                            </>
                        )}
                    </>
                )}
            </main>
        </>
    );
}
