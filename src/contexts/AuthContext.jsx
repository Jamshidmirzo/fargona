import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('fargona_admin_auth') === 'true';
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('fargona_admin_token') || null;
  });

  const [user, setUser] = useState(() => {
    const data = localStorage.getItem('fargona_admin_user');
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setIsAuthenticated(true);
      setToken(data.token);
      
      const userInfo = {
        username: data.username,
        role: data.role,
        assignedMuseums: data.assignedMuseums || []
      };
      
      setUser(userInfo);
      
      localStorage.setItem('fargona_admin_auth', 'true');
      localStorage.setItem('fargona_admin_token', data.token);
      localStorage.setItem('fargona_admin_user', JSON.stringify(userInfo));
      
      return { success: true };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    localStorage.removeItem('fargona_admin_auth');
    localStorage.removeItem('fargona_admin_token');
    localStorage.removeItem('fargona_admin_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
