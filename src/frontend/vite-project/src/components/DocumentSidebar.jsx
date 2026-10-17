import React from 'react';

export default function DocumentSidebar({ 
  documents = [], 
  selectedDocId, 
  onSelectDocument, 
  onDeleteDocument 
}) {
  return (
    <aside 
      style={{
        width: '300px',
        flexShrink: 0,
        backgroundColor: '#111827',
        border: '1px solid #1F2937',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1F2937',
          paddingBottom: '12px'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#F3F4F6' }}>
          📚 Dokumentumok
        </h3>
        <span 
          style={{
            backgroundColor: '#1F2937',
            color: '#9CA3AF',
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '12px',
            border: '1px solid #374151',
            fontFamily: 'monospace'
          }}
        >
          {documents.length} db
        </span>
      </div>

      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: 'calc(100vh - 220px)',
          overflowY: 'auto',
          paddingRight: '4px'
        }}
      >
        {documents.length === 0 ? (
          <div 
            style={{
              textAlign: 'center',
              padding: '24px 12px',
              border: '1px dashed #374151',
              borderRadius: '12px',
              backgroundColor: 'rgba(17, 24, 39, 0.4)'
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#9CA3AF' }}>
              Nincs feltöltött dokumentum.
            </p>
          </div>
        ) : (
          documents.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: isSelected ? '1px solid #3B82F6' : '1px solid #1F2937',
                  backgroundColor: isSelected ? 'rgba(30, 58, 138, 0.4)' : 'rgba(17, 24, 39, 0.8)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#F3F4F6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    📄 {doc.name || doc.filename || 'Dokumentum'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (doc?.id) onDeleteDocument(doc.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      padding: '2px'
                    }}
                    title="Törlés"
                  >
                    🗑️
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF', fontFamily: 'monospace' }}>
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