
import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  className?: string;
  id: string; // The unique ID required by your ad network to target this slot
  htmlContent?: string; // Optional: If the network gives you raw HTML/JS instead of just an ID
  style?: React.CSSProperties;
}

const AdUnit: React.FC<AdUnitProps> = ({ 
  className = "", 
  id, 
  htmlContent,
  style = {} 
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Some networks require you to trigger a refresh or "push" when a component mounts
    if (window.hasOwnProperty('universal_ads_load')) {
      // @ts-ignore
      window.universal_ads_load(id);
    }

    // If raw HTML is provided (like a sponsorship banner or a script snippet)
    if (htmlContent && adRef.current) {
      const range = document.createRange();
      const documentFragment = range.createContextualFragment(htmlContent);
      adRef.current.innerHTML = '';
      adRef.current.appendChild(documentFragment);
    }
  }, [id, htmlContent]);

  return (
    <div className={`universal-ad-slot relative bg-slate-900/40 border border-slate-800/50 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${className}`} style={style}>
      {/* Visual frame for the "Hero" aesthetic */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-500"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-500"></div>
      </div>

      {/* This is the container the Ad Network will look for */}
      <div id={id} ref={adRef} className="w-full h-full flex items-center justify-center">
         {/* If no ad loads, show the "Hero" branded fallback */}
         {!htmlContent && (
           <div className="p-4 text-center">
              <span className="text-[7px] uppercase tracking-[0.4em] text-slate-700 block mb-1 font-black">Hero Asset Slot</span>
              <div className="text-slate-600 text-[10px] italic">Awaiting external synchronization...</div>
           </div>
         )}
      </div>
    </div>
  );
};

export default AdUnit;
