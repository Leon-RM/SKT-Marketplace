'use client';

import { ReactNode } from 'react';
import { InfoIcon, ImageIcon, CheckIcon, XIcon } from '@/components/ui/Icons';

interface InfoTooltipProps {
    tip: string;
    children?: ReactNode;
}

export function InfoTooltip({ tip, children }: InfoTooltipProps) {
    return (
        <span className="info-tooltip" data-tip={tip}>
            {children || <InfoIcon size={14} />}
        </span>
    );
}

interface FeatureHintProps {
    icon: string | ReactNode;
    title: string;
    text: string;
    onClose?: () => void;
}

export function FeatureHint({ icon, title, text, onClose }: FeatureHintProps) {
    return (
        <div className="feature-hint">
            <span className="feature-hint-icon" style={{ display: 'flex', alignItems: 'center' }}>
                {typeof icon === 'string' ? icon : icon}
            </span>
            <div className="feature-hint-content">
                <div className="feature-hint-title">{title}</div>
                <div className="feature-hint-text">{text}</div>
            </div>
            {onClose && (
                <button className="feature-hint-close" onClick={onClose} aria-label="Close">
                    <XIcon size={16} />
                </button>
            )}
        </div>
    );
}

interface ImageUploadHelperProps {
    maxSize?: string;
    recommendedSize?: string;
    currentSize?: string;
    currentDimensions?: string;
}

export function ImageUploadHelper({
    maxSize = '32MB',
    recommendedSize,
    currentSize,
    currentDimensions
}: ImageUploadHelperProps) {
    return (
        <div className="feature-hint" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
            <span className="feature-hint-icon">
                <ImageIcon size={24} />
            </span>
            <div className="feature-hint-content">
                <div className="feature-hint-title">ข้อมูลรูปภาพ</div>
                <div className="feature-hint-text">
                    <div>• ขนาดไฟล์สูงสุด: {maxSize}</div>
                    {recommendedSize && <div>• ขนาดแนะนำ: {recommendedSize}</div>}
                    {currentSize && <div>• ขนาดไฟล์ปัจจุบัน: {currentSize}</div>}
                    {currentDimensions && <div>• ความละเอียด: {currentDimensions}</div>}
                </div>
            </div>
        </div>
    );
}

interface StepGuideProps {
    currentStep: number;
    steps: { title: string; description: string }[];
}

export function StepGuide({ currentStep, steps }: StepGuideProps) {
    return (
        <div className="step-guide" style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                {steps.map((step, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            opacity: index <= currentStep ? 1 : 0.5
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: index < currentStep
                                ? 'var(--color-primary)'
                                : index === currentStep
                                    ? 'var(--color-primary)'
                                    : 'var(--bg-secondary)',
                            color: index <= currentStep ? 'white' : 'var(--text-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            marginBottom: 'var(--space-2)',
                            boxShadow: index === currentStep ? 'var(--shadow-md)' : 'none',
                            transition: 'all 0.3s ease'
                        }}>
                            {index < currentStep ? <CheckIcon size={20} /> : index + 1}
                        </div>
                        <div style={{
                            fontSize: '0.8rem',
                            textAlign: 'center',
                            fontWeight: index === currentStep ? '600' : '400',
                            color: index === currentStep ? 'var(--text-primary)' : 'var(--text-tertiary)'
                        }}>
                            {step.title}
                        </div>
                    </div>
                ))}
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <h4 style={{ marginBottom: 'var(--space-2)' }}>{steps[currentStep]?.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {steps[currentStep]?.description}
                </p>
            </div>
        </div>
    );
}
