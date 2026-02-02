'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { ProductGrid } from '@/components/products/ProductCard';
import { getAllProducts, getAllStores, Product, StoreProfile } from '@/lib/firebase';
import { STORE_CATEGORIES, StoreCategory } from '@/types';
import { FeatureHint } from '@/components/ui/Helpers';
import { SearchIcon, FilterIcon, StoreIcon, ShoppingBagIcon, InfoIcon, XIcon, PackageIcon } from '@/components/ui/Icons';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [productsData, storesData] = await Promise.all([
      getAllProducts(),
      getAllStores()
    ]);

    setProducts(productsData);
    setStores(storesData);

    // Create store name lookup
    const names: Record<string, string> = {};
    storesData.forEach(store => {
      names[store.sellerId] = store.name;
    });
    setStoreNames(names);

    setLoading(false);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Header />
      <MobileNav />

      <main className="page-container">
        {/* Welcome Banner */}
        {showWelcome && (
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div className="card-elevated" style={{
              background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
              textAlign: 'center',
              position: 'relative',
              padding: 'var(--space-8) var(--space-6)',
              overflow: 'hidden',
              border: '1px solid var(--border-medium)'
            }}>
              <button
                onClick={() => setShowWelcome(false)}
                style={{
                  position: 'absolute',
                  top: 'var(--space-4)',
                  right: 'var(--space-4)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: 'var(--space-2)'
                }}
              >
                <XIcon size={20} />
              </button>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <Image
                  src="/logo.png"
                  alt="SKT Marketplace"
                  width={64}
                  height={64}
                  style={{ margin: '0 auto' }}
                />
              </div>

              <h1 style={{ marginBottom: 'var(--space-2)' }}>
                SKT Marketplace
              </h1>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto var(--space-6)' }}>
                ตลาดนัดออนไลน์สำหรับนักเรียน สกธ. ซื้อขายสินค้าง่ายๆ ไม่ต้องสมัครสมาชิก
              </p>

              <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/seller/login" className="btn btn-primary">
                  <StoreIcon size={18} />
                  <span>เป็นผู้ขาย</span>
                </Link>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="btn btn-outline"
                >
                  <ShoppingBagIcon size={18} />
                  <span>ดูสินค้าทั้งหมด</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Info Hint */}
        {showHint && (
          <FeatureHint
            icon={<InfoIcon size={20} />}
            title="วิธีใช้งาน"
            text="เลือกดูสินค้าได้เลย ไม่ต้องสมัครสมาชิก กดหัวใจเพื่อบันทึกสินค้าโปรด กดปุ่มสั่งซื้อเพื่อติดต่อผู้ขาย"
            onClose={() => setShowHint(false)}
          />
        )}

        {/* Search & Filter */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1, minWidth: '200px', flexDirection: 'row', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                <SearchIcon size={18} />
              </div>
              <input
                type="text"
                className="input"
                placeholder="ค้นหาสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <div className="input-group" style={{ flexDirection: 'row', minWidth: '180px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }}>
                <FilterIcon size={18} />
              </div>
              <select
                className="input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ paddingLeft: '40px' }}
              >
                <option value="all">ทุกหมวดหมู่</option>
                {Object.entries(STORE_CATEGORIES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Products */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
                <ShoppingBagIcon size={24} />
              </span>
              <h2>สินค้าทั้งหมด</h2>
            </div>
            <span className="badge badge-gray">
              {filteredProducts.length} รายการ
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)' }}>
                กำลังโหลดสินค้า...
              </p>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} storeNames={storeNames} />
          )}
        </section>

        {/* Stores Section */}
        {stores.length > 0 && (
          <section style={{ marginTop: 'var(--space-16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
              <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
                <StoreIcon size={24} />
              </span>
              <h2>ร้านค้าทั้งหมด</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 'var(--space-4)'
            }}>
              {stores.map((store) => (
                <Link
                  key={store.sellerId}
                  href={`/store/${store.sellerId}`}
                  className="card"
                  style={{
                    textAlign: 'center',
                    textDecoration: 'none',
                    padding: 'var(--space-6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-3)'
                  }}
                >
                  {store.profilePic ? (
                    <Image
                      src={store.profilePic}
                      alt={store.name}
                      width={80}
                      height={80}
                      style={{
                        borderRadius: 'var(--radius-full)',
                        objectFit: 'cover',
                        border: '2px solid var(--border-light)'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-tertiary)',
                      border: '2px solid var(--border-light)'
                    }}>
                      <StoreIcon size={32} />
                    </div>
                  )}
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{store.name}</h4>
                    <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                      {STORE_CATEGORIES[store.category as StoreCategory]?.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
