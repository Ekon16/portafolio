import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export function AdminLogin({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(password);
    if (success) {
      onClose();
      setPassword('');
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md p-6 bg-card border border-border rounded-xl shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Admin Access</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Login
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
