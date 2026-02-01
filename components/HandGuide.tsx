
import React from 'react';
import { Finger } from '../types';

interface HandGuideProps {
  activeFinger: Finger | null;
}

const HandGuide: React.FC<HandGuideProps> = ({ activeFinger }) => {
  const getFingerClass = (finger: Finger) => {
    return activeFinger === finger 
      ? 'bg-cyan-500 scale-110 shadow-[0_0_10px_rgba(6,182,212,0.8)]' 
      : 'bg-slate-700';
  };

  return (
    <div className="flex gap-12 items-end justify-center py-4 px-8 bg-slate-900/50 rounded-2xl border border-slate-800">
      {/* Left Hand */}
      <div className="flex items-end gap-2">
        <div className={`w-3 h-8 rounded-full transition-all duration-200 ${getFingerClass('left-pinky')}`} title="Pinky" />
        <div className={`w-3 h-12 rounded-full transition-all duration-200 ${getFingerClass('left-ring')}`} title="Ring" />
        <div className={`w-3 h-14 rounded-full transition-all duration-200 ${getFingerClass('left-middle')}`} title="Middle" />
        <div className={`w-3 h-12 rounded-full transition-all duration-200 ${getFingerClass('left-index')}`} title="Index" />
        <div className={`w-4 h-6 rounded-full transition-all duration-200 ml-4 ${activeFinger === 'thumb' ? 'bg-cyan-500' : 'bg-slate-700'}`} title="Thumb" />
      </div>

      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2 italic">Posture Check</div>

      {/* Right Hand */}
      <div className="flex items-end gap-2">
        <div className={`w-4 h-6 rounded-full transition-all duration-200 mr-4 ${activeFinger === 'thumb' ? 'bg-cyan-500' : 'bg-slate-700'}`} title="Thumb" />
        <div className={`w-3 h-12 rounded-full transition-all duration-200 ${getFingerClass('right-index')}`} title="Index" />
        <div className={`w-3 h-14 rounded-full transition-all duration-200 ${getFingerClass('right-middle')}`} title="Middle" />
        <div className={`w-3 h-12 rounded-full transition-all duration-200 ${getFingerClass('right-ring')}`} title="Ring" />
        <div className={`w-3 h-8 rounded-full transition-all duration-200 ${getFingerClass('right-pinky')}`} title="Pinky" />
      </div>
    </div>
  );
};

export default HandGuide;
