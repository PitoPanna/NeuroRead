import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function AuthModal({ mode, setMode, onClose }) {
  const { login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else {
        await register({
          email,
          password,
          full_name: fullName,
        });
        await login(email, password);
        onClose();
      }
    } catch (err) {
      console.error('Auth hiba:', err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail[0]?.msg || 'Érvénytelen adatmezők!');
      } else {
        setError(mode === 'login' ? 'Hibás email vagy jelszó!' : 'A regisztráció nem sikerült.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Sötétített háttér (Overlay) */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      {/* Modal Kártya */}
      <div
        onClick={(e) => e.stopPropagation()} // Ne csukódjon be, ha a kártyára kattintunk
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: '#f3f4f6'
        }}
      >
        {/* Bezáró X gomb */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px'
          }}
        >
          ✕
        </button>

        {/* Cím és fejléc */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
            {mode === 'login' ? 'Üdv újra!' : 'Fiók létrehozása'}
          </h2>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
            {mode === 'login'
              ? 'Jelentkezz be a mentett dokumentumaid eléréséhez'
              : 'Regisztrálj a NeuroRead platform használatához'}
          </p>
        </div>

        {/* Hibaüzenet doboz */}
        {error && (
          <div
            style={{
              marginBottom: '16px',
              padding: '10px 14px',
              backgroundColor: 'rgba(127, 29, 29, 0.4)',
              border: '1px solid #b91c1c',
              borderRadius: '10px',
              color: '#fca5a5',
              fontSize: '13px',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#d1d5db' }}>Teljes név</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Neved"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#030712',
                  border: '1px solid #1f2937',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#d1d5db' }}>Email cím</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nev@example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#030712',
                border: '1px solid #1f2937',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#d1d5db' }}>Jelszó</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#030712',
                border: '1px solid #1f2937',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '14px',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            {loading
              ? 'Feldolgozás...'
              : mode === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
          </button>
        </form>

        {/* Átváltó gomb */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1f2937', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
          {mode === 'login' ? (
            <span>
              Még nincs fiókod?{' '}
              <button
                type="button"
                onClick={() => { setError(''); setMode('register'); }}
                style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: '500', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Regisztrálj itt
              </button>
            </span>
          ) : (
            <span>
              Már van fiókod?{' '}
              <button
                type="button"
                onClick={() => { setError(''); setMode('login'); }}
                style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: '500', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Jelentkezz be
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}