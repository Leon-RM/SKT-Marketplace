'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { getProductById, getStoreProfile, getProductReviews, createReview, Product, StoreProfile, Review } from '@/lib/firebase';
import { useFavorites } from '@/hooks/useFavorites';
import { PRODUCT_TYPES, STORE_CATEGORIES, StoreCategory } from '@/types';
import ImageCropper from '@/components/ui/ImageCropper';
import {
    HeartIcon,
    ClockIcon,
    ShoppingBagIcon,
    StoreIcon,
    StarIcon,
    MessageCircleIcon,
    FrownIcon,
    CameraIcon,
    EditIcon,
    AlertIcon,
    CheckIcon,
    XIcon
} from '@/components/ui/Icons';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [store, setStore] = useState<StoreProfile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    // Review form
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [reviewAuthor, setReviewAuthor] = useState('');
    const [reviewImages, setReviewImages] = useState<string[]>([]);
    const [showImageCropper, setShowImageCropper] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);

    const { isProductFavorite, toggleProductFavorite, isStoreFavorite, toggleStoreFavorite } = useFavorites();

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);

        if (productData) {
            const [storeData, reviewsData] = await Promise.all([
                getStoreProfile(productData.sellerId),
                getProductReviews(id)
            ]);
            setStore(storeData);
            setReviews(reviewsData);
        }

        setLoading(false);
    };

    const handleSubmitReview = async () => {
        if (!product) return;
        setSubmittingReview(true);

        await createReview({
            productId: product.id!,
            rating: reviewRating,
            text: reviewText.trim(),
            authorName: reviewAuthor.trim() || 'ไม่ระบุชื่อ',
            images: reviewImages
        });

        // Reset form
        setReviewRating(5);
        setReviewText('');
        setReviewAuthor('');
        setReviewImages([]);
        setShowReviewForm(false);

        // Reload reviews
        const newReviews = await getProductReviews(id);
        setReviews(newReviews);
        setSubmittingReview(false);
    };

    const isAvailable = product?.type === 'preorder' ? product.preorderEnabled : product?.inStock;
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    if (loading) {
        return (
            <>
                <Header />
                <MobileNav />
                <main className="page-container">
                    <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                </main>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Header />
                <MobileNav />
                <main className="page-container">
                    <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                        <div style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'center' }}>
                            <FrownIcon size={64} />
                        </div>
                        <h2>ไม่พบสินค้า</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>
                            สินค้านี้อาจถูกลบหรือไม่มีอยู่
                        </p>
                        <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                            กลับหน้าหลัก
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    const productType = PRODUCT_TYPES[product.type];

    return (
        <>
            <Header />
            <MobileNav />

            <main className="page-container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xl)' }}>
                    {/* Back Link */}
                    <Link href="/" style={{ color: 'var(--text-secondary)' }}>
                        ← กลับหน้าหลัก
                    </Link>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)' }}>
                        {/* Product Images */}
                        <div>
                            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 'var(--space-md)' }}>
                                <Image
                                    src={product.images[activeImage] || '/logo.png'}
                                    alt={product.name}
                                    width={600}
                                    height={600}
                                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                                />
                            </div>

                            {product.images.length > 1 && (
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', overflowX: 'auto' }}>
                                    {product.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(index)}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: 'var(--radius-sm)',
                                                overflow: 'hidden',
                                                border: activeImage === index ? '2px solid var(--color-teal)' : '2px solid transparent',
                                                cursor: 'pointer',
                                                padding: 0,
                                                background: 'none'
                                            }}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${product.name} ${index + 1}`}
                                                width={60}
                                                height={60}
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div>
                            <div className="glass-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>{product.name}</h1>
                                    <button
                                        className={`favorite-btn ${isProductFavorite(product.id!) ? 'active' : ''}`}
                                        onClick={() => toggleProductFavorite(product.id!)}
                                        style={{ padding: 'var(--space-2)' }}
                                    >
                                        <HeartIcon size={28} filled={isProductFavorite(product.id!)} />
                                    </button>
                                </div>

                                {/* Badges */}
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
                                    <span className="badge badge-teal">
                                        {productType.label}
                                    </span>
                                    {product.category && STORE_CATEGORIES[product.category as StoreCategory] && (
                                        <span className="badge badge-pink">
                                            {STORE_CATEGORIES[product.category as StoreCategory].label}
                                        </span>
                                    )}
                                    <span className={`badge ${isAvailable ? 'badge-success' : 'badge-warning'}`}>
                                        <ClockIcon size={12} />
                                        <span>
                                            {product.type === 'preorder'
                                                ? (isAvailable ? 'เปิดรับออเดอร์' : 'ยังไม่เปิดรับ')
                                                : (isAvailable ? 'มีสินค้า' : 'สินค้าหมด')
                                            }
                                        </span>
                                    </span>
                                </div>

                                {/* Rating */}
                                {averageRating && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-6)' }}>
                                        <StarIcon size={18} filled className="text-warning" style={{ color: '#FFD700' }} />
                                        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{averageRating}</span>
                                        <span style={{ color: 'var(--text-tertiary)' }}>• {reviews.length} รีวิว</span>
                                    </div>
                                )}

                                {/* Separator */}
                                <div style={{ height: '1px', background: 'var(--border-light)', marginBottom: 'var(--space-6)' }}></div>

                                {/* Description */}
                                {product.description && (
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', lineHeight: 1.8 }}>
                                        {product.description}
                                    </p>
                                )}

                                {/* Buy Button */}
                                <Link
                                    href={isAvailable ? product.buyLink : '#'}
                                    target={isAvailable ? '_blank' : undefined}
                                    className={`btn ${isAvailable ? 'btn-primary' : 'btn-outline'}`}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: 'var(--space-2)',
                                        opacity: isAvailable ? 1 : 0.6,
                                        pointerEvents: isAvailable ? 'auto' : 'none',
                                        padding: 'var(--space-3)'
                                    }}
                                    onClick={(e) => {
                                        if (!isAvailable) e.preventDefault();
                                    }}
                                >
                                    {isAvailable ? (
                                        <>
                                            <ShoppingBagIcon size={20} />
                                            <span>สั่งซื้อเลย</span>
                                        </>
                                    ) : (
                                        <>
                                            <ClockIcon size={20} />
                                            <span>ยังไม่พร้อมขาย</span>
                                        </>
                                    )}
                                </Link>
                            </div>

                            {/* Store Info */}
                            {store && (
                                <Link href={`/store/${store.sellerId}`} className="glass-card" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-md)',
                                    marginTop: 'var(--space-md)',
                                    textDecoration: 'none'
                                }}>
                                    {store.profilePic ? (
                                        <Image
                                            src={store.profilePic}
                                            alt={store.name}
                                            width={50}
                                            height={50}
                                            style={{ borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
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
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ color: 'var(--text-primary)' }}>{store.name}</h4>
                                        <span className="badge badge-teal" style={{ marginTop: 'var(--space-xs)' }}>
                                            {STORE_CATEGORIES[store.category as StoreCategory]?.emoji} {STORE_CATEGORIES[store.category as StoreCategory]?.label}
                                        </span>
                                    </div>
                                    <button
                                        className={`favorite-btn ${isStoreFavorite(store.sellerId) ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleStoreFavorite(store.sellerId);
                                        }}
                                        style={{ padding: 'var(--space-2)' }}
                                    >
                                        <HeartIcon size={20} filled={isStoreFavorite(store.sellerId)} />
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <StarIcon size={24} filled style={{ color: '#FFD700' }} />
                                รีวิวจากลูกค้า ({reviews.length})
                            </h2>
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                            >
                                <EditIcon size={18} />
                                <span>เขียนรีวิว</span>
                            </button>
                        </div>

                        {/* Review Form */}
                        {showReviewForm && (
                            <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
                                <h3 style={{ marginBottom: 'var(--space-md)' }}>เขียนรีวิว</h3>

                                {/* Rating */}
                                <div style={{ marginBottom: 'var(--space-md)' }}>
                                    <label className="input-label">ให้คะแนน</label>
                                    <div className="star-rating" style={{ marginTop: 'var(--space-sm)' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`star ${star <= reviewRating ? 'active' : ''}`}
                                                onClick={() => setReviewRating(star)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <StarIcon size={32} filled={star <= reviewRating} />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Author */}
                                <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
                                    <label className="input-label">ชื่อของคุณ (ไม่บังคับ)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="ถ้าไม่ใส่จะแสดงเป็น 'ไม่ระบุชื่อ'"
                                        value={reviewAuthor}
                                        onChange={(e) => setReviewAuthor(e.target.value)}
                                    />
                                </div>

                                {/* Review Text */}
                                <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
                                    <label className="input-label">รีวิวของคุณ</label>
                                    <textarea
                                        className="input"
                                        placeholder="เขียนรีวิวที่นี่..."
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                    />
                                </div>

                                {/* Review Images */}
                                <div style={{ marginBottom: 'var(--space-md)' }}>
                                    <label className="input-label" style={{ marginBottom: 'var(--space-sm)', display: 'block' }}>
                                        รูปภาพ (ไม่บังคับ)
                                    </label>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                        {reviewImages.map((img, index) => (
                                            <div key={index} style={{ position: 'relative' }}>
                                                <Image
                                                    src={img}
                                                    alt={`Review ${index + 1}`}
                                                    width={60}
                                                    height={60}
                                                    style={{ borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== index))}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-6px',
                                                        right: '-6px',
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        background: '#EF4444',
                                                        border: 'none',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '10px'
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        {reviewImages.length < 3 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowImageCropper(true)}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: 'var(--bg-glass)',
                                                    border: '1px dashed var(--glass-border)',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-muted)'
                                                }}
                                            >
                                                <CameraIcon size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                    <button
                                        className="btn btn-glass"
                                        onClick={() => setShowReviewForm(false)}
                                        style={{ flex: 1 }}
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview || !reviewText.trim()}
                                        style={{ flex: 1 }}
                                    >
                                        {submittingReview ? 'กำลังส่ง...' : 'ส่งรีวิว'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Reviews List */}
                        {reviews.length === 0 ? (
                            <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                                <div style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'center' }}>
                                    <MessageCircleIcon size={48} />
                                </div>
                                <h3>ยังไม่มีรีวิว</h3>
                                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-sm)' }}>
                                    เป็นคนแรกที่เขียนรีวิวสินค้านี้
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {reviews.map((review) => (
                                    <div key={review.id} className="glass-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{review.authorName}</div>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <StarIcon key={star} size={14} filled={star <= review.rating} style={{ color: star <= review.rating ? '#FFD700' : 'var(--border-medium)' }} />
                                                ))}
                                            </div>
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                                            {review.text}
                                        </p>
                                        {review.images.length > 0 && (
                                            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                                                {review.images.map((img, index) => (
                                                    <Image
                                                        key={index}
                                                        src={img}
                                                        alt={`Review image ${index + 1}`}
                                                        width={80}
                                                        height={80}
                                                        style={{ borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {showImageCropper && (
                <ImageCropper
                    aspectRatio={1}
                    recommendedSize="800x800 พิกเซล"
                    onImageUploaded={(url) => {
                        setReviewImages([...reviewImages, url]);
                        setShowImageCropper(false);
                    }}
                    onClose={() => setShowImageCropper(false)}
                />
            )}
        </>
    );
}
