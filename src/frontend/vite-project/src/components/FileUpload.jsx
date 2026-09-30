import React, { useState } from 'react';

export function FileUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const processFile = async (file) => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Küldés a Python FastAPI backendnek
      const response = await fetch('http://localhost:8000/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Hiba történt a fájl feldolgozása során.');
      }

      const data = await response.json();
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (error) {
      console.error('Feltöltési hiba:', error);
      alert('Nem sikerült a dokumentum feldolgozása a backend által.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
      }}
      style={{
        border: isDragging ? '2px dashed #60A5FA' : '2px dashed #4B5563',
        borderRadius: '16px',
        padding: '32px 24px',
        backgroundColor: isDragging ? 'rgba(37, 99, 235, 0.15)' : 'rgba(31, 41, 55, 0.5)',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '16px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      <div style={{ color: '#60A5FA' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>

      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#F3F4F6', margin: '0 0 6px 0' }}>
          {loading ? 'Feldolgozás a backend által...' : 'Húzd ide a dokumentumot vagy kattints'}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
          Támogatott formátumok: .docx, .pdf, .txt
        </p>
      </div>

      <label 
        style={{
          backgroundColor: loading ? '#4B5563' : '#2563EB',
          color: '#FFFFFF',
          fontWeight: '500',
          fontSize: '0.95rem',
          padding: '10px 24px',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'inline-block',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
        }}
      >
        {loading ? 'Feltöltés...' : 'Fájl kiválasztása'}
        <input 
          type="file" 
          disabled={loading}
          style={{ display: 'none' }} 
          accept=".docx,.pdf,.txt"
          onChange={(e) => processFile(e.target.files[0])} 
        />
      </label>
    </div>
  );
}