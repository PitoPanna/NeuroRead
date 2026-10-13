import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { loginUser as apiLogin, registerUser as apiRegister, logoutUser as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Az oldal betöltésekor ellenőrizzük az alapadatokat
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await axiosClient.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error("Érvénytelen vagy lejárt token:", error);
          apiLogout();
          localStorage.removeItem('access_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  // 2. Bejelentkezés
  const login = async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      
      // MENTÉS: Mindig 'access_token' néven mentsük el!
      const token = data.access_token || data.token;
      localStorage.setItem('access_token', token);

      // Lekérjük a bejelentkezett user adatait
      const userResponse = await axiosClient.get('/auth/me');
      setUser(userResponse.data);
      
      return data;
    } catch (err) {
      console.error('Bejelentkezési hiba:', err);
      localStorage.removeItem('access_token');
      setUser(null);
      throw err; // Dobjuk tovább a hibát a Login felületnek, hogy ki tudja írni
    }
  };

  // 3. Regisztráció
  const register = async (userData) => {
    return await apiRegister(userData);
  };

  // 4. Kijelentkezés
  const logout = () => {
    apiLogout();
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth-ot csak az AuthProvider-en belül lehet használni!');
  }
  return context;
};