'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ImageUploadHelper } from './Helpers';
import { getImageInfo, blobToBase64, uploadBase64Image } from '@/lib/imgbb';
import { XIcon, ImageIcon, CheckIcon, CameraIcon, InfoIcon } from './Icons';

interface ImageCropperProps {
    aspectRatio?: number;
    onImageUploaded: (imageUrl: string) => void;
    onClose: () => void;
    recommendedSize?: string;
    label?: string;
}

export default function ImageCropper({
    aspectRatio = 1,
    onImageUploaded,
    onClose,
    recommendedSize = '1200x1200 px',
    label
}: ImageCropperProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [imageInfo, setImageInfo] = useState<{ width: number; height: number; size: number; sizeText: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string>('');
    const imgRef = useRef<HTMLImageElement>(null);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple size check (32MB)
        if (file.size > 32 * 1024 * 1024) {
            setError('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 32MB)');
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

        // Use natural dimensions for HD quality
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        return new Promise((resolve) => {
            // Use high quality JPEG
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const base64 = await blobToBase64(blob);
                    resolve(base64);
                } else {
                    resolve(null);
                }
            }, 'image/jpeg', 0.95);
        });
    }, [completedCrop]);

    const handleUpload = async () => {
        setUploading(true);
        setError('');

        try {
            let base64: string | null = null;

            if (completedCrop && imgRef.current) {
                // Upload cropped image (HD)
                base64 = await getCroppedImage();
            } else if (imageFile) {
                // Upload original image without cropping (if natural quality preferred)
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

    const getRatioLabel = (ratio: number) => {
        if (Math.abs(ratio - 1) < 0.01) return 'จัตุรัส (1:1)';
        if (Math.abs(ratio - 16 / 9) < 0.01) return 'แนวกว้าง (16:9)';
        if (Math.abs(ratio - 3 / 1) < 0.01) return 'แบนเนอร์ (3:1)';
        if (Math.abs(ratio - 2 / 1) < 2.0) return `สัดส่วน ${ratio.toFixed(1)}:1`;
        return 'กำหนดเอง';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card-elevated" onClick={(e) => e.stopPropagation()} style={{
                maxWidth: '600px',
                width: '95%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: 'var(--bg-primary)',
                    zIndex: 10,
                    paddingBottom: 'var(--space-2)',
                    margin: 'calc(var(--space-6) * -1) calc(var(--space-6) * -1) 0',
                    padding: 'var(--space-6) var(--space-6) var(--space-2)',
                    borderBottom: '1px solid var(--border-light)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <CameraIcon size={24} className="text-primary" />
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{label || 'อัปโหลดรูปภาพ'}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                    >
                        <XIcon size={24} />
                    </button>
                </div>

                <div style={{ marginTop: 'var(--space-2)' }}>
                    <ImageUploadHelper
                        recommendedSize={recommendedSize}
                        currentSize={imageInfo?.sizeText}
                        currentDimensions={imageInfo ? `${imageInfo.width} x ${imageInfo.height} px` : undefined}
                    />
                </div>

                {!imageSrc ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <label
                            htmlFor="image-upload"
                            className="card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 'var(--space-12)',
                                border: '2px dashed var(--border-medium)',
                                background: 'var(--bg-secondary)',
                                transition: 'all var(--transition-base)',
                                minHeight: '200px'
                            }}
                        >
                            <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
                                <ImageIcon size={48} />
                            </div>
                            <div style={{ fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                                คลิกเพื่อเลือกรูปภาพ
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
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
                            marginBottom: 'var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            justifyContent: 'center',
                            maxHeight: '400px',
                            border: '1px solid var(--border-light)'
                        }}>
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspectRatio}
                            >
                                <img
                                    ref={imgRef}
                                    src={imageSrc}
                                    alt="Crop preview"
                                    style={{ maxWidth: '100%', maxHeight: '400px', display: 'block' }}
                                />
                            </ReactCrop>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--space-4)',
                            padding: 'var(--space-3)',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-light)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <InfoIcon size={16} />
                                <span>ลากเพื่อเลือกพื้นที่ หรือใช้รูปแบบ HD</span>
                            </div>
                            <div className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                                {getRatioLabel(aspectRatio)}
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: 'var(--space-4)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: '#EF4444',
                        marginBottom: 'var(--space-4)',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    gap: 'var(--space-4)',
                    position: 'sticky',
                    bottom: 0,
                    background: 'var(--bg-primary)',
                    zIndex: 10,
                    paddingTop: 'var(--space-4)',
                    margin: '0 calc(var(--space-6) * -1) calc(var(--space-6) * -1)',
                    padding: 'var(--space-4) var(--space-6) var(--space-6)',
                    borderTop: '1px solid var(--border-light)'
                }}>
                    {imageSrc && (
                        <>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setImageSrc('');
                                    setImageFile(null);
                                    setImageInfo(null);
                                    setCrop(undefined);
                                    setCompletedCrop(undefined);
                                }}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                เลือกรูปใหม่
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={uploading}
                                style={{ flex: 1, justifyContent: 'center', gap: 'var(--space-2)' }}
                            >
                                {uploading ? (
                                    <>
                                        <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                                        <span>กำลังอัปโหลด...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon size={20} />
                                        <span>อัปโหลด</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}


