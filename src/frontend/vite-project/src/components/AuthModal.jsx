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
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="neuro-card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          background: 'radial-gradient(circle at top, rgba(30, 41, 59, 0.9) 0%, rgba(10, 15, 30, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.15)'
        }}
      >
        {/* Bezárás gomb */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          ✕
        </button>

        {/* Brand Ikon és Fejléc */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              margin: '0 auto 14px auto',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.3))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)'
            }}
          >
            🧠
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            {mode === 'login' ? 'Bejelentkezés' : 'Fiók létrehozása'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            {mode === 'login'
              ? 'Lépj be a kognitív elemzéseid megtekintéséhez'
              : 'Csatlakozz a NeuroRead kutatói platformhoz'}
          </p>
        </div>

        {/* Hibaüzenet */}
        {error && (
          <div
            style={{
              marginBottom: '18px',
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>Teljes név</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Pl. Kovács Péter"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'rgba(10, 15, 30, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>Email cím</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pelda@domain.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: 'rgba(10, 15, 30, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>Jelszó</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: 'rgba(10, 15, 30, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="neuro-button-primary"
            style={{ width: '100%', padding: '13px', marginTop: '6px' }}
          >
            {loading ? 'Feldolgozás...' : mode === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
          </button>
        </form>

        {/* Váltó gomb */}
        <div
          style={{
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            fontSize: '13px',
            color: '#94a3b8'
          }}
        >
          {mode === 'login' ? (
            <span>
              Még nincs fiókod?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('register');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Regisztrálj itt
              </button>
            </span>
          ) : (
            <span>
              Már van fiókod?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('login');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
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