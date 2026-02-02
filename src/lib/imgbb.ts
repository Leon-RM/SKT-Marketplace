// ImgBB Image Upload Service
// ใช้สำหรับอัปโหลดรูปภาพทั้งหมดในเว็บไซต์

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || 'YOUR_IMGBB_API_KEY';
const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32MB

export interface ImageUploadResult {
    success: boolean;
    url?: string;
    deleteUrl?: string;
    error?: string;
}

export interface ImageInfo {
    width: number;
    height: number;
    size: number;
    sizeText: string;
}

/**
 * ดึงข้อมูลรูปภาพ (ขนาดพิกเซล, ขนาดไฟล์)
 */
export function getImageInfo(file: File): Promise<ImageInfo> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.width,
                height: img.height,
                size: file.size,
                sizeText: formatFileSize(file.size)
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: 0,
                height: 0,
                size: file.size,
                sizeText: formatFileSize(file.size)
            });
        };

        img.src = url;
    });
}

/**
 * แปลงขนาดไฟล์เป็นข้อความ
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * ตรวจสอบขนาดไฟล์
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `ไฟล์มีขนาดใหญ่เกินไป (${formatFileSize(file.size)}) กรุณาใช้ไฟล์ที่มีขนาดไม่เกิน 32MB`
        };
    }
    return { valid: true };
}

/**
 * แปลง File เป็น Base64
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
}

/**
 * แปลง Blob/Canvas เป็น Base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
}

/**
 * อัปโหลดรูปภาพไปยัง ImgBB
 */
export async function uploadImage(file: File): Promise<ImageUploadResult> {
    // Validate file size
    const validation = validateFileSize(file);
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }

    try {
        const base64 = await fileToBase64(file);

        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', base64);

        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                url: data.data.url,
                deleteUrl: data.data.delete_url
            };
        } else {
            return {
                success: false,
                error: data.error?.message || 'เกิดข้อผิดพลาดในการอัปโหลด'
            };
        }
    } catch (error) {
        console.error('Upload error:', error);
        return {
            success: false,
            error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่'
        };
    }
}

/**
 * อัปโหลดรูปภาพจาก Base64 ไปยัง ImgBB
 */
export async function uploadBase64Image(base64: string): Promise<ImageUploadResult> {
    try {
        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', base64);

        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                url: data.data.url,
                deleteUrl: data.data.delete_url
            };
        } else {
            return {
                success: false,
                error: data.error?.message || 'เกิดข้อผิดพลาดในการอัปโหลด'
            };
        }
    } catch (error) {
        console.error('Upload error:', error);
        return {
            success: false,
            error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่'
        };
    }
}

/**
 * อัปโหลดรูปภาพหลายรูป
 */
export async function uploadMultipleImages(files: File[]): Promise<ImageUploadResult[]> {
    const results = await Promise.all(files.map(file => uploadImage(file)));
    return results;
}
