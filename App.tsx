
import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, BookOpen, Layout, History, Settings, Play, ChevronRight, RefreshCw, Lock, AlertCircle, Star, Volume2, Pause, PlayCircle, X, Trash2, BrainCircuit, Keyboard as KeyboardIcon, Hand, MousePointer2
} from 'lucide-react';
import { UserStats, Lesson, HistoryRecord, GameState, Finger } from './types';
import { INITIAL_LESSONS, FINGER_MAP, MOTIVATION_QUOTES } from './constants';
import { soundManager } from './services/audioService';
import Keyboard from './components/Keyboard';
import HandGuide from './components/HandGuide';
import AdUnit from './components/AdPlaceholder'; // Import upgraded component

interface NoticeState {
  message: string;
  allowOverride: boolean;
  targetLesson?: Lesson;
  isRecommendation?: boolean;
}

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
  const [notice, setNotice] = useState<NoticeState | null>(null);
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

  const wipeAllData = () => {
    if (confirm("DANGER: Proceeding will erase all rank progress and XP. Hero status is at stake. Continue?")) {
      localStorage.removeItem(STORAGE_KEY_STATS);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      window.location.reload();
    }
  };

  const nextChar = currentLesson && typedText.length < currentLesson.content.length 
    ? currentLesson.content[typedText.length] 
    : null;

  const activeFinger = nextChar ? FINGER_MAP[nextChar.toLowerCase()] || null : null;

  return (
    <div className="min-h-screen flex flex-col max-w-[1500px] mx-auto px-6 lg:px-12 bg-[#020617] text-slate-100 font-sans antialiased selection:bg-cyan-500/30 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full z-[150] h-1.5 bg-gradient-to-r from-cyan-600 via-emerald-500 to-indigo-600"></div>

      {notice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl">
          <div className="bg-slate-900 border-2 border-slate-700 p-12 rounded-[4rem] max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-10">
              <div className="w-24 h-24 rounded-full flex items-center justify-center ring-[12px] ring-opacity-10 bg-amber-500/10 text-amber-500 ring-amber-500">
                <AlertCircle size={48} />
              </div>
              <h3 className="text-3xl font-black tracking-tighter">Access Restriction</h3>
              <p className="text-slate-400 font-medium leading-relaxed">{notice.message}</p>
              <div className="flex flex-col w-full gap-4">
                <button onClick={() => setNotice(null)} className="w-full py-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-black transition-all">Abort</button>
                {notice.allowOverride && notice.targetLesson && (
                  <button onClick={() => { handleStartLesson(notice.targetLesson!, true); }} className="w-full py-5 rounded-2xl font-black bg-amber-600 hover:bg-amber-500 transition-all shadow-xl">Override Entry</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl">
          <div className="bg-slate-900 border-2 border-slate-700 p-12 rounded-[4rem] max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-10 right-10 p-3 text-slate-500 hover:text-white transition-all"><X size={36} /></button>
            <h3 className="text-4xl font-black mb-12 tracking-tighter">Operational Config</h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-6 bg-slate-800 rounded-3xl border border-slate-700">
                 <div className="flex items-center gap-5">
                   <div className="p-3 bg-cyan-500/10 rounded-xl"><Volume2 size={24} className="text-cyan-400" /></div>
                   <span className="font-bold">Acoustic Feedback</span>
                 </div>
                 <button onClick={() => setStats(s => ({...s, soundEnabled: !s.soundEnabled}))} className={`w-14 h-7 rounded-full transition-all relative ${stats.soundEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                   <div className={`w-5 h-5 bg-white rounded-full transition-all absolute top-1 ${stats.soundEnabled ? 'left-8' : 'left-1'}`} />
                 </button>
               </div>
               <div className="p-8 bg-rose-950/20 border border-rose-900/40 rounded-3xl">
                 <h4 className="text-rose-500 font-black mb-4 flex items-center gap-4 text-sm uppercase tracking-widest"><Trash2 size={20} /> Identity Purge</h4>
                 <button onClick={wipeAllData} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all">Reset All Progression</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Navigation */}
      <header className={`py-8 flex flex-col lg:flex-row items-center justify-between gap-10 border-b-2 border-slate-900/50 mb-12 sticky top-0 bg-[#020617]/95 backdrop-blur-xl z-[100]`}>
        <div className="flex items-center gap-6 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-3xl shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-all">HT</div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter leading-none mb-2">HEROTYPIST</h1>
            <div className="flex items-center gap-4">
               <div className="h-1.5 w-32 bg-slate-900 rounded-full overflow-hidden">
                 <div className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" style={{ width: `${(stats.xp % 2500) / 25}%` }}></div>
               </div>
               <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
                 {currentLesson && activeTab === 'practice' ? `Stage ${currentLesson.order}` : `Rank ${stats.level}`}
               </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
            <Layout size={20} /> <span className="hidden sm:inline">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('lessons')} className={`flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'lessons' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
            <BookOpen size={20} /> <span className="hidden sm:inline">Campaign</span>
          </button>
          <button onClick={() => setActiveTab('practice')} className={`flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'practice' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
            <Play size={20} /> <span className="hidden sm:inline">Combat</span>
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <AdUnit slotId="top-leaderboard" format="horizontal" className="hidden xl:flex w-[468px] h-12" />
          <button onClick={() => setShowSettings(true)} className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 group transition-all">
            <Settings size={24} className="text-slate-500 group-hover:rotate-90 duration-500 transition-transform" />
          </button>
        </div>
      </header>

      <main className={`flex-1`}>
        <div className="flex flex-col xl:flex-row gap-12">
          <div className="flex-1">
            {activeTab === 'lessons' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {INITIAL_LESSONS.map(lesson => {
                  const isLocked = !stats.unlockedStages.includes(lesson.order);
                  const stars = stats.lessonStars[lesson.id] || 0;
                  return (
                    <div 
                      key={lesson.id} 
                      className={`group relative bg-slate-900/50 border-2 ${isLocked ? 'border-slate-800/50' : 'border-slate-800 hover:border-cyan-500/50'} p-8 rounded-[3rem] transition-all cursor-pointer shadow-xl overflow-hidden active:scale-[0.98]`}
                      onClick={() => handleStartLesson(lesson)}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px] flex items-center justify-center z-10">
                          <Lock size={40} className="text-slate-600 group-hover:text-cyan-400 transition-all" />
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${isLocked ? 'text-slate-600 border-slate-800' : 'text-cyan-500 border-cyan-800/30 bg-cyan-950/20'}`}>Stage {lesson.order}</span>
                        <div className="flex gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-800'} />)}
                        </div>
                      </div>
                      <h3 className={`text-2xl font-black mb-2 tracking-tight ${isLocked ? 'text-slate-500' : 'text-white'}`}>{lesson.title}</h3>
                      <p className={`text-xs mb-8 line-clamp-2 leading-relaxed ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>{lesson.description}</p>
                      <div className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${isLocked ? 'bg-slate-800/50 text-slate-700' : 'bg-slate-800 group-hover:bg-cyan-600 text-white'}`}>
                        {isLocked ? 'Access Denied' : 'Enter Trial'} <ChevronRight size={18} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : activeTab === 'practice' && currentLesson ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-500 relative">
                
                {/* Visual Feedback Bar */}
                <div className="flex flex-wrap items-center justify-between gap-6 bg-slate-900/80 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-800 sticky top-4 z-50 shadow-2xl">
                  <div className="flex gap-12 items-center">
                    <div className="text-center">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Velocity</div>
                      <div className="text-2xl font-black text-cyan-400 font-mono tracking-tighter">{stats.wpm} <span className="text-[10px] text-slate-600 font-sans">WPM</span></div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Precision</div>
                      <div className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">{stats.realAccuracy}%</div>
                    </div>
                    <div className="h-10 w-px bg-slate-800 mx-2 hidden md:block"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Operation Stage {currentLesson.order}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setShowKeyboard(!showKeyboard)} className={`p-2.5 rounded-xl border transition-all ${showKeyboard ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><KeyboardIcon size={18} /></button>
                    <button onClick={() => setShowHands(!showHands)} className={`p-2.5 rounded-xl border transition-all ${showHands ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><Hand size={18} /></button>
                    <button onClick={() => setGameState(gameState === GameState.PAUSED ? GameState.PLAYING : GameState.PAUSED)} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all">
                      {gameState === GameState.PAUSED ? <PlayCircle size={18} /> : <Pause size={18} />}
                    </button>
                    <button onClick={() => handleStartLesson(currentLesson)} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all"><RefreshCw size={18} /></button>
                  </div>
                </div>

                <div className="relative p-6 md:p-10 bg-[#020617] rounded-[3rem] border-2 border-slate-900 shadow-inner flex flex-col items-center justify-center min-h-[750px] max-h-[90vh] overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.03),transparent)] pointer-events-none"></div>

                  {!isInputFocused && gameState === GameState.PLAYING && (
                    <div 
                      className="absolute inset-0 z-[110] bg-slate-950/60 backdrop-blur-[4px] cursor-pointer flex flex-col items-center justify-center animate-in fade-in duration-300"
                      onClick={() => { textInputRef.current?.focus(); setIsInputFocused(true); }}
                    >
                      <MousePointer2 size={40} className="text-cyan-400 mb-2 animate-bounce" />
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400">Initialize Keyboard Link</p>
                    </div>
                  )}
                  
                  {gameState === GameState.PAUSED && (
                     <div className="absolute inset-0 z-[120] bg-slate-950/90 backdrop-blur-xl rounded-[3rem] flex flex-col items-center justify-center">
                       <BrainCircuit size={64} className="text-cyan-500 mb-8 animate-pulse" />
                       <h2 className="text-4xl font-black mb-10 tracking-tighter text-white uppercase">Neural Link Suspended</h2>
                       <button onClick={() => setGameState(GameState.PLAYING)} className="px-12 py-5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black flex items-center gap-4 text-lg transition-all shadow-xl">Reconnect Hero</button>
                     </div>
                  )}

                  {gameState === GameState.FINISHED ? (
                    <div className="flex flex-col items-center justify-center space-y-8 py-8 w-full animate-in zoom-in-95 duration-500 relative z-10">
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-24 h-24 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                           <Trophy size={40} className="animate-bounce" />
                         </div>
                         <div className="flex gap-2">
                            {[1,2,3,4,5].map(i => <Star key={i} size={24} className={i <= (history[0]?.stars || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-800'} />)}
                         </div>
                      </div>
                      
                      <div className="text-center">
                        <h2 className="text-4xl font-black mb-2 tracking-tighter text-white uppercase">Combat Briefing Result</h2>
                        <p className="text-slate-500 italic text-base max-w-xl mx-auto leading-relaxed">"{quote}"</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-center">
                          <div className="text-4xl font-black text-cyan-400 font-mono tracking-tighter">{stats.wpm}</div>
                          <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-2">Words Per Minute</div>
                        </div>
                        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-center">
                          <div className="text-4xl font-black text-emerald-400 font-mono tracking-tighter">{stats.realAccuracy}%</div>
                          <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-2">Precision Rating</div>
                        </div>
                      </div>

                      <AdUnit slotId="post-game-rectangle" format="rectangle" className="w-full max-w-[300px] h-[250px]" />

                      <div className="flex flex-wrap gap-4 justify-center pt-4">
                        <button onClick={() => handleStartLesson(currentLesson)} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-black flex items-center gap-3 transition-all"><RefreshCw size={18} /> Re-Trial</button>
                        <button 
                          onClick={() => {
                            const next = INITIAL_LESSONS.find(l => l.order === currentLesson!.order + 1);
                            if (next) handleStartLesson(next);
                            else setActiveTab('lessons');
                          }}
                          className="px-12 py-4 rounded-xl font-black bg-cyan-600 hover:bg-cyan-500 flex items-center gap-3 text-lg transition-all shadow-lg shadow-cyan-900/20"
                        >
                          Next Mission <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center py-4">
                      {/* TEXT AREA: Strictly limited to 3 lines */}
                      <div className="w-full max-w-5xl mx-auto flex flex-wrap justify-center content-center gap-x-1.5 gap-y-4 text-3xl md:text-4xl lg:text-5xl font-mono leading-snug mb-10 select-none relative z-10 font-bold overflow-hidden h-[160px] md:h-[220px]">
                        {currentLesson.content.split('').map((char, index) => {
                          let colorClass = 'text-slate-800';
                          if (index < typedText.length) {
                            colorClass = typedText[index] === char ? 'text-slate-200' : 'text-rose-500 bg-rose-500/10 px-0.5 rounded-sm';
                          } else if (index === typedText.length) {
                            colorClass = 'text-cyan-400 bg-cyan-400/10 ring-2 ring-cyan-400/40 rounded-sm px-1 animate-pulse';
                          }
                          return (
                            <span key={index} className={`${colorClass} transition-colors duration-75`}>
                              {char === ' ' ? '␣' : char}
                            </span>
                          );
                        })}
                      </div>

                      {/* GUIDES AREA */}
                      <div className="w-full flex flex-col items-center justify-center gap-8 transition-all duration-500">
                        {showHands && (
                          <div className="w-full max-w-xl opacity-90 animate-in slide-in-from-bottom-2 duration-300">
                            <HandGuide activeFinger={activeFinger} />
                          </div>
                        )}
                        {showKeyboard && (
                          <div className="w-full max-w-3xl opacity-90 animate-in slide-in-from-bottom-4 duration-500">
                            <Keyboard activeKey={nextChar || ''} />
                          </div>
                        )}
                      </div>

                      <input 
                        ref={textInputRef} 
                        type="text" 
                        className="opacity-0 absolute inset-0 w-full h-full cursor-default z-0" 
                        onKeyDown={handleKeyDown} 
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={(e) => {
                          const target = e.relatedTarget as HTMLElement;
                          if (target && (target.tagName === 'BUTTON' || target.closest('header'))) return;
                          setIsInputFocused(false);
                        }}
                        autoFocus 
                        autoComplete="off" 
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in duration-700">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-16 rounded-[4rem] border-2 border-slate-800 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-24 -right-24 p-16 opacity-[0.02] group-hover:rotate-[20deg] transition-transform duration-1000"><Trophy size={400} /></div>
                  <div className="relative z-10">
                    <h2 className="text-6xl font-black mb-8 tracking-tighter leading-tight bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">Enter the Grid</h2>
                    <p className="text-slate-400 mb-14 max-w-2xl text-2xl leading-relaxed font-medium">Stage {Math.max(...stats.unlockedStages)} is your current operational objective.</p>
                    <div className="flex flex-wrap gap-8">
                      <button onClick={() => setActiveTab('lessons')} className="px-14 py-7 bg-cyan-600 hover:bg-cyan-500 rounded-3xl font-black shadow-[0_0_40px_rgba(6,182,212,0.3)] text-2xl group flex items-center gap-4 transition-all">
                        Launch Campaign <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
                      </button>
                      <button onClick={() => setActiveTab('practice')} className="px-14 py-7 bg-slate-800 hover:bg-slate-700 rounded-3xl font-black text-2xl border border-slate-700 transition-all">Fast Trial</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800/50 text-center shadow-lg">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Historical WPM</div>
                    <div className="text-6xl font-black text-cyan-400 font-mono tracking-tighter">{history.length > 0 ? Math.round(history.reduce((a,b)=>a+b.wpm,0)/history.length) : 0}</div>
                  </div>
                  <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800/50 text-center shadow-lg">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Stages Mastered</div>
                    <div className="text-6xl font-black text-emerald-500 font-mono tracking-tighter">{stats.unlockedStages.length}</div>
                  </div>
                  <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800/50 text-center shadow-lg">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Hero Rank</div>
                    <div className="text-6xl font-black text-indigo-400 font-mono tracking-tighter">{stats.level}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <aside className="xl:w-[400px] space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <AdUnit slotId="sidebar-main-skyscraper" format="vertical" className="h-[600px] rounded-[3rem] border border-slate-800 shadow-2xl" />
            
            <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800/50 shadow-lg">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-3"><BrainCircuit size={16} /> Operational Doctrine</h4>
               <p className="text-lg text-slate-400 italic leading-relaxed font-serif">"The shadow moves because the light commands it. Your fingers move because the mind has already arrived at the key."</p>
            </div>

            {history.length > 0 && (
              <div className="bg-slate-900/80 p-10 rounded-[3rem] border-2 border-slate-800 relative overflow-hidden group shadow-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Tactical Logs</h4>
                <div className="space-y-6">
                  {history.slice(0, 5).map((h, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="text-sm font-bold">{h.wpm} WPM</div>
                        <div className="text-[9px] text-slate-600 uppercase tracking-widest">{h.date.split(',')[0]}</div>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(j => <Star key={j} size={8} className={j <= h.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-800'} />)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <AdUnit slotId="sidebar-bottom-square" format="rectangle" className="h-60 rounded-3xl border border-slate-800 shadow-xl" />
          </aside>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-[#020617]/95 backdrop-blur-md border-t border-slate-900 py-3 z-[110] px-10 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex-1 max-w-5xl">
          <AdUnit slotId="footer-anchored-banner" format="horizontal" className="h-20 border-0 bg-slate-900/20" />
        </div>
        <div className="hidden lg:flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-700 ml-6">
          <span>&copy; 2025 HERO COLLECTIVE</span>
        </div>
      </div>

      <footer className="py-20 border-t border-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-12 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] pb-40">
        <div className="flex items-center gap-10 flex-wrap justify-center">
          <span className="text-slate-500 tracking-tighter text-xl font-black">HEROTYPIST</span>
          <a href="#" className="hover:text-cyan-400 transition-colors">Academy</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Protocol</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Grid</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
