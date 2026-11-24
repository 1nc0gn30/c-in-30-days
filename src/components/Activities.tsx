import { useState, useEffect, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { evaluateCCodeWithAI, hasUserGeminiKey, UserProfile } from '../services/ai';
import { evaluateCCodeLocally, LocalEvalResult } from '../services/cEvaluator';
import { DayContent } from '../data/curriculum';
import { copyToClipboard } from '../utils/clipboard';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Code2,
  BookOpen,
  Brain,
  Play,
  ChevronRight,
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  Eye,
  EyeOff,
  Terminal,
  Sparkles,
} from 'lucide-react';
import Editor from 'react-simple-code-editor';

// @ts-ignore
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/themes/prism-tomorrow.css';

interface ActivityProps {
  day: DayContent;
  onComplete: () => void;
  profile?: UserProfile;
}

function CopyButton({ text, label = 'Copy', dark = false }: { text: string; label?: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-h-[44px] sm:min-h-[36px] ${
        dark
          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
      }`}
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}

function CodeBlockRenderer({ className, children }: { className?: string; children?: ReactNode }) {
  const raw = String(children ?? '').replace(/\n$/, '');
  const langMatch = /language-(\w+)/.exec(className || '');
  const lang = langMatch ? langMatch[1] : '';

  if (!langMatch && !raw.includes('\n')) {
    return <code>{children}</code>;
  }

  const highlighted =
    lang === 'c' && Prism.languages.c
      ? Prism.highlight(raw, Prism.languages.c, 'c')
      : null;

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-slate-800 bg-[#0B1120] shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {lang || 'snippet'}
        </span>
        <CopyButton text={raw} label="Copy" dark />
      </div>
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-slate-100 m-0">
        {highlighted ? (
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        ) : (
          <code>{raw}</code>
        )}
      </pre>
    </div>
  );
}

export function LessonBlock({ day, onComplete }: ActivityProps) {
  return (
    <div className="space-y-6">
      <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="font-mono text-xs font-semibold text-amber-700 tracking-[0.18em] uppercase flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Day {String(day.day).padStart(2, '0')} · Lesson
          </div>
          <div className="flex flex-wrap gap-1.5">
            {day.concepts.map((concept) => (
              <span
                key={concept}
                className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>

        <div className="lesson-prose">
          <ReactMarkdown
            components={{
              pre({ children }) {
                return <>{children}</>;
              },
              code({ className, children }) {
                return <CodeBlockRenderer className={className}>{children}</CodeBlockRenderer>;
              },
            }}
          >
            {day.lessonMarkdown}
          </ReactMarkdown>
        </div>
      </article>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onComplete}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition-colors inline-flex items-center gap-2 min-h-[44px]"
        >
          Continue to Knowledge Check
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function QuizBlock({ day, onComplete }: ActivityProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
    setSelected(null);
    setShowExplanation(false);
    setCorrectCount(0);
  }, [day.day]);

  const question = day.quiz[currentIndex];
  const isCorrect = selected === question.correctAnswerIndex;

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelected(idx);
    setShowExplanation(true);
    if (idx === question.correctAnswerIndex) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < day.quiz.length - 1) {
      setCurrentIndex((curr) => curr + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <h2 className="font-mono text-xs font-semibold text-amber-700 tracking-[0.18em] uppercase flex items-center gap-2">
            <Brain className="w-4 h-4" /> Knowledge Check · {currentIndex + 1} / {day.quiz.length}
          </h2>
          <span className="font-mono text-xs text-slate-500">
            Score: {correctCount}/{day.quiz.length}
          </span>
        </div>

        <p className="text-base sm:text-lg font-semibold text-slate-900 mb-6 leading-snug">
          {question.question}
        </p>

        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            let itemClass =
              'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 cursor-pointer';
            if (showExplanation) {
              if (idx === question.correctAnswerIndex) {
                itemClass = 'bg-emerald-50 border-emerald-500 text-emerald-950';
              } else if (idx === selected) {
                itemClass = 'bg-rose-50 border-rose-400 text-rose-950';
              } else {
                itemClass = 'border-slate-200 bg-slate-50 text-slate-400';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                disabled={showExplanation}
                className={`w-full text-left px-4 sm:px-5 py-3.5 rounded-xl border-2 transition-colors min-h-[48px] ${itemClass}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                      showExplanation && idx === question.correctAnswerIndex
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : showExplanation && idx === selected
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm sm:text-base leading-snug">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div
            className={`mt-6 p-4 rounded-xl border ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <p className="font-semibold mb-1 flex items-center gap-2 text-sm">
              {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
              {isCorrect ? 'Correct' : 'Not quite'}
            </p>
            <p className="text-sm leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </div>

      {showExplanation && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition-colors inline-flex items-center gap-2 min-h-[44px]"
          >
            {currentIndex < day.quiz.length - 1 ? 'Next Question' : 'Continue to Exercise'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

const DRAFT_STORAGE_KEY = 'cIn30DaysCodeDrafts';

function loadDraft(dayNum: number): string | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return typeof map?.[dayNum] === 'string' ? map[dayNum] : null;
  } catch {
    return null;
  }
}

function saveDraft(dayNum: number, code: string) {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[dayNum] = code;
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

export function CodeExerciseBlock({ day, onComplete, profile }: ActivityProps) {
  const [code, setCode] = useState(() => loadDraft(day.day) ?? day.exercise.initialCode);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [localResult, setLocalResult] = useState<LocalEvalResult | null>(null);
  const [aiFeedback, setAiFeedback] = useState<{ passed: boolean; text: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    setCode(loadDraft(day.day) ?? day.exercise.initialCode);
    setLocalResult(null);
    setAiFeedback(null);
    setShowHint(false);
    setShowSolution(false);
  }, [day.day, day.exercise.initialCode]);

  const handleCodeChange = (next: string) => {
    setCode(next);
    saveDraft(day.day, next);
  };

  const daySlug = `day${String(day.day).padStart(2, '0')}`;
  const isWindows = profile?.os === 'Windows';
  const compileCmd = isWindows
    ? `gcc -Wall -Wextra -std=c11 ${daySlug}.c -o ${daySlug}.exe && ${daySlug}.exe`
    : `gcc -Wall -Wextra -std=c11 ${daySlug}.c -o ${daySlug} && ./${daySlug}`;

  const handleRunLocal = () => {
    const res = evaluateCCodeLocally(day.exercise, code);
    setLocalResult(res);
    setAiFeedback(null);
  };

  const handleRunAI = async () => {
    setIsEvaluating(true);
    const res = await evaluateCCodeWithAI(day.exercise.description, code, profile);
    setIsEvaluating(false);
    if (res) {
      setAiFeedback({ passed: res.passed, text: res.feedback });
    } else {
      setAiFeedback({
        passed: false,
        text: 'AI review unavailable. Add a Gemini API key in Settings or rely on the local C11 verifier.',
      });
    }
  };

  const handleReset = () => {
    handleCodeChange(day.exercise.initialCode);
    setLocalResult(null);
    setAiFeedback(null);
  };

  const handleLoadSolution = () => {
    handleCodeChange(day.exercise.solutionCode);
    setShowSolution(true);
  };

  const canComplete = Boolean(localResult?.passed || aiFeedback?.passed);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Exercise Prompt Header */}
        <div className="px-5 sm:px-6 py-5 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-mono text-xs font-semibold text-amber-700 tracking-[0.18em] uppercase flex items-center gap-2">
              <Code2 className="w-4 h-4" /> Day {String(day.day).padStart(2, '0')} · C11 Exercise
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHint((h) => !h)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-700 min-h-[44px] sm:min-h-[36px]"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                {showHint ? 'Hide Hint' : 'Hint'}
              </button>
              <button
                type="button"
                onClick={() => setShowSolution((s) => !s)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 min-h-[44px] sm:min-h-[36px]"
              >
                {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showSolution ? 'Hide Solution' : 'Reference'}
              </button>
              <CopyButton text={code} label="Copy C" />
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 min-h-[44px] sm:min-h-[36px]"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <div className="lesson-prose text-sm sm:text-base font-medium text-slate-900 [&>p]:mb-0">
            <ReactMarkdown>{day.exercise.description}</ReactMarkdown>
          </div>

          {/* OS-aware GCC compile pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#0B1120] text-slate-200 border border-slate-800">
            <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto">
              <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <code className="whitespace-nowrap">{compileCmd}</code>
            </div>
            <CopyButton text={compileCmd} label="Copy cmd" dark />
          </div>

          {showHint && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed">
              <strong className="font-semibold">Hint:</strong> {day.exercise.hint}
            </div>
          )}

          {showSolution && (
            <div className="rounded-xl bg-slate-900 text-slate-100 border border-slate-800 overflow-hidden">
              <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400">
                  GCC-Verified C11 Solution (Expected: {day.exercise.expectedOutput})
                </span>
                <button
                  type="button"
                  onClick={handleLoadSolution}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white min-h-[36px]"
                >
                  Load into Editor
                </button>
              </div>
              <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-slate-200">
                <code>{day.exercise.solutionCode}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Split Editor + Verifier Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 bg-[#0B1120] border-b lg:border-b-0 lg:border-r border-slate-800 min-h-[340px] c-code-editor overflow-x-auto">
            <Editor
              value={code}
              onValueChange={handleCodeChange}
              highlight={(c) => (Prism.languages.c ? Prism.highlight(c, Prism.languages.c, 'c') : c)}
              padding={20}
              style={{
                fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
                fontSize: 13,
                lineHeight: 1.6,
                minHeight: '340px',
                color: '#F1F5F9',
              }}
              textareaClassName="focus:outline-none text-slate-100"
              aria-label={`C code editor for Day ${day.day}`}
            />
          </div>

          <div className="lg:col-span-5 p-5 bg-slate-50 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <h3 className="font-mono text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                  C11 Verifier Output
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRunLocal}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 text-sm min-h-[44px]"
                  >
                    <Play className="w-4 h-4" />
                    Run Check
                  </button>
                  {hasUserGeminiKey() && (
                    <button
                      type="button"
                      onClick={handleRunAI}
                      disabled={isEvaluating}
                      className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-3 py-2 rounded-xl font-medium inline-flex items-center gap-1.5 text-xs min-h-[44px]"
                      title="Optional Gemini AI review using your saved key"
                    >
                      {isEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                      AI Review
                    </button>
                  )}
                </div>
              </div>

              {localResult ? (
                <div className="space-y-3">
                  <div
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                      localResult.passed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-2 mb-1">
                      {localResult.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      {localResult.passed ? 'All Checks Passed' : 'Needs Adjustment'}
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{localResult.feedback}</p>
                  </div>

                  {localResult.simulatedOutput && (
                    <div className="rounded-xl bg-[#0B1120] text-emerald-300 p-3 font-mono text-xs border border-slate-800">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                        Expected stdout
                      </div>
                      <code>{localResult.simulatedOutput}</code>
                    </div>
                  )}

                  <ul className="space-y-1.5">
                    {localResult.checks.map((chk, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs bg-white px-3 py-2 rounded-lg border border-slate-200"
                      >
                        {chk.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className={chk.passed ? 'text-slate-800 font-medium' : 'text-rose-900 font-semibold'}>
                            {chk.label}
                          </div>
                          {!chk.passed && chk.hint && (
                            <div className="text-slate-600 mt-0.5">{chk.hint}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 py-10 text-center">
                  <Code2 className="w-8 h-8 mb-3 text-slate-300" />
                  <p className="text-xs max-w-[240px] leading-relaxed">
                    Edit the C11 code and press <strong>Run Check</strong> for instant client-side structural verification—no API key required.
                  </p>
                </div>
              )}

              {aiFeedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    aiFeedback.passed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Optional AI Tutor Note
                  </div>
                  <div className="leading-relaxed">{aiFeedback.text}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          Draft auto-saved locally in your browser.
        </span>
        <button
          type="button"
          onClick={onComplete}
          className={`px-6 py-3 rounded-xl font-semibold shadow-sm transition-colors inline-flex items-center gap-2 min-h-[44px] ${
            canComplete
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark Day {day.day} Complete
        </button>
      </div>
    </div>
  );
}
