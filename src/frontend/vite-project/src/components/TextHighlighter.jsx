import React from 'react';

export default function TextHighlighter({ originalText, highlights }) {
  if (!originalText) return null;

  if (!highlights || highlights.length === 0) {
    return (
      <div className="p-5 bg-slate-800 text-slate-100 rounded-xl shadow-lg border border-slate-700 leading-relaxed text-lg">
        {originalText}
      </div>
    );
  }

  // kiemelendo szavak keresese
  const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);

  const escapedTexts = sortedHighlights
    .map((h) => h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter(Boolean);

  if (escapedTexts.length === 0) {
    return (
      <div className="p-5 bg-slate-800 text-slate-100 rounded-xl shadow-lg border border-slate-700 leading-relaxed text-lg">
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
    <div className="p-6 bg-slate-900 text-slate-100 rounded-xl shadow-xl border border-slate-800 leading-loose text-lg font-sans">
      {parts.map((part, index) => {
        const matchingHighlight = highlightMap.get(part.toLowerCase());

        if (matchingHighlight) {
          return (
            <mark
              key={index}
              style={{ backgroundColor: matchingHighlight.color_code }}
              className="text-slate-950 font-bold px-2 py-0.5 mx-0.5 rounded-md shadow-sm transition-all duration-200 hover:opacity-80 cursor-help inline-block"
              title={`${matchingHighlight.reason} (${matchingHighlight.highlight_type})`}
            >
              {part}
            </mark>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}