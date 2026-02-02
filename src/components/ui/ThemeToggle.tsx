'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { SunIcon, MoonIcon } from '@/components/ui/Icons';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div style={{ width: 40, height: 40 }} />; // Placeholder to avoid layout shift
    }

    return (
        <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-icon"
            title={theme === 'light' ? 'เปิดโหมดมืด' : 'เปิดโหมดสว่าง'}
            style={{
                borderRadius: 'var(--radius-full)',
                color: theme === 'dark' ? '#FFD700' : 'var(--text-secondary)'
            }}
        >
            {theme === 'light' ? (
                <MoonIcon size={20} />
            ) : (
                <SunIcon size={20} />
            )}
        </button>
    );
}
