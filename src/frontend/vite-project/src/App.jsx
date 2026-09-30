import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DocumentViewer } from './components/DocumentViewer';

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [showSimplified, setShowSimplified] = useState(false);

  const handleClear = () => {
    setAnalysisData(null);
    setShowSimplified(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Fejléc */}
        <header className="text-center space-y-3 mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-snug max-w-4xl mx-auto">
            NeuroRead
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Cognitive Text Intelligence &amp; Brain Visualization Platform
          </p>
        </header>

        {/* Fő tartalom */}
        <main className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
          
          {/* 1. Feltöltő doboz */}
          <FileUpload onUploadSuccess={(data) => setAnalysisData(data)} />

          {/* 2. Beolvasott dokumentum és opciók */}
          {analysisData && (
            <div className="space-y-4 pt-4 border-t border-gray-800">
              {/* Fejléc sáv jobb oldalra igazított Törlés gombbal */}
              <div className="flex justify-between items-center w-full">
                <h2 className="text-lg font-semibold text-gray-300">
                  Beolvasott dokumentum
                </h2>
                
                {/* Nagyobb, élénkpiros, jobb oldali Törlés gomb */}
                <button
                  onClick={handleClear}
                  className="px-6 py-2.5 text-base font-semibold text-white bg-red-600 hover:bg-red-500 active:scale-95 rounded-lg transition-all shadow-lg hover:shadow-red-600/30 cursor-pointer ml-auto"
                >
                  Törlés
                </button>
              </div>

              {/* Dokumentum és az oldalsó Egyszerűsített Nézet */}
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
  );
}