import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { loginUser as apiLogin, registerUser as apiRegister, logoutUser as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Az oldal betöltésekor ellenőrizzük, van-e érvényes tokenünk
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Meghívjuk az aktuális user adatait lekérő backend végpontot
          const response = await axiosClient.get('/auth/me'); // Vagy a te backended szerinti /users/me endpoint
          setUser(response.data);
        } catch (error) {
          console.error("Érvénytelen vagy lejárt token:", error);
          apiLogout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  // 2. Bejelentkezés
  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    // A login sikeres volt, le kérjük a user adatait az azonosításhoz
    try {
      const userResponse = await axiosClient.get('/auth/me');
      setUser(userResponse.data);
    } catch {
      // Ha nincs külön /me végpontod, az alapszintű user adatot is beállíthatjuk
      setUser({ email });
    }
    return data;
  };

  // 3. Regisztráció
  const register = async (userData) => {
    return await apiRegister(userData);
  };

  // 4. Kijelentkezés
  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Egyedi hook az AuthContext egyszerű használatához a komponensekben
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth-ot csak az AuthProvider-en belül lehet használni!');
  }
  return context;
};