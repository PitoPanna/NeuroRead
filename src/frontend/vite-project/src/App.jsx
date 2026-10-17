import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { DocumentViewer } from './components/DocumentViewer';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import DocumentSidebar from './components/DocumentSidebar';
import axiosClient from './api/axiosClient';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [showSimplified, setShowSimplified] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const { user, logout, isAuthenticated } = useAuth();

  const fetchDocuments = async () => {
    if (!isAuthenticated) {
      setDocuments([]);
      return;
    }
    try {
      const response = await axiosClient.get('/documents');
      setDocuments(response.data);
      if (response.data.length > 0 && !analysisData) {
        setAnalysisData(response.data[0]);
      }
    } catch (err) {
      console.warn('Dokumentumok lekérése sikertelen vagy backend offline:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [isAuthenticated]);

  const handleUploadSuccess = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    setAnalysisData(newDoc);
  };

  const handleSelectDocument = (doc) => {
    if (!doc) return;
    setAnalysisData(doc);
  };

  const handleDeleteDocument = async (docId) => {
    if (!docId) return;

    try {
      await axiosClient.delete(`/documents/${docId}`);
    } catch (err) {
      console.warn('Törlési hiba a szerveren (helyi lista frissítése):', err);
    }

    const updatedDocs = documents.filter((doc) => doc.id !== docId);
    setDocuments(updatedDocs);

    if (analysisData?.id === docId) {
      setAnalysisData(updatedDocs[0] || null);
    }
  };

  const handleClear = () => {
    setAnalysisData(null);
    setShowSimplified(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* 1. Kiber-Navigációs Fejléc */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(3, 7, 18, 0.75)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '14px 28px'
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* Logo & Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
              }}
            >
              <span style={{ fontSize: '20px' }}>🧠</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                  NEURO
                </span>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  READ
                </span>
                <span className="neuro-pill" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                  v2.5 COGNITIVE LAB
                </span>
              </div>
            </div>
          </div>

          {/* Rendszerállapot pill */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '12px'
            }}
            className="md-flex"
          >
            <span className="neuro-pill" style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              Szinaptikus Motor Aktív
            </span>
            <span className="neuro-pill">
              ⚡ 3D Információáramlás 60 FPS
            </span>
          </div>

          {/* Felhasználói Fiók és Bejelentkezés */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                >
                  {(user?.full_name || user?.username || user?.email || 'U')[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>
                  {user?.full_name || user?.username || user?.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    backgroundColor: 'rgba(51, 65, 85, 0.6)',
                    color: '#cbd5e1',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  Kilépés
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="neuro-button-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Bejelentkezés
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="neuro-button-primary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Regisztráció
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Fő Munkaterület */}
      <main style={{ flex: 1, padding: '36px 24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Ha még nincs aktív dokumentum, mutassuk a látványos Hero szekciót */}
        {!analysisData ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px', margin: '40px 0' }}>
            {/* Hero szöveg */}
            <div style={{ textAlign: 'center', maxWidth: '780px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '20px'
                }}
              >
                <span>⚡</span>
                <span>Kognitív Neurobiológia és Olvasáspszichológiai Szimuláció</span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                  fontWeight: '800',
                  letterSpacing: '-0.03em',
                  lineHeight: '1.15',
                  margin: '0 0 18px 0',
                  color: '#f8fafc'
                }}
              >
                Hogyan dolgozza fel az agyad az{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #38bdf8 0%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  olvasott szöveget?
                </span>
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: '#94a3b8',
                  lineHeight: '1.6',
                  margin: '0 auto'
                }}
              >
                Tölts fel egy PDF, DOCX vagy szöveges dokumentumot, és figyeld meg valós időben a 3D-s agymodellben az információ áramlását a könnyebb és nehezebb kifejezéseknél.
              </p>
            </div>

            {/* Fájlfeltöltő Scanner */}
            <FileUpload onUploadSuccess={handleUploadSuccess} />

            {/* 3 Fő Funkciókártya (Unique Design Pillérek) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                width: '100%',
                maxWidth: '1000px',
                marginTop: '16px'
              }}
            >
              <div className="neuro-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>🧠</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
                  3D Szinaptikus Áramlás
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  A Látókéreg, a Wernicke-terület, a Broca-központ és a Prefrontális kéreg közötti valós idejű szinaptikus impulzusok modellezése.
                </p>
              </div>

              <div className="neuro-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚡</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
                  Kognitív Elakadások
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  Azonnali színkódolt vizualizáció: a munkamemóriát leterhelő szakszavak és a visszacsatolási hurkot generáló összetett mondatszerkezetek.
                </p>
              </div>

              <div className="neuro-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>✨</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
                  Adaptív NLP Egyszerűsítés
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  Egyetlen kattintással generált közérthető változat, amely fenntartja a szakmai lényeget, miközben minimalizálja az olvasási nehézséget.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Ha van aktív dokumentum, megjelenítjük a teljes stúdiót */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Munkaterület Műveleti Sáv */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 20px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="neuro-pill" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
                  AKTÍV ELEMZÉS
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>
                  {analysisData.name || analysisData.filename}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleClear}
                  className="neuro-button-secondary"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  ➕ Új dokumentum feltöltése
                </button>
              </div>
            </div>

            {/* Split Elrendezés: Balra a Dokumentumtár (ha van/bejelentkezve), Jobbra a DocumentViewer */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'flex-start' }}>
              {(isAuthenticated || documents.length > 0) && (
                <DocumentSidebar
                  documents={documents}
                  selectedDocId={analysisData?.id}
                  onSelectDocument={handleSelectDocument}
                  onDeleteDocument={handleDeleteDocument}
                />
              )}

              <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                <DocumentViewer
                  initialData={analysisData}
                  showSimplified={showSimplified}
                  onToggleSimplified={() => setShowSimplified(!showSimplified)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Kiber Lábléc */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(3, 7, 18, 0.9)',
          padding: '24px',
          marginTop: 'auto'
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px',
            color: '#64748b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🧠</span>
            <span>NeuroRead Platform • Kognitív Szövegintelligencia &amp; 3D Agyi Modellezés</span>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Occipitális (V1)</span>
            <span>•</span>
            <span>Wernicke (Szemantika)</span>
            <span>•</span>
            <span>Broca (Szintaxis)</span>
            <span>•</span>
            <span>Prefrontális (DLPFC)</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
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