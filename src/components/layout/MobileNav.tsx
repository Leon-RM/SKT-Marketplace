'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { HomeIcon, GridIcon, HeartIcon, StoreIcon, ChartIcon } from '@/components/ui/Icons';

export default function MobileNav() {
    const pathname = usePathname();
    const { user, store } = useAuth();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    return (
        <nav className="nav-mobile">
            <div className="nav-mobile-inner">
                <Link
                    href="/"
                    className={`nav-mobile-item ${isActive('/') && !pathname.startsWith('/seller') && !pathname.startsWith('/favorites') ? 'active' : ''}`}
                >
                    <div className="nav-mobile-icon">
                        <HomeIcon size={20} />
                    </div>
                    <span className="nav-mobile-label">หน้าหลัก</span>
                </Link>

                <Link
                    href="/categories"
                    className={`nav-mobile-item ${isActive('/categories') ? 'active' : ''}`}
                >
                    <div className="nav-mobile-icon">
                        <GridIcon size={20} />
                    </div>
                    <span className="nav-mobile-label">หมวดหมู่</span>
                </Link>

                <Link
                    href="/favorites"
                    className={`nav-mobile-item ${isActive('/favorites') ? 'active' : ''}`}
                >
                    <div className="nav-mobile-icon">
                        <HeartIcon size={20} />
                    </div>
                    <span className="nav-mobile-label">รายการโปรด</span>
                </Link>

                {user && store ? (
                    <Link
                        href="/seller/dashboard"
                        className={`nav-mobile-item ${isActive('/seller') ? 'active' : ''}`}
                    >
                        <div className="nav-mobile-icon">
                            <ChartIcon size={20} />
                        </div>
                        <span className="nav-mobile-label">ร้านของฉัน</span>
                    </Link>
                ) : (
                    <Link
                        href="/seller/login"
                        className={`nav-mobile-item ${isActive('/seller') ? 'active' : ''}`}
                    >
                        <div className="nav-mobile-icon">
                            <StoreIcon size={20} />
                        </div>
                        <span className="nav-mobile-label">เป็นผู้ขาย</span>
                    </Link>
                )}
            </div>
        </nav>
    );
}
