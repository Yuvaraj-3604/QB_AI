import React from 'react';
import { useToast } from './use-toast';

export function Toaster() {
    const { toasts } = useToast();

    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`p-4 rounded-lg shadow-lg border animate-in slide-in-from-right-4 transition-all ${toast.variant === 'destructive'
                            ? 'bg-red-50 border-red-200 text-red-900'
                            : 'bg-white border-gray-100 text-gray-900'
                        }`}
                >
                    {toast.title && <h4 className="font-bold text-sm">{toast.title}</h4>}
                    {toast.description && <p className="text-xs mt-1 opacity-90">{toast.description}</p>}
                </div>
            ))}
        </div>
    );
}
