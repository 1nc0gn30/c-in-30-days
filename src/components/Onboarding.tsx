import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Target, Laptop, Code2, Key, ChevronRight, Check, Rocket, HelpCircle } from 'lucide-react';

interface OnboardingProps {
    onComplete: (profile: UserProfile, apiKey: string) => void;
}

export interface UserProfile {
    os: string;
    goals: string;
    editors: string;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<UserProfile>({
        os: '',
        goals: '',
        editors: ''
    });
    const [apiKey, setApiKey] = useState('');

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else onComplete(profile, apiKey);
    };

    const isStepValid = () => {
        if (step === 1) return profile.os !== '';
        if (step === 2) return profile.goals !== '';
        if (step === 3) return profile.editors !== '';
        return true; // Step 4 is API key (optional but recommended)
    };

    const steps = [
        {
            title: "Your Environment",
            subtitle: "Which operating system are you using for C coding?",
            options: ['Windows', 'macOS', 'Linux', 'Other / Mobile'],
            field: 'os',
            icon: <Monitor className="w-6 h-6" />
        },
        {
            title: "Your Mission",
            subtitle: "What is your primary goal for learning C?",
            options: ['Career / Job Prep', 'Systems Programming', 'Academic / School', 'Curiosity / Hobby'],
            field: 'goals',
            icon: <Target className="w-6 h-6" />
        },
        {
            title: "Your Toolkit",
            subtitle: "Which code editor or IDE do you prefer?",
            options: ['VS Code', 'Vim / Neovim', 'CLion', 'Nano / Simple Editor'],
            field: 'editors',
            icon: <Code2 className="w-6 h-6" />
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 p-4 md:p-8">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#4f46e5_0%,transparent_50%)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,#06b6d4_0%,transparent_50%)]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Progress Bar */}
                <div className="h-1.5 bg-slate-100 flex">
                    {[1, 2, 3, 4].map((s) => (
                        <div 
                            key={s} 
                            className={`flex-1 transition-all duration-500 ${s <= step ? 'bg-indigo-500' : 'bg-transparent'}`} 
                        />
                    ))}
                </div>

                <div className="p-8 md:p-12">
                    <AnimatePresence mode="wait">
                        {step <= 3 ? (
                            <motion.div 
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
                                        {steps[step-1].icon}
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{steps[step-1].title}</h2>
                                    <p className="text-slate-500 text-lg">{steps[step-1].subtitle}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {steps[step-1].options.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setProfile({ ...profile, [steps[step-1].field]: option })}
                                            className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${profile[steps[step-1].field as keyof UserProfile] === option ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600'}`}
                                        >
                                            <span className="font-semibold">{option}</span>
                                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${profile[steps[step-1].field as keyof UserProfile] === option ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 group-hover:border-indigo-300'}`}>
                                                {profile[steps[step-1].field as keyof UserProfile] === option && <Check className="w-4 h-4" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="step-4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <div className="inline-flex items-center justify-center p-3 bg-amber-50 text-amber-600 rounded-2xl mb-4">
                                        <Key className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Final Step: AI Core</h2>
                                    <p className="text-slate-500 text-lg leading-relaxed">
                                        This app uses the Gemini AI to create one-of-a-kind, personalized lessons for you. 
                                        To ensure a reliable experience, please provide your own <strong>Gemini API Key</strong>.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-4">
                                        <div className="shrink-0 text-amber-500">
                                            <HelpCircle className="w-5 h-5 mt-0.5" />
                                        </div>
                                        <div className="text-sm text-slate-600 leading-relaxed">
                                            Lessons are generated uniquely based on your OS (<strong>{profile.os}</strong>) and editor (<strong>{profile.editors}</strong>). For example, we'll teach you how to compile specifically in your environment.
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Your Gemini API Key</label>
                                        <input 
                                            type="password"
                                            placeholder="Paste key here (optional, can add later)"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                                        />
                                        <p className="mt-2 text-xs text-slate-400">
                                            Get one for free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline">AI Studio</a>.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-12 flex items-center justify-between gap-4">
                        <button 
                            onClick={() => step > 1 && setStep(step - 1)}
                            className={`px-6 py-3 text-slate-400 font-medium hover:text-slate-600 transition-colors ${step === 1 ? 'invisible' : ''}`}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!isStepValid()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2 group active:scale-95"
                        >
                            {step < 4 ? 'Continue' : 'Start My Journey'}
                            {step < 4 ? <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <Rocket className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
