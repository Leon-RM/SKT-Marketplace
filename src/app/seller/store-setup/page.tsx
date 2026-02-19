'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { createOrUpdateStore } from '@/lib/firebase';
import { StepGuide, FeatureHint } from '@/components/ui/Helpers';
import ImageCropper from '@/components/ui/ImageCropper';
import { STORE_CATEGORIES, StoreCategory } from '@/types';
import { StoreIcon, CameraIcon, ImageIcon, CheckIcon, AlertIcon } from '@/components/ui/Icons';

export default function StoreSetupPage() {
    const router = useRouter();
    const { user, seller, store, loading, needsStoreSetup, refreshUserData } = useAuth();
    const [storeName, setStoreName] = useState('');
    const [bio, setBio] = useState('');
    const [category, setCategory] = useState<StoreCategory>('other');
    const [profilePic, setProfilePic] = useState('');
    const [bannerPic, setBannerPic] = useState('');
    const [showProfileCropper, setShowProfileCropper] = useState(false);
    const [showBannerCropper, setShowBannerCropper] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/seller/login');
        }
        if (!loading && user && !seller) {
            router.push('/seller/setup');
        }
        // Pre-fill if editing existing store
        if (store) {
            setStoreName(store.name);
            setBio(store.bio);
            setCategory(store.category as StoreCategory);
            setProfilePic(store.profilePic);
            setBannerPic(store.bannerPic || '');
        }
    }, [loading, user, seller, store, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!storeName.trim()) {
            setError('กรุณากรอกชื่อร้านค้า');
            return;
        }

        if (!profilePic) {
            setError('กรุณาอัปโหลดรูปโปรไฟล์ร้าน');
            return;
        }

        if (!user) return;

        setSubmitting(true);

        const result = await createOrUpdateStore(
            user.uid,
            storeName.trim(),
            bio.trim(),
            profilePic,
            bannerPic,
            category
        );

        if (result.success) {
            await refreshUserData();
            router.push('/seller/dashboard');
        } else {
            setError(result.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        }

        setSubmitting(false);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-6)',
            background: 'var(--bg-secondary)'
        }}>
            <div className="card-elevated" style={{ maxWidth: '550px', width: '100%', padding: 'var(--space-8)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <Image
                        src="/logo.png"
                        alt="SKT Marketplace"
                        width={60}
                        height={60}
                        style={{ margin: '0 auto var(--space-4)' }}
                    />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        {store ? 'แก้ไขร้านค้า' : 'ตั้งค่าร้านค้า'}
                    </h1>
                </div>

                {!store && (
                    <StepGuide
                        currentStep={1}
                        steps={[
                            { title: 'ข้อมูลส่วนตัว', description: 'กรอกชื่อและรหัสนักเรียนของคุณ' },
                            { title: 'ตั้งค่าร้านค้า', description: 'ตั้งชื่อร้านและอัปโหลดรูปโปรไฟล์' },
                            { title: 'เสร็จสิ้น', description: 'พร้อมเริ่มขายสินค้า' }
                        ]}
                    />
                )}

                <FeatureHint
                    icon={<StoreIcon size={20} />}
                    title="ข้อมูลร้านค้า"
                    text="ข้อมูลเหล่านี้จะแสดงต่อสาธารณะ เลือกรูปและชื่อที่น่าสนใจ"
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
                        <AlertIcon size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Profile Picture */}
                    <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
                        <label className="input-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
                            รูปโปรไฟล์ร้าน *
                        </label>
                        <div
                            onClick={() => setShowProfileCropper(true)}
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--bg-secondary)',
                                border: '1px dashed var(--border-medium)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                transition: 'all var(--transition-base)',
                                position: 'relative'
                            }}
                            className="hover:border-primary"
                        >
                            {profilePic ? (
                                <Image
                                    src={profilePic}
                                    alt="Profile"
                                    width={120}
                                    height={120}
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                    <CameraIcon size={32} />
                                    <span style={{ fontSize: '0.75rem' }}>คลิกเพื่อเลือก</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Banner Picture (Optional) */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <label className="input-label" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
                            รูปแบนเนอร์ (ไม่บังคับ)
                        </label>
                        <div
                            onClick={() => setShowBannerCropper(true)}
                            style={{
                                width: '100%',
                                height: '100px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-secondary)',
                                border: '1px dashed var(--border-medium)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                transition: 'all var(--transition-base)'
                            }}
                            className="hover:border-primary"
                        >
                            {bannerPic ? (
                                <Image
                                    src={bannerPic}
                                    alt="Banner"
                                    width={500}
                                    height={100}
                                    style={{ objectFit: 'cover', width: '100%' }}
                                />
                            ) : (
                                <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <ImageIcon size={20} />
                                    <span>คลิกเพื่อเลือกรูปแบนเนอร์</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Store Name */}
                    <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
                        <label className="input-label">ชื่อร้านค้า *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="เช่น ร้านขนมพี่เอ็ม"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            maxLength={50}
                            required
                        />
                    </div>

                    {/* Bio */}
                    <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
                        <label className="input-label">แนะนำร้าน (ไม่บังคับ)</label>
                        <textarea
                            className="input"
                            placeholder="เช่น ขายขนมทำเอง สดใหม่ทุกวัน"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={200}
                            style={{ minHeight: '80px', resize: 'vertical' }}
                        />
                        <small style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                            {bio.length}/200 ตัวอักษร
                        </small>
                    </div>

                    {/* Category */}
                    <div className="input-group" style={{ marginBottom: 'var(--space-8)' }}>
                        <label className="input-label">หมวดหมู่ร้าน</label>
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

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{ width: '100%', gap: 'var(--space-2)', justifyContent: 'center' }}
                    >
                        {submitting ? (
                            <>
                                <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                                <span>กำลังบันทึก...</span>
                            </>
                        ) : (
                            store ? (
                                <>
                                    <CheckIcon size={20} />
                                    <span>บันทึกการเปลี่ยนแปลง</span>
                                </>
                            ) : (
                                <>
                                    <CheckIcon size={20} />
                                    <span>เสร็จสิ้น เริ่มขายเลย!</span>
                                </>
                            )
                        )}
                    </button>
                </form>
            </div>

            {/* Image Croppers */}
            {showProfileCropper && (
                <ImageCropper
                    aspectRatio={1}
                    recommendedSize="800x800 px (HD)"
                    label="รูปโปรไฟล์ร้าน"
                    onImageUploaded={(url) => setProfilePic(url)}
                    onClose={() => setShowProfileCropper(false)}
                />
            )}

            {showBannerCropper && (
                <ImageCropper
                    aspectRatio={3 / 1}
                    recommendedSize="1800x600 px (HD Wide)"
                    label="รูปแบนเนอร์ร้าน"
                    onImageUploaded={(url) => setBannerPic(url)}
                    onClose={() => setShowBannerCropper(false)}
                />
            )}
        </main>
    );
}
