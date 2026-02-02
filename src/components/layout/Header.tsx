'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { HomeIcon, HeartIcon, ChartIcon, StoreIcon } from '@/components/ui/Icons';

export default function Header() {
    const { user, store } = useAuth();

    return (
        <header className="nav-header">
            <div className="nav-header-inner">
                <Link href="/" className="nav-logo">
                    <Image
                        src="/logo.png"
                        alt="SKT Marketplace"
                        width={32}
                        height={32}
                        priority
                    />
                    <span className="nav-logo-text">SKT Marketplace</span>
                </Link>

                <nav className="nav-links">
                    <ThemeToggle />
                    <Link href="/" className="nav-link" title="หน้าหลัก">
                        <HomeIcon size={20} />
                    </Link>
                    <Link href="/favorites" className="nav-link" title="รายการโปรด">
                        <HeartIcon size={20} />
                    </Link>
                    {user && store ? (
                        <Link href="/seller/dashboard" className="btn btn-primary btn-sm">
                            <ChartIcon size={18} />
                            <span>แดชบอร์ด</span>
                        </Link>
                    ) : (
                        <Link href="/seller/login" className="btn btn-outline btn-sm">
                            <StoreIcon size={18} />
                            <span>เป็นผู้ขาย</span>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
