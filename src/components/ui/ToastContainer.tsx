import React from 'react';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
          error: <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
          warning: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
          info: <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />,
        };

        const borderMap = {
          success: 'border-emerald-500/30 bg-neutral-900/95',
          error: 'border-rose-500/30 bg-neutral-900/95',
          warning: 'border-amber-500/30 bg-neutral-900/95',
          info: 'border-sky-500/30 bg-neutral-900/95',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all ${borderMap[toast.type]}`}
          >
            {iconMap[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-neutral-100">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
