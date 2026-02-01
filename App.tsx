
import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, BookOpen, Layout, History, Settings, Play, ChevronRight, RefreshCw, Lock, AlertCircle, Star, Volume2, Pause, PlayCircle, X, Trash2, BrainCircuit, Keyboard as KeyboardIcon, Hand, MousePointer2
} from 'lucide-react';
import { UserStats, Lesson, HistoryRecord, GameState, Finger } from './types';
import { INITIAL_LESSONS, FINGER_MAP, MOTIVATION_QUOTES } from './constants';
import { soundManager } from './services/audioService.ts';
import Keyboard from './components/Keyboard';
import HandGuide from './components/HandGuide';
import AdUnit from './components/AdPlaceholder';

/* 
  NON-DEVELOPER GUIDE:
  To show ads, find the 'AdUnit' components below and paste the code your ad network 
  gives you into the 'htmlContent' property. 
  
  Example: 
  htmlContent={`<script src="..."></script>`}
*/

const calculateStars = (wpm: number, accuracy: number, stage: number, level: number): number => {
  const targetWpm = 10 + (stage * 0.5) + (level * 1.5);
  if (accuracy < 80) return 1;
  if (accuracy < 90) return 2;
  let stars = 3;
  if (accuracy >= 96 && wpm >= targetWpm) stars = 4;
  if (accuracy >= 98 && wpm >= targetWpm * 1.4) stars = 5;
  return stars;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lessons' | 'practice' | 'history'>('dashboard');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [showHands, setShowHands] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(true);

  const STORAGE_KEY_STATS = 'herotypist-stats-v12';
  const STORAGE_KEY_HISTORY = 'herotypist-history-v12';

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.unlockedStages) {
        parsed.unlockedStages = Array.from({length: parsed.unlockedLevel || 1}, (_, i) => i + 1);
      }
      return parsed;
    }
    return {
      wpm: 0, accuracy: 100, realAccuracy: 100, totalKeys: 0, totalKeystrokes: 0,
      errorCount: 0, level: 1, xp: 0, unlockedStages: [1], lessonStars: {}, soundEnabled: true
    };
  });
  
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [notice, setNotice] = useState<{message: string; allowOverride: boolean; targetLesson?: Lesson} | null>(null);
  const [quote, setQuote] = useState('');
  
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    soundManager.setEnabled(stats.soundEnabled);
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && gameState === GameState.PLAYING) {
        setGameState(GameState.PAUSED);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.IDLE || gameState === GameState.FINISHED) {
      setQuote(MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]);
    }
  }, [gameState]);

  useEffect(() => {
    const focusInput = () => {
      if (activeTab === 'practice' && gameState !== GameState.FINISHED && textInputRef.current) {
        const active = document.activeElement;
        const isInteractive = active?.tagName === 'BUTTON' || active?.tagName === 'INPUT' && active !== textInputRef.current;
        if (!isInteractive && active !== textInputRef.current) {
          textInputRef.current.focus();
          setIsInputFocused(true);
        }
      }
    };
    focusInput();
    const interval = setInterval(focusInput, 300); 
    return () => clearInterval(interval);
  }, [gameState, activeTab]);

  const handleStartLesson = (lesson: Lesson, force: boolean = false) => {
    const isLocked = !stats.unlockedStages.includes(lesson.order);
    if (!force && isLocked) {
      setNotice({
        message: `Stage ${lesson.order} is restricted. Proceed anyway?`,
        allowOverride: true,
        targetLesson: lesson
      });
      return;
    }
    setCurrentLesson(lesson);
    setTypedText('');
    setStartTime(null);
    setGameState(GameState.PLAYING);
    setStats(prev => ({ ...prev, wpm: 0, accuracy: 100, realAccuracy: 100, errorCount: 0, totalKeystrokes: 0 }));
    setActiveTab('practice');
    setNotice(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!currentLesson || (gameState !== GameState.PLAYING && gameState !== GameState.PAUSED)) return;
    if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);

    const charPressed = e.key;
    const targetChar = currentLesson.content[typedText.length];

    if (charPressed === 'Backspace') {
      if (typedText.length > 0) {
        setTypedText(prev => prev.slice(0, -1));
        setStats(prev => ({ ...prev, totalKeystrokes: prev.totalKeystrokes + 1 }));
      }
      return;
    }
    if (charPressed.length > 1) return; 

    e.preventDefault();
    const currentTime = Date.now();
    if (!startTime) setStartTime(currentTime);

    const isCorrect = charPressed === targetChar;
    if (isCorrect) soundManager.playCorrect();
    else {
      soundManager.playError();
      setStats(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
    }

    const newTypedText = typedText + charPressed;
    setTypedText(newTypedText);
    
    const newTotalKeystrokes = stats.totalKeystrokes + 1;
    const timeInMinutes = (currentTime - (startTime || currentTime)) / 60000;
    const wpm = Math.round((newTypedText.length / 5) / (timeInMinutes || 0.0001));
    const matches = newTypedText.split('').filter((c, i) => c === currentLesson.content[i]).length;
    const currentAccuracy = Math.round((matches / (newTypedText.length || 1)) * 100);
    const currentErrorCount = stats.errorCount + (isCorrect ? 0 : 1);
    const realAcc = Math.max(0, Math.round(((newTotalKeystrokes - currentErrorCount) / newTotalKeystrokes) * 100));

    setStats(prev => ({
      ...prev, wpm, accuracy: currentAccuracy, realAccuracy: realAcc,
      totalKeystrokes: newTotalKeystrokes, errorCount: currentErrorCount
    }));

    if (newTypedText.length === currentLesson.content.length) {
      finishLesson(wpm, realAcc, currentAccuracy);
    }
  };

  const finishLesson = (finalWpm: number, finalRealAcc: number, finalAccuracy: number) => {
    setGameState(GameState.FINISHED);
    const earnedStars = calculateStars(finalWpm, finalRealAcc, currentLesson!.order, stats.level);
    const newRecord: HistoryRecord = { 
      date: new Date().toLocaleString(), wpm: finalWpm, accuracy: finalAccuracy, 
      realAccuracy: finalRealAcc, lessonId: currentLesson!.id, stars: earnedStars
    };
    setHistory(prev => [newRecord, ...prev].slice(0, 50));
    const hasPassed = earnedStars >= 3;
    setStats(prev => {
      const nextStage = currentLesson!.order + 1;
      const updatedStages = [...prev.unlockedStages];
      if (hasPassed && !updatedStages.includes(nextStage)) updatedStages.push(nextStage);
      return {
        ...prev, xp: prev.xp + (earnedStars * 75) + 50,
        level: Math.floor((prev.xp + 500) / 2500) + 1,
        unlockedStages: updatedStages,
        lessonStars: { ...prev.lessonStars, [currentLesson!.id]: Math.max(prev.lessonStars[currentLesson!.id] || 0, earnedStars) }
      };
    });
  };

  const nextChar = currentLesson && typedText.length < currentLesson.content.length 
    ? currentLesson.content[typedText.length] 
    : null;

  const activeFinger = nextChar ? FINGER_MAP[nextChar.toLowerCase()] || null : null;

  return (
    <div className="min-h-screen flex flex-col max-w-[1500px] mx-auto px-6 lg:px-12 bg-[#020617] text-slate-100 font-sans antialiased selection:bg-cyan-500/30 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full z-[150] h-1.5 bg-gradient-to-r from-cyan-600 via-emerald-500 to-indigo-600"></div>

      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl">
          <div className="bg-slate-900 border-2 border-slate-700 p-12 rounded-[4rem] max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-10 right-10 p-3 text-slate-500 hover:text-white"><X size={36} /></button>
            <h3 className="text-4xl font-black mb-12 tracking-tighter">Command Center</h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-6 bg-slate-800 rounded-3xl border border-slate-700">
                 <div className="flex items-center gap-5">
                   <div className="p-3 bg-cyan-500/10 rounded-xl"><Volume2 size={24} className="text-cyan-400" /></div>
                   <span className="font-bold">Acoustics</span>
                 </div>
                 <button onClick={() => setStats(s => ({...s, soundEnabled: !s.soundEnabled}))} className={`w-14 h-7 rounded-full transition-all relative ${stats.soundEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                   <div className={`w-5 h-5 bg-white rounded-full transition-all absolute top-1 ${stats.soundEnabled ? 'left-8' : 'left-1'}`} />
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <header className={`py-8 flex flex-col lg:flex-row items-center justify-between gap-10 border-b-2 border-slate-900/50 mb-12 sticky top-0 bg-[#020617]/95 backdrop-blur-xl z-[100]`}>
        <div className="flex items-center gap-6 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-3xl shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-110">HT</div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter leading-none mb-2 uppercase">HEROTYPIST</h1>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Rank {stats.level} Mastery</span>
            </div>
          </div>
        </div>

        <nav className="flex items-center bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
            <Layout size={20} /> <span className="hidden sm:inline">Home</span>
          </button>
          <button onClick={() => setActiveTab('lessons')} className={`flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'lessons' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
            <BookOpen size={20} /> <span className="hidden sm:inline">Path</span>
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {/* HEADER AD: Paste your Adsterra/A-ads header banner code in htmlContent */}
          <AdUnit id="header-universal-slot" className="hidden xl:flex w-[468px] h-12" htmlContent={``} />
          
          <button onClick={() => setShowSettings(true)} className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 group">
            <Settings size={24} className="text-slate-500 group-hover:rotate-90 duration-500" />
          </button>
        </div>
      </header>

      <main className={`flex-1`}>
        <div className="flex flex-col xl:flex-row gap-12">
          <div className="flex-1">
            {activeTab === 'lessons' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                {INITIAL_LESSONS.map(lesson => {
                  const isLocked = !stats.unlockedStages.includes(lesson.order);
                  return (
                    <div key={lesson.id} className={`group relative bg-slate-900/50 border-2 ${isLocked ? 'border-slate-800/50' : 'border-slate-800 hover:border-cyan-500/50'} p-8 rounded-[3rem] transition-all cursor-pointer shadow-xl overflow-hidden`} onClick={() => handleStartLesson(lesson)}>
                      {isLocked && <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px] flex items-center justify-center z-10"><Lock size={40} className="text-slate-600" /></div>}
                      <h3 className="text-2xl font-black mb-2 tracking-tight">Stage {lesson.order}: {lesson.title}</h3>
                      <p className="text-xs text-slate-400 mb-8">{lesson.description}</p>
                      <div className="w-full py-4 rounded-xl bg-slate-800 group-hover:bg-cyan-600 text-white font-black text-center text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">Enter <ChevronRight size={14} /></div>
                    </div>
                  );
                })}
              </div>
            ) : activeTab === 'practice' && currentLesson ? (
              <div className="space-y-4 relative">
                <div className="flex flex-wrap items-center justify-between gap-6 bg-slate-900/80 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-800 sticky top-4 z-50 shadow-2xl">
                  <div className="flex gap-10 items-center">
                    <div className="text-center"><div className="text-2xl font-black text-cyan-400 font-mono">{stats.wpm}</div><div className="text-[8px] uppercase text-slate-500">WPM</div></div>
                    <div className="text-center"><div className="text-2xl font-black text-emerald-400 font-mono">{stats.realAccuracy}%</div><div className="text-[8px] uppercase text-slate-500">Accuracy</div></div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setShowKeyboard(!showKeyboard)} className={`p-2.5 rounded-xl border ${showKeyboard ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}><KeyboardIcon size={18} /></button>
                    <button onClick={() => setShowHands(!showHands)} className={`p-2.5 rounded-xl border ${showHands ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}><Hand size={18} /></button>
                    <button onClick={() => setGameState(gameState === GameState.PAUSED ? GameState.PLAYING : GameState.PAUSED)} className="p-2.5 bg-slate-800 rounded-xl"><Pause size={18} /></button>
                  </div>
                </div>

                <div className="relative p-10 bg-[#020617] rounded-[3rem] border-2 border-slate-900 flex flex-col items-center justify-center min-h-[700px]">
                  {!isInputFocused && gameState === GameState.PLAYING && (
                    <div className="absolute inset-0 z-[110] bg-slate-950/60 backdrop-blur-[4px] cursor-pointer flex flex-col items-center justify-center" onClick={() => { textInputRef.current?.focus(); setIsInputFocused(true); }}>
                      <MousePointer2 size={40} className="text-cyan-400 mb-2 animate-bounce" />
                      <p className="text-xs font-black uppercase text-cyan-400 tracking-widest">Synchronize Keyboard</p>
                    </div>
                  )}

                  {gameState === GameState.FINISHED ? (
                    <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-in zoom-in-95">
                      <div className="w-20 h-20 bg-cyan-600 rounded-3xl flex items-center justify-center text-white"><Trophy size={40} /></div>
                      <div className="text-center"><h2 className="text-4xl font-black uppercase">Mission Complete</h2><p className="text-slate-500 italic">"{quote}"</p></div>
                      
                      {/* POST-GAME AD: Paste your square banner code in htmlContent below */}
                      <AdUnit id="post-game-universal-rectangle" className="w-[300px] h-[250px]" htmlContent={``} />
                      
                      <div className="flex gap-4">
                        <button onClick={() => handleStartLesson(currentLesson)} className="px-8 py-4 bg-slate-800 rounded-xl font-black">Retry</button>
                        <button onClick={() => setActiveTab('lessons')} className="px-8 py-4 bg-cyan-600 rounded-xl font-black">Next Task</button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center">
                      <div className="w-full max-w-5xl flex flex-wrap justify-center gap-x-1.5 gap-y-4 text-4xl font-mono leading-snug mb-10 h-[180px] overflow-hidden content-center">
                        {currentLesson.content.split('').map((char, index) => {
                          let cls = index < typedText.length ? (typedText[index] === char ? 'text-slate-200' : 'text-rose-500 bg-rose-500/10 px-0.5') : (index === typedText.length ? 'text-cyan-400 bg-cyan-400/10 ring-2 ring-cyan-400/40 rounded px-1' : 'text-slate-800');
                          return <span key={index} className={cls}>{char === ' ' ? '␣' : char}</span>;
                        })}
                      </div>
                      <div className="w-full flex flex-col items-center gap-8">
                        {showHands && <HandGuide activeFinger={activeFinger} />}
                        {showKeyboard && <Keyboard activeKey={nextChar || ''} />}
                      </div>
                      <input ref={textInputRef} type="text" className="opacity-0 absolute inset-0 w-full h-full cursor-default" onKeyDown={handleKeyDown} onFocus={() => setIsInputFocused(true)} onBlur={(e) => { if (e.relatedTarget?.tagName !== 'BUTTON') setIsInputFocused(false); }} autoFocus autoComplete="off" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-16 rounded-[4rem] border-2 border-slate-800 shadow-2xl flex flex-col items-start">
                  <h2 className="text-6xl font-black mb-8 tracking-tighter">Enter the Grid</h2>
                  <p className="text-slate-400 text-xl mb-12">Your fingers are your weapons. Precision is your shield.</p>
                  <button onClick={() => setActiveTab('lessons')} className="px-14 py-6 bg-cyan-600 rounded-2xl font-black text-xl shadow-xl shadow-cyan-900/20 flex items-center gap-3">Launch Trials <ChevronRight /></button>
                </div>
              </div>
            )}
          </div>
          
          <aside className="xl:w-[400px] space-y-8">
            {/* SIDEBAR AD: Paste your tall skyscraper banner code in htmlContent below */}
            <AdUnit id="sidebar-universal-skyscraper" className="h-[600px] shadow-2xl" htmlContent={``} />
            
            <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800/50 shadow-lg">
               <h4 className="text-[10px] font-black uppercase text-slate-500 mb-6 flex items-center gap-3"><BrainCircuit size={16} /> Protocol</h4>
               <p className="text-lg text-slate-400 italic leading-relaxed">"Focus on the rhythm. Speed is a byproduct of perfect accuracy."</p>
            </div>
          </aside>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-[#020617]/95 backdrop-blur-md border-t border-slate-900 py-3 z-[110] px-10 flex items-center justify-between">
        <div className="flex-1 max-w-5xl">
          {/* FOOTER AD: Paste your horizontal banner code in htmlContent below */}
          <AdUnit id="footer-universal-banner" className="h-16 border-0 bg-slate-900/20" htmlContent={``} />
        </div>
        <div className="text-[9px] font-black uppercase text-slate-700 ml-6">© 2025 HERO COLLECTIVE</div>
      </div>
    </div>
  );
};

export default App;
