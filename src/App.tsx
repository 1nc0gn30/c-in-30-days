import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { curriculum, WEEKS } from './data/curriculum';
import { LessonBlock, QuizBlock, CodeExerciseBlock } from './components/Activities';
import { MemoryLab } from './components/MemoryLab';
import { UserProfile } from './services/ai';
import { copyToClipboard } from './utils/clipboard';
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Code2,
  GraduationCap,
  LayoutPanelLeft,
  Trophy,
  Settings,
  Key,
  X,
  Cpu,
  BookOpen,
  Search,
  Download,
  Upload,
  Coffee,
  Copy,
  Check,
  Flame,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type SectionType = 'lesson' | 'quiz' | 'exercise' | 'completed';
type AppMode = 'track' | 'memory-lab';

const STRIPE_COFFEE_URL = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
const SOLANA_TIP_ADDRESS = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';
const GITHUB_REPO_URL = 'https://github.com/1nc0gn30/c-in-30-days';
const NULLAI_URL = 'https://nullai.tech';

const DEFAULT_PROFILE: UserProfile = {
  os: 'Linux',
  goals: 'Systems Programming',
  editors: 'VS Code',
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = Array.from(new Set(dates)).sort().reverse();
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(`${unique[i - 1]}T00:00:00Z`).getTime();
    const cur = new Date(`${unique[i]}T00:00:00Z`).getTime();
    const diffDays = Math.round((prev - cur) / 86_400_000);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

function getInitialQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(name);
}

function App() {
  const [mode, setMode] = useState<AppMode>(() =>
    getInitialQueryParam('view') === 'lab' ? 'memory-lab' : 'track'
  );
  const [currentDay, setCurrentDay] = useState<number>(() => {
    const qDay = Number(getInitialQueryParam('day'));
    if (qDay >= 1 && qDay <= 30) return qDay;
    try {
      const saved = Number(localStorage.getItem('cIn30DaysCurrentDay'));
      return saved >= 1 && saved <= 30 ? saved : 1;
    } catch {
      return 1;
    }
  });
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('cIn30DaysProgress');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number' && n >= 1 && n <= 30) : [];
    } catch {
      return [];
    }
  });
  const [studyDates, setStudyDates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cIn30DaysStudyDates');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [currentSection, setCurrentSection] = useState<SectionType>(() => {
    const qTab = getInitialQueryParam('tab');
    if (qTab === 'quiz' || qTab === 'exercise' || qTab === 'lesson') return qTab;
    return 'lesson';
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => {
    try {
      return localStorage.getItem('USER_GEMINI_API_KEY') || '';
    } catch {
      return '';
    }
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('cIn30DaysProfile');
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });
  const [solCopied, setSolCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('cIn30DaysProgress', JSON.stringify(completedDays));
    } catch {
      // Ignore storage errors
    }
  }, [completedDays]);

  useEffect(() => {
    try {
      localStorage.setItem('cIn30DaysStudyDates', JSON.stringify(studyDates));
    } catch {
      // Ignore storage errors
    }
  }, [studyDates]);

  useEffect(() => {
    try {
      localStorage.setItem('cIn30DaysCurrentDay', String(currentDay));
    } catch {
      // Ignore storage errors
    }
  }, [currentDay]);

  const activeDay = curriculum.find((d) => d.day === currentDay) || curriculum[0];

  const filteredCurriculum = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return curriculum.filter((item) => {
      if (selectedWeek !== 'all' && item.week !== selectedWeek) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.concepts.some((c) => c.toLowerCase().includes(q)) ||
        `day ${item.day}`.includes(q)
      );
    });
  }, [searchQuery, selectedWeek]);

  const handleSaveSettings = () => {
    try {
      if (userApiKey.trim()) {
        localStorage.setItem('USER_GEMINI_API_KEY', userApiKey.trim());
      } else {
        localStorage.removeItem('USER_GEMINI_API_KEY');
      }
      localStorage.setItem('cIn30DaysProfile', JSON.stringify(userProfile));
    } catch {
      // Ignore storage errors
    }
    setIsSettingsOpen(false);
  };

  const handleCompleteExercise = () => {
    setCurrentSection('completed');
    if (!completedDays.includes(currentDay)) {
      setCompletedDays((prev) => [...prev, currentDay].sort((a, b) => a - b));
    }
    const today = todayIsoDate();
    if (!studyDates.includes(today)) {
      setStudyDates((prev) => [...prev, today]);
    }
    try {
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#D97706', '#059669', '#0F172A'],
      });
    } catch {
      // Ignore canvas-confetti issues in headless environments
    }
  };

  const jumpToDay = (day: number) => {
    setMode('track');
    setCurrentDay(day);
    setCurrentSection('lesson');
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleExportProgress = () => {
    const payload = {
      app: 'c-in-30-days',
      exportedAt: new Date().toISOString(),
      completedDays,
      studyDates,
      currentDay,
      profile: userProfile,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `c-in-30-days-progress-${todayIsoDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProgress = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (Array.isArray(parsed.completedDays)) {
          setCompletedDays(
            parsed.completedDays.filter((n: unknown) => typeof n === 'number' && n >= 1 && n <= 30)
          );
        }
        if (Array.isArray(parsed.studyDates)) {
          setStudyDates(parsed.studyDates.filter((s: unknown) => typeof s === 'string'));
        }
        if (typeof parsed.currentDay === 'number' && parsed.currentDay >= 1 && parsed.currentDay <= 30) {
          setCurrentDay(parsed.currentDay);
        }
        setImportStatus('Progress restored cleanly.');
      } catch {
        setImportStatus('Invalid JSON progress file.');
      }
    };
    reader.readAsText(file);
  };

  const handleCopySolana = async () => {
    const ok = await copyToClipboard(SOLANA_TIP_ADDRESS);
    if (ok) {
      setSolCopied(true);
      setTimeout(() => setSolCopied(false), 1800);
    }
  };

  const currentStreak = computeStreak(studyDates);
  const progressPct = Math.round((completedDays.length / 30) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* Top Command Header */}
      <header className="bg-[#0B1120] text-slate-50 border-b border-slate-800 sticky top-0 z-30">
        <div className="px-3 sm:px-5 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle curriculum sidebar"
            >
              <LayoutPanelLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-mono font-bold text-base shrink-0">
              C
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
                  <span className="sm:hidden">C30</span>
                  <span className="hidden sm:inline">C in 30 Days</span>
                </h1>
                <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  C11 · Open
                </span>
              </div>
            </div>
          </div>

          {/* Primary Mode Switcher */}
          <nav aria-label="Primary workspace views" className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setMode('track')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[40px] sm:min-h-[36px] ${
                mode === 'track' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Track</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('memory-lab')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[40px] sm:min-h-[36px] ${
                mode === 'memory-lab' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">Memory Lab</span>
              <span className="sm:hidden">Lab</span>
            </button>
          </nav>

          {/* Right Metrics & Settings */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
                <Flame className="w-4 h-4" />
                <span>{currentStreak}d streak</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-slate-300">
                  {completedDays.length}/30
                </span>
                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-semibold text-amber-300">
                  {progressPct}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open settings and progress export"
              title="Settings & Progress Export"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 relative min-w-0">
        {/* Mobile Drawer Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 top-16 bg-slate-900/50 z-20 lg:hidden"
            aria-hidden="true"
          />
        )}

        {/* Curriculum Sidebar */}
        <aside
          aria-label="30-Day C Curriculum"
          className={`${
            sidebarOpen ? 'translate-x-0 w-80 max-w-[85vw]' : '-translate-x-full w-0 overflow-hidden'
          } fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-transform duration-200 z-20 lg:z-10 flex flex-col shrink-0`}
        >
          <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-600" /> 30-Day Track
              </h2>
              <span className="font-mono text-xs text-slate-500">
                {completedDays.length}/30 done
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter pointers, malloc, files..."
                aria-label="Filter lessons"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[40px]"
              />
            </div>

            {/* Week Filter Pills */}
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSelectedWeek('all')}
                className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-medium transition-colors min-h-[32px] ${
                  selectedWeek === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              {WEEKS.map((w) => (
                <button
                  key={w.week}
                  type="button"
                  onClick={() => setSelectedWeek(w.week)}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-medium transition-colors min-h-[32px] ${
                    selectedWeek === w.week
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  W{w.week}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-2.5 space-y-1">
            {filteredCurriculum.map((dayItem) => {
              const isCompleted = completedDays.includes(dayItem.day);
              const isActive = mode === 'track' && currentDay === dayItem.day;
              return (
                <button
                  key={dayItem.day}
                  type="button"
                  onClick={() => jumpToDay(dayItem.day)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-start gap-3 transition-colors min-h-[48px] ${
                    isActive
                      ? 'bg-amber-50 text-slate-950 border border-amber-300'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <span
                    className={`mt-0.5 shrink-0 ${
                      isCompleted ? 'text-emerald-600' : isActive ? 'text-amber-600' : 'text-slate-300'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono text-[11px] font-semibold uppercase tracking-wider ${
                          isActive ? 'text-amber-700' : 'text-slate-400'
                        }`}
                      >
                        Day {String(dayItem.day).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">W{dayItem.week}</span>
                    </div>
                    <div className="text-sm font-medium leading-snug truncate">{dayItem.title}</div>
                  </div>
                </button>
              );
            })}
            {filteredCurriculum.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-8">No matching lessons.</p>
            )}
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {mode === 'memory-lab' ? (
              <MemoryLab />
            ) : (
              <div>
                {/* Day Header & Section Tabs */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
                      <span>Week {activeDay.week}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span className="text-amber-700 font-semibold">
                        Day {String(activeDay.day).padStart(2, '0')} / 30
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => jumpToDay(Math.max(1, currentDay - 1))}
                        disabled={currentDay === 1}
                        className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 min-h-[44px] sm:min-h-[36px]"
                      >
                        Prev Day
                      </button>
                      <button
                        type="button"
                        onClick={() => jumpToDay(Math.min(30, currentDay + 1))}
                        disabled={currentDay === 30}
                        className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 min-h-[44px] sm:min-h-[36px]"
                      >
                        Next Day
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      {activeDay.title}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl">
                      {activeDay.summary}
                    </p>
                  </div>

                  {/* Stepper Tabs */}
                  <div
                    role="tablist"
                    aria-label="Lesson stages"
                    className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl"
                  >
                    {(['lesson', 'quiz', 'exercise'] as const).map((step, i) => (
                      <button
                        key={step}
                        type="button"
                        role="tab"
                        aria-selected={currentSection === step}
                        onClick={() => setCurrentSection(step)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all min-h-[44px] sm:min-h-[38px] ${
                          currentSection === step
                            ? 'bg-white shadow-xs text-slate-950 font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {i + 1}. {step}
                      </button>
                    ))}
                  </div>
                </div>

                {currentSection === 'lesson' && (
                  <LessonBlock
                    day={activeDay}
                    onComplete={() => setCurrentSection('quiz')}
                    profile={userProfile}
                  />
                )}
                {currentSection === 'quiz' && (
                  <QuizBlock
                    day={activeDay}
                    onComplete={() => setCurrentSection('exercise')}
                    profile={userProfile}
                  />
                )}
                {currentSection === 'exercise' && (
                  <CodeExerciseBlock
                    day={activeDay}
                    onComplete={handleCompleteExercise}
                    profile={userProfile}
                  />
                )}
                {currentSection === 'completed' && (
                  <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 sm:p-12 text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                      Day {activeDay.day} Completed
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
                      You finished <strong>{activeDay.title}</strong>. Progress ({completedDays.length}/30 days) is saved locally in your browser.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setMode('memory-lab')}
                        className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm inline-flex items-center gap-2 min-h-[44px]"
                      >
                        <Cpu className="w-4 h-4 text-amber-600" /> Open Memory Lab
                      </button>
                      {currentDay < 30 && (
                        <button
                          type="button"
                          onClick={() => jumpToDay(currentDay + 1)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2 min-h-[44px]"
                        >
                          Start Day {currentDay + 1} <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Open-Access Attribution & Support Footer */}
          <footer className="border-t border-slate-200 bg-white mt-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                  <p className="font-medium text-slate-800">
                    Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <a
                      href={GITHUB_REPO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-950 underline underline-offset-2 inline-flex items-center gap-1 py-1"
                    >
                      GitHub Repository <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={NULLAI_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-950 underline underline-offset-2 inline-flex items-center gap-1 py-1"
                    >
                      nullai.tech <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-400">100% Free &amp; Open-Access · Local-First</span>
                  </div>
                </div>

                {/* Non-intrusive Support Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={STRIPE_COFFEE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
                  >
                    <Coffee className="w-4 h-4" />
                    Buy Us a Coffee
                  </a>
                  <button
                    type="button"
                    onClick={handleCopySolana}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-mono transition-colors min-h-[44px]"
                    title={`Solana Tip Address: ${SOLANA_TIP_ADDRESS}`}
                  >
                    {solCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>SOL Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>SOL: GG2e...XdXoK</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Settings & Progress Backup Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 id="settings-title" className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <Settings className="w-4 h-4 text-amber-600" /> Toolchain &amp; Progress
              </h3>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* OS & Editor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="os-select" className="block font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    OS Toolchain
                  </label>
                  <select
                    id="os-select"
                    value={userProfile.os}
                    onChange={(e) => setUserProfile({ ...userProfile, os: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px]"
                  >
                    {['Linux', 'macOS', 'Windows'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="editor-select" className="block font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Editor
                  </label>
                  <select
                    id="editor-select"
                    value={userProfile.editors}
                    onChange={(e) => setUserProfile({ ...userProfile, editors: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px]"
                  >
                    {['VS Code', 'Vim / Neovim', 'CLion', 'Nano / Terminal'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Progress Export / Import */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Local Progress ({completedDays.length}/30)
                  </span>
                  <span className="font-mono text-xs text-amber-700 font-semibold">
                    {currentStreak}d streak
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportProgress}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 min-h-[40px]"
                  >
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </button>
                  <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer min-h-[40px]">
                    <Upload className="w-3.5 h-3.5" /> Import JSON
                    <input type="file" accept="application/json" onChange={handleImportProgress} className="sr-only" />
                  </label>
                </div>
                {importStatus && <p className="text-xs text-emerald-700 font-medium">{importStatus}</p>}
              </div>

              {/* Optional Gemini Key */}
              <div>
                <label htmlFor="gemini-key" className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" /> Optional Gemini API Key
                </label>
                <input
                  id="gemini-key"
                  type="password"
                  placeholder="Optional — not required for any lesson"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs min-h-[44px]"
                />
                <p className="mt-1.5 text-[11px] text-slate-500">
                  All 30 days and local C11 checks work offline without a key. Adding a key unlocks optional AI feedback.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-colors min-h-[44px]"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
