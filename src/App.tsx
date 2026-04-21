import { useState, useEffect } from 'react';
import { curriculum } from './data/curriculum';
import { LessonBlock, QuizBlock, CodeExerciseBlock } from './components/Activities';
import { BookOpen, CheckCircle2, ChevronRight, Circle, Code2, GraduationCap, LayoutPanelLeft, Trophy, Loader2, Settings, Key, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { generateDayContent, UserProfile } from './services/ai';
import { Onboarding } from './components/Onboarding';

type SectionType = 'lesson' | 'quiz' | 'exercise' | 'completed';

function App() {
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [currentSection, setCurrentSection] = useState<SectionType>('lesson');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeData, setActiveData] = useState(curriculum);
  const [isLoadingDay, setIsLoadingDay] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('USER_GEMINI_API_KEY') || '');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cIn30DaysProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const handleOnboardingComplete = (profile: UserProfile, apiKey: string) => {
    setUserProfile(profile);
    localStorage.setItem('cIn30DaysProfile', JSON.stringify(profile));
    if (apiKey) {
      setUserApiKey(apiKey);
      localStorage.setItem('USER_GEMINI_API_KEY', apiKey);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('USER_GEMINI_API_KEY', userApiKey);
    if (userProfile) {
      localStorage.setItem('cIn30DaysProfile', JSON.stringify(userProfile));
    }
    setIsSettingsOpen(false);
  };

  // Load progress
  useEffect(() => {
     const saved = localStorage.getItem('cIn30DaysProgress');
     if (saved) {
         try {
             const parsed = JSON.parse(saved);
             if (Array.isArray(parsed)) setCompletedDays(parsed);
         } catch(e) {}
     }
  }, []);

  // Save progress
  useEffect(() => {
      localStorage.setItem('cIn30DaysProgress', JSON.stringify(completedDays));
  }, [completedDays]);

  const activeDay = activeData.find(d => d.day === currentDay) || activeData[0];

  useEffect(() => {
      // If we don't have the content for the current day loaded yet, fetch it
      if (userProfile && !activeDay.lessonMarkdown) {
          setIsLoadingDay(true);
          generateDayContent(activeDay.title, activeDay.day, userProfile).then((content) => {
              if (content) {
                  // Merge content back in
                  setActiveData(prev => prev.map(d => 
                      d.day === activeDay.day ? { ...d, ...content } : d
                  ));
              }
              setIsLoadingDay(false);
          });
      }
  }, [currentDay, activeDay]);

  const handleCompleteLesson = () => setCurrentSection('quiz');
  const handleCompleteQuiz = () => setCurrentSection('exercise');
  const handleCompleteExercise = () => {
      setCurrentSection('completed');
      if (!completedDays.includes(currentDay)) {
          setCompletedDays([...completedDays, currentDay]);
      }
      
      // FIRE CONFETTI!
      confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899']
      });
  };

  const jumpToDay = (day: number) => {
      setCurrentDay(day);
      setCurrentSection('lesson');
  };

  const currentStreak = completedDays.length > 0 ? completedDays.length : 0; // Simplified
  const progressPct = Math.round((completedDays.length / 30) * 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 text-slate-50 border-b border-slate-800 sticky top-0 z-20 flex items-center h-16">
         <div className="flex-1 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-md md:hidden">
                  <LayoutPanelLeft className="w-5 h-5" />
               </button>
               <div className="bg-indigo-500 text-white p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Code2 className="w-5 h-5" />
               </div>
               <h1 className="font-bold text-lg hidden sm:block tracking-tight text-white">C in 30 Days</h1>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Daily Streak</span>
                    <span className="text-sm font-bold text-indigo-400 flex items-center gap-1">
                        🔥 {currentStreak} Days
                    </span>
                </div>
                <div className="w-[1px] h-8 bg-slate-800 hidden md:block"></div>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-slate-400 hidden md:block">
                       {completedDays.length} / 30 Completed
                    </div>
                    <div className="w-24 md:w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-700 ease-out" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                       {progressPct}%
                    </div>
                </div>
                <div className="w-[1px] h-8 bg-slate-800 hidden md:block"></div>
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Settings"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
         </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'w-full md:w-72' : 'w-0 overflow-hidden'} bg-white border-r border-slate-200 transition-all duration-300 flex-shrink-0 z-10 md:relative absolute inset-y-0 shadow-xl md:shadow-none`}>
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                 <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                     <GraduationCap className="w-4 h-4" /> Curriculum
                 </h2>
             </div>
             <div className="overflow-y-auto h-[calc(100vh-120px)] p-3 space-y-1">
                 {activeData.map((dayItem) => {
                     const isCompleted = completedDays.includes(dayItem.day);
                     const isActive = currentDay === dayItem.day;
                     return (
                        <button
                          key={dayItem.day}
                          onClick={() => {
                              jumpToDay(dayItem.day);
                              if (window.innerWidth < 768) setSidebarOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-xl flex items-start gap-3 transition-colors ${isActive ? 'bg-indigo-50 text-indigo-900 shadow-sm border border-indigo-100' : 'hover:bg-slate-50 text-slate-600 border border-transparent'} ${dayItem.day > currentDay && !completedDays.includes(dayItem.day - 1) && dayItem.day !== 1 ? 'opacity-60' : ''}`}
                        >
                            <div className={`mt-0.5 ${isCompleted ? 'text-emerald-500' : (isActive ? 'text-indigo-500' : 'text-slate-300')}`}>
                               {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}>Day {dayItem.day}</span>
                                <span className="text-sm font-medium leading-snug">{dayItem.title}</span>
                            </div>
                        </button>
                     )
                 })}
             </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto relative">
              <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
                  
                  {/* Top nav breadcrumb & section tabs */}
                  <div className="mb-8">
                     <div className="flex justify-between items-end mb-6">
                         <div className="flex items-center text-sm font-medium text-slate-500 gap-2 uppercase tracking-widest text-xs">
                            <span>Day {activeDay.day}</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-indigo-600">{activeDay.title}</span>
                         </div>
                     </div>
                     
                     <div className="flex items-center space-x-1 p-1 bg-slate-200/50 rounded-xl inline-flex">
                        {(['lesson', 'quiz', 'exercise'] as const).map((step) => (
                           <button 
                             key={step}
                             onClick={() => setCurrentSection(step)}
                             disabled={isLoadingDay}
                             className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${currentSection === step ? 'bg-white shadow-sm text-indigo-600 border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'} disabled:opacity-50`}
                           >
                              {step}
                           </button>
                        ))}
                     </div>
                  </div>

                  {isLoadingDay ? (
                      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-6" />
                          <p className="text-lg font-medium text-slate-700 mb-2 border-b-2 border-indigo-200 pb-1">AI Tutor is Preparing Day {activeDay.day}</p>
                          <p className="text-sm text-slate-400">Crafting personalized lesson, quiz, and coding exercise...</p>
                      </div>
                  ) : (
                      <AnimatePresence mode="wait">
                         {currentSection === 'lesson' && (
                             <LessonBlock key="lesson" day={activeDay} onComplete={handleCompleteLesson} profile={userProfile || undefined} />
                         )}
                         {currentSection === 'quiz' && (
                             <QuizBlock key="quiz" day={activeDay} onComplete={handleCompleteQuiz} profile={userProfile || undefined} />
                         )}
                         {currentSection === 'exercise' && (
                             <CodeExerciseBlock key="exercise" day={activeDay} onComplete={handleCompleteExercise} profile={userProfile || undefined} />
                         )}
                         {currentSection === 'completed' && (
                             <motion.div 
                                key="completed"
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-xl shadow-emerald-500/10 border border-emerald-100 p-12 text-center mt-12"
                             >
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Trophy className="w-12 h-12" />
                                </div>
                                <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Day {activeDay.day} Complete!</h2>
                                <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                                    Excellent work. You've mastered <strong>{activeDay.title}</strong>. Take a break, stay hydrated, and keep up the momentum!
                                </p>
                                <div className="flex justify-center gap-4">
                                    <button 
                                       onClick={() => jumpToDay(currentDay + 1)}
                                       disabled={currentDay === 30}
                                       className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 text-lg hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                       Start Day {currentDay + 1} <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                             </motion.div>
                         )}
                      </AnimatePresence>
                  )}

              </div>
          </main>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-500" /> Settings
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Environment</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">OS</label>
                        <select 
                          value={userProfile?.os || ''} 
                          onChange={(e) => userProfile && setUserProfile({...userProfile, os: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {['Windows', 'macOS', 'Linux', 'Other / Mobile'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">IDE / Editor</label>
                        <select 
                          value={userProfile?.editors || ''} 
                          onChange={(e) => userProfile && setUserProfile({...userProfile, editors: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {['VS Code', 'Vim / Neovim', 'CLion', 'Nano / Simple Editor'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Key className="w-4 h-4" /> Gemini API Key
                    </label>
                    <input 
                      type="password"
                      placeholder="Paste your key here..."
                      value={userApiKey}
                      onChange={(e) => setUserApiKey(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm leading-none"
                    />
                    <p className="mt-2 text-[10px] text-slate-400 leading-relaxed uppercase font-bold">
                      Stored locally. Lessons are uniquely generated based on your environment.
                    </p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={handleSaveApiKey}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => {
                      setUserApiKey('');
                      localStorage.removeItem('USER_GEMINI_API_KEY');
                      setIsSettingsOpen(false);
                    }}
                    className="w-full mt-2 text-slate-400 hover:text-slate-600 text-xs font-medium py-2 transition-colors underline decoration-dotted"
                  >
                    Reset to Default Key
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!userProfile && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}

export default App;
