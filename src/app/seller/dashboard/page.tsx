'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getSellerProducts, deleteProduct, updateProduct, logOut, Product } from '@/lib/firebase';
import { FeatureHint } from '@/components/ui/Helpers';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { PRODUCT_TYPES, STORE_CATEGORIES, StoreCategory } from '@/types';
import { StoreIcon, PackageIcon, CheckIcon, ClockIcon, InfoIcon, EditIcon, LogOutIcon, PlusIcon, TrashIcon } from '@/components/ui/Icons';

export default function SellerDashboardPage() {
    const router = useRouter();
    const { user, seller, store, loading, refreshUserData } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/seller/login');
        }
        if (!loading && user && !seller) {
            router.push('/seller/setup');
        }
        if (!loading && user && seller && !store) {
            router.push('/seller/store-setup');
        }
    }, [loading, user, seller, store, router]);

    useEffect(() => {
        if (user) {
            loadProducts();
        }
    }, [user]);

    const loadProducts = async () => {
        if (!user) return;
        setLoadingProducts(true);
        const data = await getSellerProducts(user.uid);
        setProducts(data);
        setLoadingProducts(false);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm('ต้องการลบสินค้านี้หรือไม่?')) return;

        setDeletingId(productId);
        await deleteProduct(productId);
        await loadProducts();
        setDeletingId(null);
    };

    const handleToggleStock = async (product: Product) => {
        await updateProduct(product.id!, { inStock: !product.inStock });
        await loadProducts();
    };

    const handleTogglePreorder = async (product: Product) => {
        await updateProduct(product.id!, { preorderEnabled: !product.preorderEnabled });
        await loadProducts();
    };

    const handleLogout = async () => {
        await logOut();
        router.push('/');
    };

    if (loading || !store) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <MobileNav />

            <main className="page-container">
                {/* Store Header */}
                <section className="card" style={{ marginBottom: 'var(--space-8)', padding: 0, overflow: 'hidden' }}>
                    {store.bannerPic && (
                        <div style={{
                            height: '160px',
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
                                    <h1 style={{ marginBottom: 'var(--space-1)', fontSize: '1.5rem' }}>{store.name}</h1>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>{store.bio}</p>
                                    <span className="badge badge-primary">
                                        {STORE_CATEGORIES[store.category as StoreCategory]?.label}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <Link href="/seller/store-setup" className="btn btn-outline btn-sm">
                                        <EditIcon size={16} />
                                        <span>แก้ไขร้าน</span>
                                    </Link>
                                    <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ color: 'var(--text-tertiary)' }}>
                                        <LogOutIcon size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-8)'
                }}>
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                        <div style={{ marginBottom: 'var(--space-2)', color: 'var(--color-primary)', display: 'flex', justifyContent: 'center' }}>
                            <PackageIcon size={24} />
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{products.length}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>สินค้าทั้งหมด</div>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                        <div style={{ marginBottom: 'var(--space-2)', color: '#22C55E', display: 'flex', justifyContent: 'center' }}>
                            <CheckIcon size={24} />
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {products.filter(p => p.inStock || p.preorderEnabled).length}
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>พร้อมขาย</div>
                    </div>
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                        <div style={{ marginBottom: 'var(--space-2)', color: '#F59E0B', display: 'flex', justifyContent: 'center' }}>
                            <ClockIcon size={24} />
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {products.filter(p => p.type === 'preorder').length}
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>พรีออเดอร์</div>
                    </div>
                </section>

                {/* Add Product Button */}
                <section style={{ marginBottom: 'var(--space-8)' }}>
                    <Link href="/seller/products/new" className="btn btn-primary" style={{ width: '100%' }}>
                        <PlusIcon size={20} />
                        <span>เพิ่มสินค้าใหม่</span>
                    </Link>
                </section>

                {/* Feature Hint */}
                <FeatureHint
                    icon={<InfoIcon size={24} />}
                    title="จัดการสินค้า"
                    text="กดสวิตช์เพื่อเปิด-ปิดการขาย กดแก้ไขเพื่อเปลี่ยนรายละเอียด หรือกดลบเพื่อนำสินค้าออก"
                />

                {/* Products List */}
                <section>
                    <h2 style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ display: 'flex', color: 'var(--color-primary)' }}><PackageIcon size={24} /></span>
                        สินค้าของฉัน
                    </h2>

                    {loadingProducts ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                            <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'center' }}>
                                <PackageIcon size={48} />
                            </div>
                            <h3>ยังไม่มีสินค้า</h3>
                            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                                กดปุ่ม &quot;เพิ่มสินค้าใหม่&quot; เพื่อเริ่มขาย
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {products.map((product) => (
                                <div key={product.id} className="card" style={{
                                    display: 'flex',
                                    gap: 'var(--space-4)',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    padding: 'var(--space-4)'
                                }}>
                                    {product.images[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            width={80}
                                            height={80}
                                            style={{ borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--bg-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-tertiary)'
                                        }}>
                                            <PackageIcon size={32} />
                                        </div>
                                    )}

                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <h4 style={{ marginBottom: 'var(--space-1)' }}>{product.name}</h4>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                            <span className="badge badge-secondary">
                                                {PRODUCT_TYPES[product.type].label}
                                            </span>
                                            {product.type === 'preorder' ? (
                                                <span className={`badge ${product.preorderEnabled ? 'badge-success' : 'badge-warning'}`}>
                                                    {product.preorderEnabled ? 'เปิดรับออเดอร์' : 'ปิดรับออเดอร์'}
                                                </span>
                                            ) : (
                                                <span className={`badge ${product.inStock ? 'badge-success' : 'badge-warning'}`}>
                                                    {product.inStock ? 'มีสินค้า' : 'สินค้าหมด'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                                        {/* Toggle Switch */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {product.type === 'preorder' ? 'รับออเดอร์' : 'มีสินค้า'}
                                            </span>
                                            <div
                                                className={`toggle-switch ${product.type === 'preorder' ? (product.preorderEnabled ? 'active' : '') : (product.inStock ? 'active' : '')}`}
                                                onClick={() => product.type === 'preorder' ? handleTogglePreorder(product) : handleToggleStock(product)}
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                            <Link
                                                href={`/seller/products/${product.id}/edit`}
                                                className="btn btn-outline btn-icon"
                                                title="แก้ไข"
                                                style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <span style={{ display: 'flex' }}><EditIcon size={16} /></span>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id!)}
                                                className="btn btn-outline btn-icon"
                                                disabled={deletingId === product.id}
                                                title="ลบ"
                                                style={{ color: '#EF4444', borderColor: '#EF4444', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <span style={{ display: 'flex' }}>
                                                    {deletingId === product.id ? '...' : <TrashIcon size={16} />}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
