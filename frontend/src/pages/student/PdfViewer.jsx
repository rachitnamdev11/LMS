import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Setup pdf.js worker using the UNPKG CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ url }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="flex flex-col items-center w-full" style={{ userSelect: 'none' }}>
      {/* Controls Header */}
      <div className="flex flex-wrap gap-4 justify-between items-center w-full mb-4 bg-slate-100 dark:bg-dark-800 p-3 rounded-xl border border-slate-200 dark:border-dark-700">
        
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 font-medium rounded-lg shadow-sm border border-slate-200 dark:border-dark-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
          >
            Previous
          </button>
          <span className="text-slate-700 dark:text-slate-300 font-semibold px-4">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button 
            type="button"
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || 1))}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 font-medium rounded-lg shadow-sm border border-slate-200 dark:border-dark-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={zoomOut}
            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 font-bold text-xl rounded-lg shadow-sm border border-slate-200 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-slate-500 font-medium min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button 
            type="button"
            onClick={zoomIn}
            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 font-bold text-xl rounded-lg shadow-sm border border-slate-200 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
            title="Zoom In"
          >
            +
          </button>
        </div>

      </div>

      {/* PDF Canvas Container */}
      <div 
        className="relative bg-white dark:bg-dark-950 p-4 border border-slate-200 dark:border-dark-700 shadow-md rounded-xl overflow-auto w-full flex justify-center min-h-[500px]"
        onContextMenu={(e) => e.preventDefault()} // Block right click
      >
        {/* Transparent overlay blocks interactions with the canvas if needed, though react-pdf renders to canvas implicitly */}
        <div className="absolute inset-0 z-10" onContextMenu={(e) => e.preventDefault()} />
        
        <Document 
          file={url} 
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-full pt-20">
              <svg className="animate-spin h-8 w-8 text-amber-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="text-slate-500 font-medium">Loading PDF document securely...</p>
            </div>
          }
          error={
            <div className="p-10 text-rose-500 font-medium pt-20 text-center">
              Failed to load PDF. The file may be restricted or unavailable.
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            renderTextLayer={false} 
            renderAnnotationLayer={false} 
            className="shadow-sm"
          />
        </Document>
      </div>
    </div>
  );
}
