import { useAuth } from '../context/AuthContext';

export function AuthModal() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header>
      {isAuthenticated ? (
        <div>
          <span>Üdv, {user?.full_name || user?.email}!</span>
          <button onClick={logout}>Kijelentkezés</button>
        </div>
      ) : (
        <span>Nincs bejelentkezve</span>
      )}
    </header>
  );
}