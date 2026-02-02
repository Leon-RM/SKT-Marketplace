'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { createSellerProfile } from '@/lib/firebase';
import { StepGuide, FeatureHint, InfoTooltip } from '@/components/ui/Helpers';
import { LockIcon, ChevronRightIcon, AlertIcon, InfoIcon } from '@/components/ui/Icons';

export default function SellerSetupPage() {
    const router = useRouter();
    const { user, loading, isNewUser, refreshUserData } = useAuth();
    const [realName, setRealName] = useState('');
    const [nickname, setNickname] = useState('');
    const [studentId, setStudentId] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/seller/login');
        }
        if (!loading && user && !isNewUser) {
            router.push('/seller/store-setup');
        }
    }, [loading, user, isNewUser, router]);

    const validateStudentId = (id: string) => {
        // Must be exactly 5 digits
        return /^\d{5}$/.test(id);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!realName.trim()) {
            setError('กรุณากรอกชื่อ-นามสกุลจริง');
            return;
        }

        if (!nickname.trim()) {
            setError('กรุณากรอกชื่อเล่น');
            return;
        }

        if (!validateStudentId(studentId)) {
            setError('รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก');
            return;
        }

        if (!user) return;

        setSubmitting(true);

        const result = await createSellerProfile(
            user.uid,
            user.email || '',
            realName.trim(),
            nickname.trim(),
            studentId
        );

        if (result.success) {
            await refreshUserData();
            router.push('/seller/store-setup');
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
            <div className="card-elevated" style={{ maxWidth: '500px', width: '100%', padding: 'var(--space-8)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <Image
                        src="/logo.png"
                        alt="SKT Marketplace"
                        width={60}
                        height={60}
                        style={{ margin: '0 auto var(--space-4)' }}
                    />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>ตั้งค่าบัญชีผู้ขาย</h1>
                </div>

                <StepGuide
                    currentStep={0}
                    steps={[
                        { title: 'ข้อมูลส่วนตัว', description: 'กรอกชื่อและรหัสนักเรียนของคุณ' },
                        { title: 'ตั้งค่าร้านค้า', description: 'ตั้งชื่อร้านและอัปโหลดรูปโปรไฟล์' },
                        { title: 'เสร็จสิ้น', description: 'พร้อมเริ่มขายสินค้า' }
                    ]}
                />

                <FeatureHint
                    icon={<LockIcon size={20} />}
                    title="ข้อมูลส่วนตัว"
                    text="ข้อมูลนี้จะไม่แสดงต่อสาธารณะ ใช้สำหรับยืนยันตัวตนเท่านั้น"
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
                    <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
                        <label className="input-label">
                            ชื่อ-นามสกุลจริง
                            <InfoTooltip tip="ใช้ชื่อจริงตามบัตรนักเรียน" />
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="เช่น สมชาย ใจดี"
                            value={realName}
                            onChange={(e) => setRealName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
                        <label className="input-label">
                            ชื่อเล่น
                            <InfoTooltip tip="ชื่อที่เพื่อนๆ เรียก จะแสดงในร้านค้าของคุณ" />
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="เช่น เอ็ม"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: 'var(--space-8)' }}>
                        <label className="input-label">
                            รหัสนักเรียน (5 หลัก)
                            <InfoTooltip tip="รหัสนักเรียน 5 หลัก เช่น 06767" />
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="เช่น 06767"
                            value={studentId}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                                setStudentId(value);
                            }}
                            maxLength={5}
                            required
                        />
                        <small style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                            {studentId.length}/5 หลัก
                        </small>
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
                            <>
                                <span>ถัดไป</span>
                                <ChevronRightIcon size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}
