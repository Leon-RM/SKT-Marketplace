'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ImageUploadHelper } from './Helpers';
import { getImageInfo, formatFileSize, validateFileSize, blobToBase64, uploadBase64Image } from '@/lib/imgbb';

interface ImageCropperProps {
    aspectRatio?: number;
    onImageUploaded: (imageUrl: string) => void;
    onClose: () => void;
    recommendedSize?: string;
}

export default function ImageCropper({
    aspectRatio = 1,
    onImageUploaded,
    onClose,
    recommendedSize = '800x800 พิกเซล'
}: ImageCropperProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [imageInfo, setImageInfo] = useState<{ width: number; height: number; size: number; sizeText: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string>('');
    const imgRef = useRef<HTMLImageElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        const validation = validateFileSize(file);
        if (!validation.valid) {
            setError(validation.error || 'ไฟล์มีขนาดใหญ่เกินไป');
            return;
        }

        setError('');
        setImageFile(file);

        // Get image info
        const info = await getImageInfo(file);
        setImageInfo(info);

        // Create preview URL
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const getCroppedImage = useCallback(async (): Promise<string | null> => {
        if (!imgRef.current || !completedCrop) return null;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const base64 = await blobToBase64(blob);
                    resolve(base64);
                } else {
                    resolve(null);
                }
            }, 'image/jpeg', 0.9);
        });
    }, [completedCrop]);

    const handleUpload = async () => {
        setUploading(true);
        setError('');

        try {
            let base64: string | null = null;

            if (completedCrop && imgRef.current) {
                // Upload cropped image
                base64 = await getCroppedImage();
            } else if (imageFile) {
                // Upload original image without cropping
                const reader = new FileReader();
                base64 = await new Promise((resolve) => {
                    reader.onload = () => {
                        const result = reader.result as string;
                        resolve(result.split(',')[1]);
                    };
                    reader.readAsDataURL(imageFile);
                });
            }

            if (!base64) {
                setError('ไม่สามารถประมวลผลรูปภาพได้');
                setUploading(false);
                return;
            }

            const result = await uploadBase64Image(base64);

            if (result.success && result.url) {
                onImageUploaded(result.url);
                onClose();
            } else {
                setError(result.error || 'เกิดข้อผิดพลาดในการอัปโหลด');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('เกิดข้อผิดพลาดในการอัปโหลด');
        }

        setUploading(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">📷 อัปโหลดรูปภาพ</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <ImageUploadHelper
                    recommendedSize={recommendedSize}
                    currentSize={imageInfo?.sizeText}
                    currentDimensions={imageInfo ? `${imageInfo.width} x ${imageInfo.height} px` : undefined}
                />

                {!imageSrc ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                        <label
                            htmlFor="image-upload"
                            className="glass-card"
                            style={{
                                display: 'block',
                                cursor: 'pointer',
                                padding: 'var(--space-2xl)',
                                border: '2px dashed var(--glass-border)',
                                transition: 'all var(--transition-base)'
                            }}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📁</div>
                            <div style={{ color: 'var(--text-secondary)' }}>
                                คลิกเพื่อเลือกรูปภาพ
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
                                รองรับ JPG, PNG, WEBP (ไม่เกิน 32MB)
                            </div>
                        </label>
                        <input
                            type="file"
                            id="image-upload"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <div>
                        <div style={{
                            marginBottom: 'var(--space-md)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            background: 'var(--bg-glass)'
                        }}>
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspectRatio}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    ref={imgRef}
                                    src={imageSrc}
                                    alt="Crop preview"
                                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                                />
                            </ReactCrop>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-sm)',
                            marginBottom: 'var(--space-md)',
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)'
                        }}>
                            <div>💡 ลากเพื่อเลือกพื้นที่ที่ต้องการ หรือกด &quot;อัปโหลด&quot; เพื่อใช้รูปเต็ม</div>
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: 'var(--space-md)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: '#EF4444',
                        marginBottom: 'var(--space-md)'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    {imageSrc && (
                        <>
                            <button
                                className="btn btn-glass"
                                onClick={() => {
                                    setImageSrc('');
                                    setImageFile(null);
                                    setImageInfo(null);
                                    setCrop(undefined);
                                    setCompletedCrop(undefined);
                                }}
                                style={{ flex: 1 }}
                            >
                                🔄 เลือกรูปใหม่
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={uploading}
                                style={{ flex: 1 }}
                            >
                                {uploading ? (
                                    <>
                                        <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                                        กำลังอัปโหลด...
                                    </>
                                ) : (
                                    '✓ อัปโหลด'
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
