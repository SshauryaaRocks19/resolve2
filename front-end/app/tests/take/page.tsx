'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { CALCULUS_QUESTIONS } from '@/lib/questions';
import Link from 'next/link';

export default function TakeTestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic') || "General";

    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({}); // qId -> optionIndex
    const [timePerQuestion, setTimePerQuestion] = useState<Record<number, number>>({}); // qId -> ms
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Timer Ref
    const questionStartRef = useRef(Date.now());

    // Effect to handle question change timing
    useEffect(() => {
        questionStartRef.current = Date.now();
    }, [currentIndex]);

    const handleAnswer = (optionIndex: number) => {
        const now = Date.now();
        const duration = now - questionStartRef.current;

        // Accumulate time (in case they revisit, though here we just go fwd/back)
        setTimePerQuestion(prev => ({
            ...prev,
            [CALCULUS_QUESTIONS[currentIndex].id]: (prev[CALCULUS_QUESTIONS[currentIndex].id] || 0) + duration
        }));

        setAnswers(prev => ({
            ...prev,
            [CALCULUS_QUESTIONS[currentIndex].id]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentIndex < CALCULUS_QUESTIONS.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);

        const results = {
            answers,
            times: timePerQuestion,
            topic
        };

        localStorage.setItem('lastQuizResults', JSON.stringify(results));
        router.push('/tests/results');
    };

    const currentQ = CALCULUS_QUESTIONS[currentIndex];
    const progress = ((currentIndex) / CALCULUS_QUESTIONS.length) * 100;

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
                    <span className="font-bold tracking-wide uppercase text-sm opacity-60">
                        {topic} Test
                    </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Live</span>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-gray-100 dark:bg-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-blue-600 dark:bg-blue-500"
                />
            </div>

            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-10">

                {/* Question Header */}
                <div className="flex justify-between items-end mb-8">
                    <h1 className="text-4xl font-bold">
                        Question {currentIndex + 1}
                        <span className="text-2xl opacity-40 ml-2">/ {CALCULUS_QUESTIONS.length}</span>
                    </h1>
                </div>

                {/* Question Card */}
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${currentQ.difficulty === 'Hard' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                                currentQ.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' :
                                    'bg-green-100 text-green-600 dark:bg-green-900/30'
                            }`}>
                            {currentQ.difficulty}
                        </span>
                        {currentQ.isConceptual && (
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                                <Lightbulb className="w-3 h-3" />
                                Deep Concept
                            </span>
                        )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-medium leading-relaxed mb-12">
                        {currentQ.text}
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {currentQ.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className={`p-6 rounded-xl border-2 text-left text-lg transition-all ${answers[currentQ.id] === idx
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                                        : 'border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${answers[currentQ.id] === idx
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'text-gray-400 border-gray-300 dark:border-white/20'
                                        }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="font-sans text-xl">{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                </motion.div>

                {/* Footer */}
                <div className="mt-12 flex justify-end">
                    <Button
                        size="lg"
                        onClick={handleNext}
                        disabled={answers[currentQ.id] === undefined}
                        className="text-lg px-8 h-14 rounded-full"
                    >
                        {currentIndex === CALCULUS_QUESTIONS.length - 1 ? (isSubmitting ? "Submitting..." : "Submit Test") : "Next Question"}
                        {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
                    </Button>
                </div>

            </div>
        </div>
    );
}
