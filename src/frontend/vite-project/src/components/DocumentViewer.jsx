import React, { useState, useMemo } from 'react';
import TextHighlighter from './TextHighlighter';
import Brain3DViewer from './Brain3DViewer';

export function DocumentViewer({ initialData, showSimplified, onToggleSimplified }) {
  if (!initialData) return null;

  const [selectedSegment, setSelectedSegment] = React.useState(null);

  // Kognitív kiemelések: LLM/Backend válasz vagy intelligens kognitív detekció
  const effectiveHighlights = useMemo(() => {
    if (initialData.cognitive_model?.highlights?.length > 0) {
      return initialData.cognitive_model.highlights;
    }
    const text = initialData.content || initialData.text || '';
    if (!text) return [];

    const words = text.split(/\s+/);
    const generated = [];
    const seen = new Set();

    words.forEach((w) => {
      const clean = w.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');
      if (clean.length >= 11 && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        generated.push({
          text: clean,
          color_code: clean.length >= 14 ? '#EF4444' : '#F97316',
          highlight_type: clean.length >= 14 ? 'llm_cognitive' : 'spacy_difficult',
          reason: clean.length >= 14 ? 'Összetett kognitív elakadási pont' : 'Munkamemóriát terhelő szakszó'
        });
      }
    });

    return generated.slice(0, 15);
  }, [initialData]);

  // Szavak száma és becsült olvasási idő
  const { wordCount, readTimeMinutes } = useMemo(() => {
    const text = initialData.content || initialData.text || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    const minutes = Math.max(1, Math.ceil(count / 200));
    return { wordCount: count, readTimeMinutes: minutes };
  }, [initialData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. Dokumentum Fejléc Infó Kártya */}
      <div
        className="neuro-card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.2))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}
          >
            📄
          </div>

          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#f8fafc',
                margin: '0 0 6px 0',
                letterSpacing: '-0.02em'
              }}
            >
              {initialData.name || initialData.filename}
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="neuro-pill">
                Méret: {initialData.size}
              </span>
              <span className="neuro-pill">
                ~{wordCount} szó ({readTimeMinutes} perc olvasás)
              </span>
              <span className="neuro-pill" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                Feltöltve: {initialData.uploadedAt || 'Most'}
              </span>
            </div>
          </div>
        </div>

        {/* Egyszerűsítés gomb kapcsoló */}
        <button
          type="button"
          onClick={onToggleSimplified}
          style={{
            background: showSimplified
              ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
              : 'rgba(30, 41, 59, 0.8)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: '600',
            border: showSimplified
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: showSimplified ? '0 0 20px rgba(124, 58, 237, 0.4)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>{showSimplified ? '← Eredeti fókusz' : '✨ Kognitív Egyszerűsítés'}</span>
        </button>
      </div>

      {/* 2. Interaktív 3D Szinaptikus Agy Modell (Megtartva a korábbi kiváló 3D modellt!) */}
      <Brain3DViewer
        synapseRoutes={initialData.cognitive_model?.synapse_routes || initialData.synapses || []}
        documentData={initialData}
        selectedSegment={selectedSegment}
      />

      {/* 3. Szöveges Munkaablakok és Kognitív Kifestés */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showSimplified ? '1fr 1fr' : '1fr',
          gap: '24px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Bal oldali ablak: Eredeti Szöveg Kognitív Kifestéssel */}
        <div
          className="neuro-card"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '520px',
            overflowY: 'auto'
          }}
        >
          {/* Ablak fejléc és kognitív jelmagyarázat */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0
                }}
              >
                Eredeti Szöveg (Kattints a szavakra az agyi áramlás váltásához)
              </h3>
              {selectedSegment && (
                <span
                  style={{
                    fontSize: '11px',
                    color: '#38bdf8',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(56, 189, 248, 0.3)'
                  }}
                >
                  Kijelölve: {selectedSegment.text || 'Normál áramlás'}
                </span>
              )}
            </div>

            {/* Színkód jelmagyarázat */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '11px', color: '#94a3b8' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                Normál szöveg
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EAB308' }} />
                Szakszó
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F97316' }} />
                Munkamemória terhelés
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                Szintaktikai elakadás
              </span>
            </div>
          </div>

          <TextHighlighter
            originalText={initialData.content || initialData.text || ''}
            highlights={effectiveHighlights}
            onSelectHighlight={setSelectedSegment}
            activeHighlight={selectedSegment}
          />
        </div>

        {/* Jobb oldali ablak: Egyszerűsített Szöveg (csak ha be van kapcsolva) */}
        {showSimplified && (
          <div
            className="neuro-card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: '520px',
              overflowY: 'auto',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              background: 'rgba(15, 23, 42, 0.85)',
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
                paddingBottom: '12px'
              }}
            >
              <h3
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#818cf8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>✨</span> NLP Kognitív Egyszerűsítés
              </h3>
              <span className="neuro-pill" style={{ color: '#a5b4fc', borderColor: 'rgba(129, 140, 248, 0.3)' }}>
                Folyékony megértési mód
              </span>
            </div>

            <div
              style={{
                color: '#cbd5e1',
                fontSize: '1.05rem',
                lineHeight: '1.75',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit'
              }}
            >
              {initialData.simplified_text?.simplified_version ||
                initialData.content ||
                'Nincs elérhető egyszerűsítés a dokumentumhoz.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}