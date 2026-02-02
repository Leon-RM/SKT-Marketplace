'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useFavorites } from '@/hooks/useFavorites';
import { Product } from '@/types';
import { PRODUCT_TYPES, STORE_CATEGORIES } from '@/types';
import { HeartIcon, ShoppingBagIcon, PackageIcon, StoreIcon, ClockIcon, CheckIcon, XIcon, AlertIcon } from '@/components/ui/Icons';

interface ProductCardProps {
    product: Product;
    storeName?: string;
}

export function ProductCard({ product, storeName }: ProductCardProps) {
    const { isProductFavorite, toggleProductFavorite } = useFavorites();
    const isFavorite = isProductFavorite(product.id || '');

    const productType = PRODUCT_TYPES[product.type];
    const isPreorderActive = product.type === 'preorder' && product.preorderEnabled;
    const isAvailable = product.type === 'preorder' ? isPreorderActive : product.inStock;

    return (
        <article className="product-card">
            <Link href={`/product/${product.id}`} style={{ display: 'block', position: 'relative' }}>
                <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                    {product.images[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="product-card-image"
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <div
                            className="product-card-image"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-tertiary)'
                            }}
                        >
                            <PackageIcon size={48} />
                        </div>
                    )}

                    {/* Stock/Preorder Badge */}
                    <div style={{
                        position: 'absolute',
                        top: 'var(--space-2)',
                        left: 'var(--space-2)',
                        zIndex: 2,
                        filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.9))'
                    }}>
                        <div style={{
                            backdropFilter: 'blur(8px)',
                            background: 'rgba(0, 0, 0, 0.65)',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex'
                        }}>
                            {product.type === 'preorder' ? (
                                <span className={`badge ${isPreorderActive ? 'badge-success' : 'badge-warning'}`} style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)' }}>
                                    <ClockIcon size={12} />
                                    <span>{isPreorderActive ? 'เปิดรับออเดอร์' : 'ยังไม่เปิดรับ'}</span>
                                </span>
                            ) : (
                                <span className={`badge ${product.inStock ? 'badge-success' : 'badge-gray'}`} style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)' }}>
                                    {product.inStock ? <CheckIcon size={12} /> : <XIcon size={12} />}
                                    <span>{product.inStock ? 'มีสินค้า' : 'สินค้าหมด'}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            <div className="product-card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/product/${product.id}`}>
                            <h3 className="product-card-title">{product.name}</h3>
                        </Link>
                        {storeName && (
                            <Link href={`/store/${product.sellerId}`} className="product-card-store" style={{ marginTop: 'var(--space-1)', display: 'inline-flex' }}>
                                <StoreIcon size={12} />
                                <span>{storeName}</span>
                            </Link>
                        )}
                    </div>
                    <button
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            toggleProductFavorite(product.id || '');
                        }}
                        aria-label={isFavorite ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                    >
                        <HeartIcon size={20} filled={isFavorite} />
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span className="product-card-badge">
                        {productType.label}
                    </span>
                    {product.category && STORE_CATEGORIES[product.category as keyof typeof STORE_CATEGORIES] && (
                        <span className="product-card-badge">
                            {STORE_CATEGORIES[product.category as keyof typeof STORE_CATEGORIES].label}
                        </span>
                    )}
                </div>

                <Link
                    href={isAvailable ? product.buyLink : '#'}
                    target={isAvailable ? '_blank' : undefined}
                    className={`btn ${isAvailable ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                        width: '100%',
                        marginTop: 'var(--space-3)',
                        padding: 'var(--space-2) var(--space-4)',
                        opacity: isAvailable ? 1 : 0.6,
                        pointerEvents: isAvailable ? 'auto' : 'none',
                        fontSize: '0.875rem'
                    }}
                    onClick={(e) => {
                        if (!isAvailable) e.preventDefault();
                    }}
                >
                    {isAvailable ? (
                        <>
                            <ShoppingBagIcon size={16} />
                            <span>สั่งซื้อ</span>
                        </>
                    ) : (
                        <>
                            <ClockIcon size={16} />
                            <span>รอก่อน</span>
                        </>
                    )}
                </Link>
            </div>
        </article>
    );
}

interface ProductGridProps {
    products: Product[];
    storeNames?: Record<string, string>;
}

export function ProductGrid({ products, storeNames = {} }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'center' }}>
                    <PackageIcon size={64} />
                </div>
                <h3>ยังไม่มีสินค้า</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                    สินค้าจะปรากฏที่นี่เมื่อมีผู้ขายเพิ่มสินค้า
                </p>
            </div>
        );
    }

    return (
        <div className="product-grid">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    storeName={storeNames[product.sellerId]}
                />
            ))}
        </div>
    );
}
