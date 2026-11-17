import React from 'react';

export default function TextHighlighter({ originalText, highlights, onSelectHighlight, activeHighlight }) {
  if (!originalText) return null;

  if (!highlights || highlights.length === 0) {
    return (
      <div
        onClick={() => onSelectHighlight && onSelectHighlight({ type: 'normal', text: 'Teljes szöveg', difficulty: 2 })}
        style={{
          fontSize: '1.08rem',
          lineHeight: '1.85',
          color: '#e2e8f0',
          cursor: 'pointer',
          whiteSpace: 'pre-wrap'
        }}
        title="Kattints a folyékony kognitív áramlás megtekintéséhez"
      >
        {originalText}
      </div>
    );
  }

  // Kiemelendő kifejezések rendezése a leghosszabbtól a legrövidebbig
  const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);

  const escapedTexts = sortedHighlights
    .map((h) => h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter(Boolean);

  if (escapedTexts.length === 0) {
    return (
      <div
        onClick={() => onSelectHighlight && onSelectHighlight({ type: 'normal', text: 'Teljes szöveg', difficulty: 2 })}
        style={{
          fontSize: '1.08rem',
          lineHeight: '1.85',
          color: '#e2e8f0',
          cursor: 'pointer',
          whiteSpace: 'pre-wrap'
        }}
      >
        {originalText}
      </div>
    );
  }

  const regex = new RegExp(`(${escapedTexts.join('|')})`, 'gi');
  const parts = originalText.split(regex);

  const highlightMap = new Map();
  sortedHighlights.forEach((h) => {
    highlightMap.set(h.text.toLowerCase(), h);
  });

  return (
    <div
      style={{
        fontSize: '1.08rem',
        lineHeight: '1.85',
        color: '#e2e8f0',
        whiteSpace: 'pre-wrap'
      }}
    >
      {parts.map((part, index) => {
        const matchingHighlight = highlightMap.get(part.toLowerCase());

        if (matchingHighlight) {
          const isSelected = activeHighlight?.text?.toLowerCase() === part.toLowerCase();
          const baseColor = matchingHighlight.color_code || '#f59e0b';

          return (
            <mark
              key={index}
              onClick={() => onSelectHighlight && onSelectHighlight(matchingHighlight)}
              style={{
                backgroundColor: `${baseColor}25`,
                color: '#ffffff',
                border: `1px solid ${baseColor}`,
                boxShadow: isSelected
                  ? `0 0 16px ${baseColor}, inset 0 0 8px ${baseColor}40`
                  : `0 0 8px ${baseColor}30`,
                outline: isSelected ? '2px solid #ffffff' : 'none',
                transform: isSelected ? 'scale(1.04)' : 'none',
                padding: '2px 8px',
                margin: '0 3px',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'inline-block'
              }}
              title={`${matchingHighlight.reason || 'Kognitív elakadás'} — Kattints a 3D agy aktiválásához!`}
            >
              {part}
            </mark>
          );
        }

        return (
          <span
            key={index}
            onClick={() => onSelectHighlight && onSelectHighlight({ type: 'easy', text: part, difficulty: 2 })}
            style={{
              cursor: 'pointer',
              transition: 'color 0.15s ease'
            }}
            title="Kattints a folyékony olvasási áramlás megtekintéséhez"
          >
            {part}
          </span>
        );
      })}
    </div>
  );
}