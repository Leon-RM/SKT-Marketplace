'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getProductById, updateProduct } from '@/lib/firebase';
import { FeatureHint, InfoTooltip } from '@/components/ui/Helpers';
import ImageCropper from '@/components/ui/ImageCropper';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { PRODUCT_TYPES, STORE_CATEGORIES, ProductType, StoreCategory } from '@/types';
import { InfoIcon, CameraIcon, CheckIcon, ChevronLeftIcon, ClockIcon, PackageIcon, XIcon, EditIcon } from '@/components/ui/Icons';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const { user, seller, store, loading } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<StoreCategory>('other');
    const [buyLink, setBuyLink] = useState('');
    const [productType, setProductType] = useState<ProductType>('secondhand');
    const [images, setImages] = useState<string[]>([]);
    const [showImageCropper, setShowImageCropper] = useState(false);
    const [inStock, setInStock] = useState(true);
    const [preorderEnabled, setPreorderEnabled] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/seller/login');
        }
        if (!loading && user && (!seller || !store)) {
            router.push('/seller/setup');
        }
    }, [loading, user, seller, store, router]);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;

            setFetching(true);
            const product = await getProductById(productId);

            if (!product) {
                setError('ไม่พบข้อมูลสินค้า');
                setFetching(false);
                return;
            }

            // Security check: only the owner can edit
            if (user && product.sellerId !== user.uid) {
                setError('คุณไม่มีสิทธิ์แก้ไขสินค้านี้');
                setFetching(false);
                return;
            }

            setName(product.name);
            setDescription(product.description);
            setCategory(product.category as StoreCategory);
            setBuyLink(product.buyLink);
            setProductType(product.type);
            setImages(product.images);
            setInStock(product.inStock);
            setPreorderEnabled(product.preorderEnabled ?? true);
            setFetching(false);
        };

        if (!loading && user) {
            fetchProduct();
        }
    }, [productId, loading, user]);

    const handleAddImage = (url: string) => {
        setImages([...images, url]);
        setShowImageCropper(false);
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('กรุณากรอกชื่อสินค้า');
            return;
        }

        if (images.length === 0) {
            setError('กรุณาเพิ่มรูปภาพสินค้าอย่างน้อย 1 รูป');
            return;
        }

        if (!buyLink.trim()) {
            setError('กรุณากรอกลิงก์สั่งซื้อ');
            return;
        }

        if (!user || !productId) return;

        setSubmitting(true);

        const result = await updateProduct(productId, {
            name: name.trim(),
            description: description.trim(),
            images,
            category,
            buyLink: buyLink.trim(),
            type: productType,
            inStock: productType !== 'preorder' ? inStock : true,
            preorderEnabled: productType === 'preorder' ? preorderEnabled : undefined
        });

        if (result.success) {
            router.push('/seller/dashboard');
        } else {
            setError(result.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        }

        setSubmitting(false);
    };

    if (loading || fetching) {
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
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <Link href="/seller/dashboard" style={{
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)'
                        }}>
                            <ChevronLeftIcon size={20} />
                            <span>กลับไปหน้าแดชบอร์ด</span>
                        </Link>
                    </div>

                    <h1 style={{ marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ color: 'var(--color-primary)', display: 'flex' }}><EditIcon size={32} /></span>
                        แก้ไขสินค้า
                    </h1>

                    <FeatureHint
                        icon={<InfoIcon size={20} />}
                        title="แก้ไขข้อมูล"
                        text="คุณสามารถแก้ไขรายละเอียดสินค้า รูปภาพ หรือสถานะการขายได้ตลอดเวลา"
                    />

                    {error && (
                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            color: '#EF4444',
                            marginBottom: 'var(--space-6)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)'
                        }}>
                            <InfoIcon size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!fetching && !error && (
                        <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-6)' }}>
                            {/* Product Images */}
                            <div style={{ marginBottom: 'var(--space-8)' }}>
                                <label className="input-label" style={{ marginBottom: 'var(--space-4)', display: 'block' }}>
                                    รูปภาพสินค้า *
                                    <InfoTooltip tip="เพิ่มได้หลายรูป รูปแรกจะเป็นรูปหลัก" />
                                </label>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                                    {images.map((img, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <Image
                                                src={img}
                                                alt={`Product ${index + 1}`}
                                                width={100}
                                                height={100}
                                                style={{ borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-8px',
                                                    right: '-8px',
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: '#EF4444',
                                                    border: '2px solid white',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: 0
                                                }}
                                            >
                                                <XIcon size={14} />
                                            </button>
                                            {index === 0 && (
                                                <span className="badge badge-primary" style={{
                                                    position: 'absolute',
                                                    bottom: '4px',
                                                    left: '4px',
                                                    fontSize: '0.65rem'
                                                }}>
                                                    รูปหลัก
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setShowImageCropper(true)}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--bg-secondary)',
                                            border: '1px dashed var(--border-medium)',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        className="hover:border-primary hover:text-primary"
                                    >
                                        <CameraIcon size={24} />
                                        <span style={{ fontSize: '0.75rem' }}>เพิ่มรูป</span>
                                    </button>
                                </div>
                            </div>

                            {/* Product Name */}
                            <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
                                <label className="input-label">ชื่อสินค้า *</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="เช่น ขนมปังโฮมเมด"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={100}
                                />
                            </div>

                            {/* Description */}
                            <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
                                <label className="input-label">รายละเอียดสินค้า</label>
                                <textarea
                                    className="input"
                                    placeholder="เช่น ขนมปังทำเอง สดใหม่ทุกวัน อร่อยมาก"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    maxLength={500}
                                    style={{ height: '100px', resize: 'vertical' }}
                                />
                            </div>

                            {/* Product Type */}
                            <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
                                <label className="input-label">
                                    ประเภทสินค้า
                                    <InfoTooltip tip="เลือกประเภทที่เหมาะกับสินค้าของคุณ" />
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
                                    {Object.entries(PRODUCT_TYPES).map(([key, { emoji, label, description }]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setProductType(key as ProductType)}
                                            className={`card`}
                                            style={{
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                padding: 'var(--space-4)',
                                                border: productType === key ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                                                background: productType === key ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 'var(--space-2)'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{label}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stock/Preorder Toggle */}
                            <div style={{
                                marginBottom: 'var(--space-6)',
                                padding: 'var(--space-4)',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-light)'
                            }}>
                                {productType === 'preorder' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                            <div style={{ padding: '8px', background: '#FEF3C7', borderRadius: '50%', color: '#D97706', height: 'fit-content' }}>
                                                <ClockIcon size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>เปิดรับพรีออเดอร์</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    เมื่อเปิด ลูกค้าจะสามารถกดลิงก์สั่งซื้อได้
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={`toggle-switch ${preorderEnabled ? 'active' : ''}`}
                                            onClick={() => setPreorderEnabled(!preorderEnabled)}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                            <div style={{ padding: '8px', background: '#DCFCE7', borderRadius: '50%', color: '#15803D', height: 'fit-content' }}>
                                                <PackageIcon size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>สถานะสินค้า</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {inStock ? 'มีสินค้าพร้อมขาย' : 'สินค้าหมด (ลูกค้าจะกดซื้อไม่ได้)'}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={`toggle-switch ${inStock ? 'active' : ''}`}
                                            onClick={() => setInStock(!inStock)}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Category */}
                            <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
                                <label className="input-label">หมวดหมู่</label>
                                <div className="select-wrapper">
                                    <select
                                        className="input"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as StoreCategory)}
                                    >
                                        {Object.entries(STORE_CATEGORIES).map(([key, { emoji, label }]) => (
                                            <option key={key} value={key}>{emoji} {label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Buy Link */}
                            <div className="input-group" style={{ marginBottom: 'var(--space-8)' }}>
                                <label className="input-label">
                                    ลิงก์สั่งซื้อ *
                                    <InfoTooltip tip="ใส่ลิงก์ Google Form, LINE, Instagram หรืออื่นๆ ที่ลูกค้าจะกดไปสั่งซื้อ" />
                                </label>
                                <input
                                    type="url"
                                    className="input"
                                    placeholder="เช่น https://line.me/ti/p/xxx หรือ https://forms.gle/xxx"
                                    value={buyLink}
                                    onChange={(e) => setBuyLink(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', color: 'var(--text-tertiary)', fontSize: '0.8rem', alignItems: 'center' }}>
                                    <InfoIcon size={14} />
                                    <span>ใส่ลิงก์ Google Form, LINE, Instagram หรือช่องทางอื่นที่ต้องการ</span>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                                style={{ width: '100%', gap: 'var(--space-2)', justifyContent: 'center' }}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon size={20} />
                                        <span>บันทึกการแก้ไข</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </main>

            {showImageCropper && (
                <ImageCropper
                    aspectRatio={1}
                    recommendedSize="1000x1000 px (HD Product Image)"
                    label="อัปโหลดรูปสินค้า"
                    onImageUploaded={handleAddImage}
                    onClose={() => setShowImageCropper(false)}
                />
            )}
        </>
    );
}
