import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { evaluateCCode, UserProfile } from '../services/ai';
import { DayContent } from '../data/curriculum';
import { Loader2, CheckCircle2, Circle, Code2, BookOpen, Brain, Play, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

export function LessonBlock({ day, onComplete, profile }: ActivityProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 pb-12">
        <h2 className="text-sm font-semibold text-indigo-500 tracking-wider uppercase mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Lesson
        </h2>
        <div className="prose prose-slate prose-headings:font-semibold prose-a:text-indigo-600 prose-code:text-indigo-600 prose-pre:bg-slate-900 prose-pre:text-slate-50 max-w-none">
          <ReactMarkdown>{day.lessonMarkdown || ''}</ReactMarkdown>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
            onClick={onComplete}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
            Continue to Quiz
        </button>
      </div>
    </div>
  );
}

export function QuizBlock({ day, onComplete, profile }: ActivityProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // If no quiz exists (dynamically generated for days > 2)
  if (!day.quiz || day.quiz.length === 0) {
      return (
          <div className="text-center py-12">
              <p className="text-slate-500 mb-6">No quiz available for this topic yet.</p>
              <button
                onClick={onComplete}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 mx-auto"
            >
                Skip Quiz
            </button>
          </div>
      );
  }

  const question = day.quiz[currentIndex];
  const isCorrect = selected === question.correctAnswerIndex;

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelected(idx);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < (day.quiz?.length || 0) - 1) {
      setCurrentIndex(curr => curr + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-sm font-semibold text-indigo-500 tracking-wider uppercase mb-6 flex items-center gap-2">
            <Brain className="w-4 h-4" /> Knowledge Check
        </h2>
        
        <p className="text-lg font-medium text-slate-900 mb-6">{question.question}</p>
        
        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            let itemClass = "border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer group";
            if (showExplanation) {
               if (idx === question.correctAnswerIndex) {
                   itemClass = "bg-green-50 border-green-500 text-green-900";
               } else if (idx === selected) {
                   itemClass = "bg-red-50 border-red-300 text-red-900";
               } else {
                   itemClass = "border-slate-200 opacity-50";
               }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showExplanation}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 block ${itemClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${showExplanation && idx === question.correctAnswerIndex ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  {opt}
                </div>
              </button>
            )
          })}
        </div>

        {showExplanation && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className={`mt-6 p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
          >
            <p className="font-bold mb-1 flex items-center gap-2">
              {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {isCorrect ? 'Correct!' : 'Incorrect.'}
            </p>
            <p className="text-sm opacity-90">{question.explanation}</p>
          </motion.div>
        )}
      </div>

      {showExplanation && (
          <div className="mt-8 flex justify-end">
            <button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
            >
                {currentIndex < day.quiz!.length - 1 ? 'Next Question' : 'Continue to Coding'}
                <ChevronRight className="w-4 h-4" />
            </button>
          </div>
      )}
    </div>
  );
}

export function CodeExerciseBlock({ day, onComplete, profile }: ActivityProps) {
    const [code, setCode] = useState(day.exercise?.initialCode || "// Write your code here\n");
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [feedback, setFeedback] = useState<{passed: boolean, text: string} | null>(null);

    // Sync if day changes
    useEffect(() => {
        if (day.exercise?.initialCode) {
            setCode(day.exercise.initialCode);
        }
    }, [day]);

    // If no exercise physically coded
    if (!day.exercise) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 mb-6">No coding exercise for this topic yet.</p>
                <button
                  onClick={onComplete}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 mx-auto"
              >
                  Complete Day {day.day}
              </button>
            </div>
        );
    }

    const handleRun = async () => {
        setIsEvaluating(true);
        setFeedback(null);
        const result = await evaluateCCode(day.exercise!.description, code, profile);
        setFeedback({ passed: result.passed, text: result.feedback });
        setIsEvaluating(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-sm font-semibold text-indigo-500 tracking-wider uppercase mb-2 flex items-center gap-2">
                        <Code2 className="w-4 h-4" /> Exercise
                    </h2>
                    <p className="font-medium text-slate-800">{day.exercise.description}</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2">
                     <div className="bg-[#1d1f21] border-r border-slate-200 relative min-h-[400px]">
                        <Editor
                            value={code}
                            onValueChange={setCode}
                            highlight={c => Prism.highlight(c, Prism.languages.c, 'c')}
                            padding={20}
                            style={{
                                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                fontSize: 13,
                                minHeight: '100%',
                            }}
                            textareaClassName="focus:outline-none focus:ring-0 text-slate-100 placeholder-slate-500"
                        />
                     </div>
                     <div className="p-6 bg-slate-50 flex flex-col h-full border-l border-slate-200">
                         <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-4">
                             <h3 className="font-semibold text-slate-900 uppercase tracking-widest text-[10px]">Tutor Feedback</h3>
                             <button 
                                onClick={handleRun}
                                disabled={isEvaluating}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all active:scale-95 flex items-center gap-2 text-sm"
                             >
                                 {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                 {isEvaluating ? 'Evaluating...' : 'Run & Check'}
                             </button>
                         </div>
                         
                         <div className="flex-1 overflow-auto">
                           {feedback ? (
                               <motion.div 
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className={`p-4 rounded-xl border ${feedback.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}
                               >
                                   <h4 className="font-bold mb-2 flex items-center gap-2 text-sm">
                                       {feedback.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4 text-rose-500" />}
                                       {feedback.passed ? 'Success!' : 'Almost there'}
                                   </h4>
                                   <div className="prose prose-sm max-w-none opacity-90 prose-p:my-1 text-xs">
                                      <ReactMarkdown>{feedback.text}</ReactMarkdown>
                                   </div>
                               </motion.div>
                           ) : (
                               <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center min-h-[200px]">
                                   <Code2 className="w-8 h-8 mb-3 opacity-20" />
                                   <p className="text-xs max-w-[200px]">Complete the challenge in the editor and click "Run & Check" to get AI feedback.</p>
                               </div>
                           )}
                         </div>
                     </div>
                 </div>
            </div>

            {feedback?.passed && (
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onComplete}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-bold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Success! Complete Day {day.day}
                    </button>
                </div>
            )}
        </div>
    )
}
