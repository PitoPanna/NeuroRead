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
      setAnalysisData(null);
      return;
    }
    try {
      const response = await axiosClient.get('/documents');
      setDocuments(response.data);
      if (response.data.length > 0 && !analysisData) {
        setAnalysisData(response.data[0]);
      }
    } catch (err) {
      console.error('Hiba a dokumentumok lekérésekor:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [isAuthenticated]);

  const handleUploadSuccess = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
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
      const updatedDocs = documents.filter((doc) => doc.id !== docId);
      setDocuments(updatedDocs);

      if (analysisData?.id === docId) {
        setAnalysisData(updatedDocs[0] || null);
      }
    } catch (err) {
      console.error('Hiba a dokumentum törlésekor:', err);
    }
  };

  const handleClear = () => {
    if (analysisData?.id) {
      handleDeleteDocument(analysisData.id);
    } else {
      setAnalysisData(null);
    }
    setShowSimplified(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#F9FAFB', padding: '40px 24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Fejléc */}
        <header style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', gap: '8px', zIndex: 10 }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#111827', padding: '8px 16px', borderRadius: '12px', border: '1px solid #1F2937' }}>
                <span style={{ fontSize: '14px', color: '#E5E7EB', fontWeight: '600' }}>
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
                  onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                  style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#111827', color: '#D1D5DB', border: '1px solid #374151', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Bejelentkezés
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
                  style={{ padding: '8px 16px', fontSize: '14px', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Regisztráció
                </button>
              </>
            )}
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 8px 0', textAlign: 'center' }}>
            NeuroRead
          </h1>
          <p style={{ fontSize: '1rem', color: '#9CA3AF', margin: 0, textAlign: 'center' }}>
            Cognitive Text Intelligence &amp; Brain Visualization Platform
          </p>
        </header>

        {/* Fő elrendezés: Balra a dokumentumlista, jobbra a tartalom */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* BAL OLDAL */}
          {isAuthenticated && (
            <DocumentSidebar
              documents={documents}
              selectedDocId={analysisData?.id}
              onSelectDocument={handleSelectDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {/* JOBB OLDAL */}
          <main style={{ flex: 1, width: '100%', backgroundColor: 'rgba(17, 24, 39, 0.6)', border: '1px solid #1F2937', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <FileUpload onUploadSuccess={handleUploadSuccess} />

            {analysisData && (
              <div style={{ borderTop: '1px solid #1F2937', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#D1D5DB', margin: 0 }}>
                    Beolvasott dokumentum
                  </h2>
                  <button
                    type="button"
                    onClick={handleClear}
                    style={{ padding: '8px 16px', fontSize: '0.875rem', fontWeight: '600', color: 'white', backgroundColor: '#DC2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
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