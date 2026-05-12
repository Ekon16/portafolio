import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md",
                toast.type === 'success' && "bg-emerald-900/90 border-emerald-700 text-emerald-100",
                toast.type === 'error' && "bg-red-900/90 border-red-700 text-red-100",
                toast.type === 'info' && "bg-zinc-900/90 border-zinc-700 text-zinc-100"
              )}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 mt-0.5 shrink-0 text-zinc-400" />}
              <p className="text-sm flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
