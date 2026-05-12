import React, { useState } from 'react';
import { Github, Twitter, Linkedin, Heart, Lock } from 'lucide-react';
import { AdminLogin } from '@/components/AdminLogin';
import { useAdmin } from '@/context/AdminContext';

export function Footer() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAdmin, logout } = useAdmin();

  return (
    <>
      <footer className="bg-muted/30 border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="font-bold text-lg mb-2">JoseIgnacio.dev</div>
            <p className="text-sm text-muted-foreground">
              Analytical, Resolute, and Committed.
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <a href="https://linkedin.com/in/joseignaciogodino" className="text-muted-foreground hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span>Made with <Heart className="w-4 h-4 mx-1 text-red-500 fill-red-500 inline" /> in 2026</span>
            
            {isAdmin ? (
              <button onClick={logout} className="text-xs text-muted-foreground hover:text-red-500 transition-colors">
                Logout
              </button>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="text-muted-foreground/20 hover:text-primary transition-colors">
                <Lock className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </footer>
      <AdminLogin isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
