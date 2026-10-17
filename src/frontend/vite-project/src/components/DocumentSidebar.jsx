import React, { useState } from 'react';

export default function DocumentSidebar({
  documents = [],
  selectedDocId,
  onSelectDocument,
  onDeleteDocument
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter((doc) => {
    const name = doc.name || doc.filename || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getFormatColor = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('pdf')) return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#fca5a5', label: 'PDF' };
    if (t.includes('docx') || t.includes('doc')) return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#93c5fd', label: 'DOC' };
    return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#6ee7b7', label: 'TXT' };
  };

  return (
    <aside
      className="neuro-card"
      style={{
        width: '320px',
        flexShrink: 0,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Fejléc */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📑</span>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.01em' }}>
            Dokumentumtár
          </h3>
        </div>
        <span className="neuro-pill">
          {documents.length} aktív
        </span>
      </div>

      {/* Gyorskereső */}
      {documents.length > 3 && (
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Keresés..."
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'rgba(10, 15, 30, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: '#f8fafc',
              fontSize: '12px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>
      )}

      {/* Dokumentum lista */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: 'calc(100vh - 280px)',
          overflowY: 'auto',
          paddingRight: '4px'
        }}
      >
        {filteredDocs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              backgroundColor: 'rgba(15, 23, 42, 0.3)'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.6 }}>📂</div>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8' }}>
              Nincs megjeleníthető fájl
            </p>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Húzz be egy fájlt az elemzéshez!
            </span>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            const fmt = getFormatColor(doc.type || doc.name);

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                style={{
                  position: 'relative',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: isSelected
                    ? 'rgba(37, 99, 235, 0.18)'
                    : 'rgba(15, 23, 42, 0.5)',
                  border: isSelected
                    ? '1px solid #38bdf8'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  boxShadow: isSelected
                    ? '0 0 20px rgba(56, 189, 248, 0.15)'
                    : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Bal oldali aktív jelzőcsík */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '10px',
                      bottom: '10px',
                      width: '3px',
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: '#38bdf8',
                      boxShadow: '0 0 8px #38bdf8'
                    }}
                  />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '6px',
                        fontSize: '9px',
                        fontWeight: '700',
                        backgroundColor: fmt.bg,
                        border: `1px solid ${fmt.border}`,
                        color: fmt.text,
                        fontFamily: 'monospace'
                      }}
                    >
                      {fmt.label}
                    </span>
                    <span
                      style={{
                        fontWeight: isSelected ? '700' : '600',
                        fontSize: '0.85rem',
                        color: isSelected ? '#ffffff' : '#e2e8f0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {doc.name || doc.filename || 'Dokumentum'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (doc?.id) onDeleteDocument(doc.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                    title="Törlés a listából"
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    color: '#94a3b8',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <span>{doc.size || 'N/A'}</span>
                  <span>{doc.uploadedAt || ''}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}