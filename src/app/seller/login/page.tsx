'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { signInWithGoogle } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { FeatureHint } from '@/components/ui/Helpers';
import { InfoIcon, ChevronLeftIcon, AlertIcon } from '@/components/ui/Icons';

export default function SellerLoginPage() {
    const router = useRouter();
    const { user, loading, isNewUser, needsStoreSetup } = useAuth();
    const [error, setError] = useState('');
    const [signingIn, setSigningIn] = useState(false);

    // Redirect if already logged in - Move to useEffect to avoid render-phase state updates
    useEffect(() => {
        if (!loading && user) {
            if (isNewUser) {
                router.push('/seller/setup');
            } else if (needsStoreSetup) {
                router.push('/seller/store-setup');
            } else {
                router.push('/seller/dashboard');
            }
        }
    }, [loading, user, isNewUser, needsStoreSetup, router]);

    if (loading || user) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const handleGoogleSignIn = async () => {
        setError('');
        setSigningIn(true);

        const result = await signInWithGoogle();

        if (result.success) {
            if (result.isNewUser) {
                router.push('/seller/setup');
            } else {
                router.push('/seller/dashboard');
            }
        } else {
            setError(result.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        }

        setSigningIn(false);
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
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
            <div className="card-elevated" style={{
                maxWidth: '450px',
                width: '100%',
                textAlign: 'center',
                padding: 'var(--space-8)'
            }}>
                <Link href="/">
                    <Image
                        src="/logo.png"
                        alt="SKT Marketplace"
                        width={80}
                        height={80}
                        style={{ margin: '0 auto var(--space-6)' }}
                    />
                </Link>

                <h1 style={{
                    fontSize: '1.75rem',
                    marginBottom: 'var(--space-2)',
                    fontWeight: '700'
                }}>
                    เข้าสู่ระบบผู้ขาย
                </h1>

                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
                    เข้าสู่ระบบเพื่อจัดการร้านค้าของคุณ
                </p>

                <FeatureHint
                    icon={<InfoIcon size={20} />}
                    title="สำหรับนักเรียน สกธ. เท่านั้น"
                    text="ใช้อีเมลโรงเรียน (@sk-thonburi.ac.th) ในการลงชื่อเข้าใช้"
                />

                {error && (
                    <div style={{
                        padding: 'var(--space-4)',
                        background: '#FFF5F5',
                        border: '2px solid #FEB2B2',
                        borderRadius: 'var(--radius-md)',
                        color: '#C53030',
                        marginBottom: 'var(--space-6)',
                        textAlign: 'left',
                        display: 'flex',
                        gap: 'var(--space-2)',
                        alignItems: 'center',
                        fontWeight: '600',
                        animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both'
                    }}>
                        <AlertIcon size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    onClick={handleGoogleSignIn}
                    disabled={signingIn}
                    className="btn"
                    style={{
                        width: '100%',
                        background: 'white',
                        color: '#333',
                        border: '1px solid var(--border-medium)',
                        padding: 'var(--space-3) var(--space-6)',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-3)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.2s ease',
                        fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                >
                    {signingIn ? (
                        <>
                            <span className="loading-spinner" style={{ width: '20px', height: '20px', border: '2px solid #ddd', borderTopColor: '#333' }}></span>
                            <span>กำลังเข้าสู่ระบบ...</span>
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                            </svg>
                            ลงชื่อเข้าใช้ด้วย Google
                        </>
                    )}
                </button>

                <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-light)' }}>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        ยังไม่ได้เป็นผู้ขาย? เมื่อลงชื่อเข้าใช้ครั้งแรก<br />
                        ระบบจะพาไปตั้งค่าร้านค้าของคุณโดยอัตโนมัติ
                    </p>
                </div>

                <Link
                    href="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)',
                        marginTop: 'var(--space-6)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}
                >
                    <ChevronLeftIcon size={16} />
                    <span>กลับหน้าหลัก</span>
                </Link>
            </div>
        </main>
    );
}
