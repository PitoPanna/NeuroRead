import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DocumentViewer } from './components/DocumentViewer';
import { AuthModal } from './components/AuthModal'; // Visszaállítva kapcsos zárójelre
import { useAuth } from './context/AuthContext';

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [showSimplified, setShowSimplified] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const { user, logout, isAuthenticated } = useAuth();

  const handleClear = () => {
    setAnalysisData(null);
    setShowSimplified(false);
  };

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Fejléc - Relatív pozicionálással a gombokhoz */}
        <header style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>

          {/* Beljebb húzott gombok (right: '1rem' / right: '16px') */}
          <div style={{ position: 'absolute', right: '1rem', top: '0.25rem', display: 'flex', gap: '8px', zIndex: 10 }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#111827', padding: '8px 16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <span style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: '600' }}>
                  {user?.full_name || user?.username || user?.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#374151', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                >
                  Kijelentkezés
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLogin}
                  style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#111827', color: '#d1d5db', border: '1px solid #374151', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Bejelentkezés
                </button>
                <button
                  type="button"
                  onClick={openRegister}
                  style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Regisztráció
                </button>
              </>
            )}
          </div>

          {/* Cím és alcím */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-snug max-w-4xl mx-auto text-center pt-8 sm:pt-0">
            NeuroRead
          </h1>
          <p className="text-sm sm:text-base text-gray-400 text-center">
            Cognitive Text Intelligence &amp; Brain Visualization Platform
          </p>
        </header>

        {/* Fő tartalom */}
        <main className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
          <FileUpload onUploadSuccess={(data) => setAnalysisData(data)} />

          {analysisData && (
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-lg font-semibold text-gray-300">
                  Beolvasott dokumentum
                </h2>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-6 py-2.5 text-base font-semibold text-white bg-red-600 hover:bg-red-500 active:scale-95 rounded-lg transition-all shadow-lg hover:shadow-red-600/30 cursor-pointer ml-auto"
                >
                  Törlés
                </button>
              </div>

              <DocumentViewer
                initialData={analysisData}
                showSimplified={showSimplified}
                onToggleSimplified={() => setShowSimplified(!showSimplified)}
              />
            </div>
          )}
        </main>

      </div>

      {isAuthModalOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}