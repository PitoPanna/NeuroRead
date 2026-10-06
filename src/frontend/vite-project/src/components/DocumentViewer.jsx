import React from 'react';
import TextHighlighter from './TextHighlighter';

export function DocumentViewer({ initialData, showSimplified, onToggleSimplified }) {
  if (!initialData) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Dokumentum Fejléc Infók és Funkciógomb */}
      <div 
        style={{
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          border: '1px solid #374151',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          textAlign: 'left'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F3F4F6', margin: '0 0 4px 0' }}>
            📄 {initialData.name}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
            Méret: {initialData.size} | Típus: {initialData.type} | Feltöltve: {initialData.uploadedAt}
          </p>
        </div>
        
        {/* Egyszerűsítés gomb */}
        <button
          onClick={onToggleSimplified}
          style={{
            backgroundColor: showSimplified ? '#1D4ED8' : '#2563EB',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {showSimplified ? '← Egyszerűsítés elrejtése' : '✨ Egyszerűsített verzió'}
        </button>
      </div>

      {/* Szöveges ablakok (1 vagy 2 oszlopos elrendezés) */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: showSimplified ? '1fr 1fr' : '1fr',
          gap: '20px',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {/* Bal oldali ablak: Eredeti Szöveg */}
        <div 
          style={{
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: '12px',
            padding: '24px',
            maxHeight: '450px',
            overflowY: 'auto',
            textAlign: 'left'
          }}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '12px' }}>
            Eredeti Szöveg (Kognitív kifestéssel)
          </h3>

          <TextHighlighter
            originalText={initialData.content || initialData.text || ''}
            highlights={initialData.cognitive_model?.highlights || []}
          />  
        </div>

        {/* Jobb oldali ablak: Egyszerűsített Szöveg (csak ha be van kapcsolva) */}
        {showSimplified && (
          <div 
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid #1E3A8A',
              borderRadius: '12px',
              padding: '24px',
              maxHeight: '450px',
              overflowY: 'auto',
              textAlign: 'left'
            }}
          >
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', borderBottom: '1px solid #1E293B', paddingBottom: '8px' }}>
              ✨ Egyszerűsített Verzió (NLP)
            </h3>
            <pre 
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'inherit',
                color: '#93C5FD',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                margin: 0,
                textAlign: 'left'
              }}
            >
              {/* Ide fog érkezni a backend által feldolgozott/egyszerűsített kognitív szöveg */}
              {initialData.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}