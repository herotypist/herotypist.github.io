
import React from 'react';
import { KEYBOARD_LAYOUT } from '../constants';

interface KeyboardProps {
  activeKey: string;
}

const Keyboard: React.FC<KeyboardProps> = ({ activeKey }) => {
  const getKeyWidth = (key: string) => {
    switch (key) {
      case 'Backspace': return 'w-20';
      case 'Tab': return 'w-16';
      case 'CapsLock': return 'w-20';
      case 'Enter': return 'w-24';
      case 'Shift': return 'w-28';
      case 'Space': return 'w-80';
      case 'Ctrl':
      case 'Alt': return 'w-16';
      default: return 'w-12';
    }
  };

  const isPressed = (key: string) => {
    if (key.toLowerCase() === activeKey.toLowerCase()) return true;
    if (key === 'Space' && activeKey === ' ') return true;
    return false;
  };

  return (
    <div className="flex flex-col gap-2 p-6 bg-slate-950/50 rounded-2xl border border-slate-900 shadow-2xl select-none">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 justify-center">
          {row.map((key, keyIndex) => (
            <div
              key={keyIndex}
              className={`
                h-12 flex items-center justify-center rounded-lg text-xs font-black transition-all duration-75 border
                ${getKeyWidth(key)}
                ${isPressed(key) 
                  ? 'bg-cyan-600 text-white border-cyan-400 scale-95 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                  : 'bg-slate-900 text-slate-500 border-slate-800 shadow-inner'}
              `}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
