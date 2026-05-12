import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  const login = async (password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (response.ok) {
        localStorage.setItem('adminToken', 'demo-token');
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, getAuthHeaders }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
