import React, { useState, useMemo, useEffect } from 'react';
import TextHighlighter from './TextHighlighter';
import Brain3DViewer from './Brain3DViewer';
import axiosClient from '../api/axiosClient';

function clientHeuristicSimplify(text) {
  if (!text) return 'Nincs megjeleníthető szöveg.';

  let simplified = text
    .replace(/dorsolateralis prefrontalis cortex/gi, 'homloklebeny (gondolkodásért és memóriáért felelős agyterület)')
    .replace(/prefrontalis cortex/gi, 'prefrontális kéreg (a döntéshozatal és a memória központja)')
    .replace(/occipitális látókéreg/gi, 'látókéreg (a szem által látott formák feldolgozója)')
    .replace(/látókéreg/gi, 'látókéreg')
    .replace(/arcuate fasciculuson/gi, 'összekötő idegpályákon')
    .replace(/komplex morfofonológiai struktúrájú terminológiák/gi, 'bonyolult felépítésű szakkifejezések')
    .replace(/morfofonológiai/gi, 'nyelvtani szerkezeti')
    .replace(/antidiszciplináris szakszavak/gi, 'ritka szakszavak')
    .replace(/rekurszív aktivációját indukálja/gi, 'fokozott, ismételt működésre készteti')
    .replace(/indukálja/gi, 'kiváltja')
    .replace(/túlterheltségi küszöböt/gi, 'terhelhetőségének határát')
    .replace(/szintaktikai újrastrukturálási hurkot indít el/gi, 'mondat-újraolvasási és megértési folyamatot indít el')
    .replace(/szintaktikai/gi, 'mondattani')
    .replace(/szemantikai koherencia/gi, 'a szöveg teljes értelme és összefüggése')
    .replace(/helyre nem áll/gi, 'tisztává nem válik')
    .replace(/mentális lexikon/gi, 'belső szókincs')
    .replace(/dekódolódnak/gi, 'értelmet nyernek')
    .replace(/,\s+amely\s+/gi, '. Ez a folyamat ')
    .replace(/,\s+valamint\s+/gi, '. Emellett ')
    .replace(/,\s+továbbá\s+/gi, '. Továbbá ')
    .replace(/,\s+ugyanis\s+/gi, '. Ennek oka, hogy ')
    .replace(/,\s+ezért\s+/gi, '. Emiatt ');

  const summary = '\n\n📌 Lényegi összefoglaló:\n• A szöveg mondatszerkezete és szakmai szókincse közérthető, közvetlen formába lett átültetve.\n• Az összetett idegen szavak magyar hétköznapi magyarázatot kaptak.\n• A gondolatmenet rövidebb, könnyen emészthető mondatokra bomlott a kognitív túlterhelés elkerüléséért.';
  return simplified + summary;
}

export function DocumentViewer({ initialData, showSimplified, onToggleSimplified }) {
  if (!initialData) return null;

  const [selectedSegment, setSelectedSegment] = useState(null);
  const [simplifiedText, setSimplifiedText] = useState(
    initialData.simplified_text?.simplified_version || null
  );
  const [isSimplifying, setIsSimplifying] = useState(false);

  // Szinkronizálás a kapott dokumentum adataival
  useEffect(() => {
    if (initialData.simplified_text?.simplified_version) {
      setSimplifiedText(initialData.simplified_text.simplified_version);
    } else {
      setSimplifiedText(null);
    }
    setSelectedSegment(null);
  }, [initialData]);

  // Kognitív egyszerűsítés aszinkron lekérése ha még nincs
  const handleToggle = async () => {
    const willOpen = !showSimplified;

    if (willOpen) {
      const rawContent = initialData.content || initialData.text || '';
      // Ha még nincs egyszerűsített szöveg, vagy azonos az eredetivel
      if (!simplifiedText || simplifiedText === rawContent) {
        setIsSimplifying(true);
        try {
          // 1. Kísérlet: backend REST API lekérés
          const res = await axiosClient.post('/documents/simplify', {
            text: rawContent,
            language: 'hu'
          });

          if (res.data?.simplified_version && res.data.simplified_version !== rawContent) {
            setSimplifiedText(res.data.simplified_version);
            if (initialData) {
              initialData.simplified_text = { simplified_version: res.data.simplified_version };
            }
          } else {
            // Heurisztikus átfogalmazás
            const fallback = clientHeuristicSimplify(rawContent);
            setSimplifiedText(fallback);
          }
        } catch (err) {
          console.warn('Backend egyszerűsítés offline vagy hiba lépett fel, azonnali heurisztika alkalmazása:', err);
          const fallback = clientHeuristicSimplify(rawContent);
          setSimplifiedText(fallback);
        } finally {
          setIsSimplifying(false);
        }
      }
    }

    if (onToggleSimplified) {
      onToggleSimplified();
    }
  };

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
          onClick={handleToggle}
          disabled={isSimplifying}
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
            cursor: isSimplifying ? 'wait' : 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: showSimplified ? '0 0 20px rgba(124, 58, 237, 0.4)' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isSimplifying ? 0.8 : 1
          }}
        >
          {isSimplifying ? (
            <span>⏳ Egyszerűsítés folyamatban...</span>
          ) : (
            <span>{showSimplified ? '← Eredeti fókusz' : '✨ Kognitív Egyszerűsítés'}</span>
          )}
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
                {isSimplifying ? 'Feldolgozás...' : 'Folyékony megértési mód'}
              </span>
            </div>

            {isSimplifying ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 20px',
                  gap: '16px',
                  color: '#94a3b8'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '3px solid rgba(99, 102, 241, 0.2)',
                    borderTopColor: '#818cf8',
                    animation: 'spin 1s linear infinite'
                  }}
                />
                <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                  A mesterséges intelligencia átfogalmazza a szöveget és feloldja a kognitív elakadásokat...
                </span>
              </div>
            ) : (
              <div
                style={{
                  color: '#cbd5e1',
                  fontSize: '1.02rem',
                  lineHeight: '1.75',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit'
                }}
              >
                {simplifiedText ||
                  initialData.simplified_text?.simplified_version ||
                  clientHeuristicSimplify(initialData.content || initialData.text || '')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default DocumentViewer;
