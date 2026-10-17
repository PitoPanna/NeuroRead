import React, { useState } from 'react';
import { axiosClient } from '../api/axiosClient';

const SAMPLE_COGNITIVE_DOC = {
  id: 'demo-sample-01',
  name: 'Kognitiv_Neurobiologia_Pelda.txt',
  filename: 'Kognitiv_Neurobiologia_Pelda.txt',
  size: '14.2 KB',
  type: 'txt',
  uploadedAt: 'Élő bemutató',
  content: `Az emberi agy olvasási mechanizmusa a vizuális ingerfelvétellel veszi kezdetét. Az occipitális látókéreg feldolgozza a betűk kontrasztját és geometriai formáit. Ezt követően az ingerület az arcuate fasciculuson keresztül jut el a Wernicke-területre, ahol a mentális lexikon szavai dekódolódnak. Amikor egyszerű, gyakori szavakkal találkozunk, a megértés szinte automatikusan és minimális kognitív ellenállással zajlik.

Azonban a komplex morfofonológiai struktúrájú terminológiák és az antidiszciplináris szakszavak feldolgozása a dorsolateralis prefrontalis cortex intenzív rekurszív aktivációját indukálja. Ilyenkor a munkamemória kapacitása eléri a túlterheltségi küszöböt, és a Broca-központ szintaktikai újrastrukturálási hurkot indít el. A megértési feszültség addig áll fenn, amíg a szemantikai koherencia helyre nem áll.`,
  cognitive_model: {
    semantic_complexity_score: 8,
    working_memory_load: 'Magas terhelés (Rekurzív hurok)',
    highlights: [
      {
        text: 'komplex morfofonológiai struktúrájú terminológiák',
        color_code: '#EF4444',
        highlight_type: 'llm_cognitive',
        reason: 'Rendkívül nehéz szintaktikai és lexikai elakadás (Magas munkamemória igény)'
      },
      {
        text: 'antidiszciplináris szakszavak',
        color_code: '#F97316',
        highlight_type: 'spacy_difficult',
        reason: 'Ritka összetett szakszó (Wernicke lexikai keresési késleltetés)'
      },
      {
        text: 'dorsolateralis prefrontalis cortex',
        color_code: '#EF4444',
        highlight_type: 'llm_cognitive',
        reason: 'Neuroanatómiai szakszó, erős fogalmi elvonatkoztatási igény'
      },
      {
        text: 'szintaktikai újrastrukturálási hurkot',
        color_code: '#F97316',
        highlight_type: 'llm_cognitive',
        reason: 'Nyelvtani rekonstrukció, belső artikuláció (Broca túlterhelés)'
      },
      {
        text: 'arcuate fasciculuson',
        color_code: '#EAB308',
        highlight_type: 'spacy_difficult',
        reason: 'Anatómiai idegpálya-megnevezés'
      }
    ],
    synapse_routes: [
      { from_area: 'visual_cortex', to_area: 'wernicke_area' },
      { from_area: 'wernicke_area', to_area: 'broca_area' },
      { from_area: 'broca_area', to_area: 'prefrontal_cortex' },
      { from_area: 'prefrontal_cortex', to_area: 'wernicke_area' }
    ]
  },
  simplified_text: {
    simplified_version: `Amikor olvasunk, a szemünk által látott betűket a látókéreg érzékeli, majd a Wernicke-központ felismeri a szavak jelentését. Ha a szöveg egyszerű és érthető, az olvasás gyorsan és könnyen megy.

Ha viszont ritka és bonyolult szakkifejezésekkel találkozunk, a gondolkodásért és a memóriáért felelős homloklebenyünknek (prefrontális kéreg) sokkal többet kell dolgoznia. Ilyenkor a beszédközpont (Broca-terület) újra és újra elolvassa és elemzi a mondatot a fejünkben, amíg meg nem értjük.`
  }
};

export function FileUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const processFile = async (file) => {
    if (!file) return;

    setLoading(true);
    setUploadStatus(`Feltöltés és elemzés: ${file.name}...`);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axiosClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus('Sikeres feldolgozás!');
      if (onUploadSuccess) {
        onUploadSuccess(res.data);
      }
    } catch (err) {
      console.warn('Backend feltöltési hiba, helyi beolvasásra váltunk:', err);
      // Fallback: ha a backend offline, olvassuk be a böngészőben közvetlenül txt esetén
      if (file.name.endsWith('.txt')) {
        const text = await file.text();
        const localDoc = {
          id: 'local-' + Date.now(),
          name: file.name,
          filename: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: 'txt',
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: text
        };
        if (onUploadSuccess) onUploadSuccess(localDoc);
      } else {
        alert('Hiba történt a fájl mentése során: ' + (err.response?.data?.detail || err.message));
      }
    } finally {
      setLoading(false);
      setTimeout(() => setUploadStatus(''), 2000);
    }
  };

  const handleLoadDemo = () => {
    if (onUploadSuccess) {
      onUploadSuccess(SAMPLE_COGNITIVE_DOC);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        width: '100%'
      }}
    >
      {/* High-tech Drag & Drop Scanner Zóna */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
        }}
        style={{
          width: '100%',
          maxWidth: '640px',
          position: 'relative',
          padding: '36px 28px',
          borderRadius: '20px',
          background: isDragging
            ? 'radial-gradient(circle at center, rgba(37, 99, 235, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'radial-gradient(circle at center, rgba(30, 41, 59, 0.4) 0%, rgba(10, 15, 30, 0.8) 100%)',
          border: isDragging
            ? '2px dashed #38bdf8'
            : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isDragging
            ? '0 0 35px rgba(56, 189, 248, 0.3), inset 0 0 20px rgba(56, 189, 248, 0.1)'
            : '0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '18px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Futurisztikus Lézervonal / Szkennelő animáció húzáskor vagy töltéskor */}
        {(isDragging || loading) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)',
              boxShadow: '0 0 12px #38bdf8',
              animation: 'scanline 2s linear infinite'
            }}
          />
        )}

        {/* Ikon lebegő kiber gyűrűvel */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.2))',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
            boxShadow: '0 8px 24px rgba(56, 189, 248, 0.15)'
          }}
        >
          {loading ? (
            <div
              style={{
                width: '28px',
                height: '28px',
                border: '3px solid rgba(56, 189, 248, 0.2)',
                borderTopColor: '#38bdf8',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>

        <div>
          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: '1.2rem',
              fontWeight: '700',
              color: '#f8fafc',
              letterSpacing: '-0.02em'
            }}
          >
            {loading ? uploadStatus : 'Húzd ide a dokumentumot az elemzéshez'}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#94a3b8',
              maxWidth: '420px',
              lineHeight: '1.5'
            }}
          >
            Mesterséges intelligencia alapú kognitív nehézségvizsgálat és szinaptikus agyi áramlás
          </p>
        </div>

        {/* Támogatott kiterjesztés címkék */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="neuro-pill" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            PDF
          </span>
          <span className="neuro-pill" style={{ borderColor: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            DOCX
          </span>
          <span className="neuro-pill" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#6ee7b7' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            TXT
          </span>
        </div>

        {/* Gombok: Fájl tallózás + Próbaszöveg */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
          <label className="neuro-button-primary">
            <span>{loading ? 'Feldolgozás...' : 'Fájl kiválasztása'}</span>
            <input
              type="file"
              disabled={loading}
              style={{ display: 'none' }}
              accept=".docx,.pdf,.txt"
              onChange={(e) => {
                if (e.target.files?.[0]) processFile(e.target.files[0]);
              }}
            />
          </label>

          <button
            type="button"
            onClick={handleLoadDemo}
            className="neuro-button-secondary"
            title="Azonnali kipróbálás előre feltöltött kognitív mintaszöveggel"
          >
            <span>💡 Próbadokumentum betöltése</span>
          </button>
        </div>
      </div>
    </div>
  );
}