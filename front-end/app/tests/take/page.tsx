'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Lightbulb, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MathText from '@/components/MathText';
import type { GeneratedQuestion, TestSession, TestResult } from '@/lib/questions';

// Buzzer using Web Audio API
function playBuzzer(urgency: 'low' | 'medium' | 'high') {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (urgency === 'high') {
            osc.frequency.value = 880;
            gain.gain.value = 0.4;
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
            setTimeout(() => {
                const ctx2 = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc2 = ctx2.createOscillator();
                const gain2 = ctx2.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx2.destination);
                osc2.frequency.value = 880;
                gain2.gain.value = 0.4;
                osc2.start();
                osc2.stop(ctx2.currentTime + 0.3);
            }, 400);
        } else if (urgency === 'medium') {
            osc.frequency.value = 660;
            gain.gain.value = 0.3;
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        } else {
            osc.frequency.value = 440;
            gain.gain.value = 0.2;
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        }
    } catch (e) {
        // Audio not available
    }
}

export default function TakeTestPage() {
    const router = useRouter();

    const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
    const [topic, setTopic] = useState('');
    const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [timePerQuestion, setTimePerQuestion] = useState<Record<number, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const buzzedRef = useRef<Set<string>>(new Set());
    const questionStartRef = useRef(Date.now());

    useEffect(() => {
        const stored = sessionStorage.getItem('testSession');
        if (!stored) { router.push('/tests'); return; }
        try {
            const session: TestSession = JSON.parse(stored);
            setQuestions(session.questions);
            setTopic(session.topic);
            setTimeLimitMinutes(session.timeLimitMinutes);
            if (session.timeLimitMinutes) setSecondsRemaining(session.timeLimitMinutes * 60);
            setLoaded(true);
        } catch { router.push('/tests'); }
    }, [router]);

    const handleSubmitRef = useRef<() => void>(() => { });

    const handleSubmit = useCallback(() => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const results: TestResult = { answers, times: timePerQuestion, topic };
        localStorage.setItem('lastQuizResults', JSON.stringify(results));
        router.push('/tests/results');
    }, [answers, timePerQuestion, topic, router, isSubmitting]);

    useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);

    // Countdown timer
    useEffect(() => {
        if (!loaded) return;
        const interval = setInterval(() => {
            if (timeLimitMinutes !== null) {
                setSecondsRemaining(prev => {
                    if (prev === null) return null;
                    const next = prev - 1;
                    if (next <= 0) { clearInterval(interval); handleSubmitRef.current(); return 0; }
                    const totalSeconds = timeLimitMinutes * 60;
                    const pctRemaining = next / totalSeconds;
                    if (pctRemaining <= 0.10 && !buzzedRef.current.has('10')) { buzzedRef.current.add('10'); playBuzzer('high'); }
                    else if (pctRemaining <= 0.25 && !buzzedRef.current.has('25')) { buzzedRef.current.add('25'); playBuzzer('medium'); }
                    else if (pctRemaining <= 0.50 && !buzzedRef.current.has('50')) { buzzedRef.current.add('50'); playBuzzer('low'); }
                    return next;
                });
            } else {
                setElapsedSeconds(prev => prev + 1);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [loaded, timeLimitMinutes]);

    useEffect(() => { questionStartRef.current = Date.now(); }, [currentIndex]);

    const handleAnswer = (optionIndex: number) => {
        const duration = Date.now() - questionStartRef.current;
        setTimePerQuestion(prev => ({ ...prev, [currentIndex]: (prev[currentIndex] || 0) + duration }));
        setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
        else handleSubmit();
    };

    if (!loaded || questions.length === 0) {
        return <div className="min-h-screen flex items-center justify-center font-serif text-xl text-black dark:text-white bg-white dark:bg-[#020617]">Loading test...</div>;
    }

    const currentQ = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;

    const formatTime = (totalSec: number) => {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    let timerColorClass = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    if (timeLimitMinutes !== null && secondsRemaining !== null) {
        const pct = secondsRemaining / (timeLimitMinutes * 60);
        if (pct <= 0.10) timerColorClass = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 animate-pulse';
        else if (pct <= 0.25) timerColorClass = 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
    }

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500 flex flex-col font-serif">

            {/* Top Bar */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/tests">
                        <Button variant="ghost" size="icon" className="hover:bg-black/5 dark:hover:bg-white/10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <span className="font-bold tracking-wide uppercase text-sm opacity-60">{topic} Test</span>
                </div>

                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold font-mono ${timerColorClass}`}>
                    {timeLimitMinutes !== null && secondsRemaining !== null ? (
                        <>
                            {secondsRemaining <= (timeLimitMinutes * 60 * 0.10) && <AlertTriangle className="w-4 h-4" />}
                            <Clock className="w-4 h-4" />
                            <span className="text-lg">{formatTime(secondsRemaining)}</span>
                        </>
                    ) : (
                        <>
                            <Clock className="w-4 h-4" />
                            <span className="text-lg">{formatTime(elapsedSeconds)}</span>
                        </>
                    )}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-gray-100 dark:bg-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-600 dark:bg-blue-500" />
            </div>

            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-10">

                <div className="flex justify-between items-end mb-8">
                    <h1 className="text-4xl font-bold">
                        Question {currentIndex + 1}
                        <span className="text-2xl opacity-40 ml-2">/ {questions.length}</span>
                    </h1>
                </div>

                <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">

                    <div className="flex items-center gap-3 mb-8">
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                            <Lightbulb className="w-3 h-3" />
                            {currentQ.diagnosed_weakness}
                        </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-medium leading-relaxed mb-12">
                        <MathText text={currentQ.question} />
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {currentQ.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className={`p-6 rounded-xl border-2 text-left text-lg transition-all ${answers[currentIndex] === idx
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                                    : 'border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${answers[currentIndex] === idx
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'text-gray-400 border-gray-300 dark:border-white/20'
                                        }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="font-sans text-xl">
                                        <MathText text={option} />
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                </motion.div>

                <div className="mt-12 flex justify-end">
                    <Button size="lg" onClick={handleNext} disabled={answers[currentIndex] === undefined} className="text-lg px-8 h-14 rounded-full">
                        {currentIndex === questions.length - 1 ? (isSubmitting ? "Submitting..." : "Submit Test") : "Next Question"}
                        {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
                    </Button>
                </div>

            </div>
        </div>
    );
}
