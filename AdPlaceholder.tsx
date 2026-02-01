
import React, { useEffect } from 'react';

interface AdUnitProps {
  className?: string;
  slotId?: string; // The specific data-ad-slot from your AdSense dashboard
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
}

const AdUnit: React.FC<AdUnitProps> = ({ 
  className = "", 
  slotId = "default-slot", 
  format = "auto",
  style = {} 
}) => {
  useEffect(() => {
    try {
      // Trigger Google AdSense push
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdBlocker detected or AdSense not loaded.");
    }
  }, []);

  return (
    <div className={`ad-container relative bg-slate-900/40 border border-slate-800/50 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${className}`} style={style}>
      {/* Background decoration to make ads feel integrated */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-cyan-500"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-cyan-500"></div>
      </div>

      {/* The Actual AdSense Tag */}
      <ins className="adsbygoogle w-full h-full"
           style={{ display: 'block', ...style }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot={slotId}
           data-ad-format={format}
           data-full-width-responsive="true"></ins>

      {/* Hero Fallback UI (Visible only if ad is empty or blocked) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1] p-4 text-center">
        <div>
          <span className="text-[8px] uppercase tracking-[0.3em] text-slate-600 block mb-1 font-black">Tactical Briefing</span>
          <div className="text-slate-500 text-[11px] italic font-medium leading-tight">
            Supporting Hero Operations...
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdUnit;
