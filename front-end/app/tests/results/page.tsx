'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CALCULUS_QUESTIONS } from '@/lib/questions';

export default function TestResultsPage() {
    const [results, setResults] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('lastQuizResults');
        if (stored) {
            const data = JSON.parse(stored);
            analyzeResults(data);
        }
    }, []);

    const analyzeResults = (data: any) => {
        let correctCount = 0;
        let detailedBreakdown: any[] = [];
        let specificWeaknesses: string[] = [];

        CALCULUS_QUESTIONS.forEach(q => {
            const userAnswer = data.answers[q.id];
            const timeSpent = data.times[q.id] || 0; // ms
            const isCorrect = userAnswer === q.correct;

            if (isCorrect) correctCount++;
            else {
                specificWeaknesses.push(q.conceptTag);
            }

            detailedBreakdown.push({
                id: q.id,
                text: q.text,
                isCorrect,
                timeSpent,
                concept: q.conceptTag,
                difficulty: q.difficulty,
                userOption: q.options[userAnswer],
                correctOption: q.options[q.correct],
                explanation: q.explanation
            });
        });

        setResults(data);
        setAnalysis({
            score: correctCount,
            total: CALCULUS_QUESTIONS.length,
            breakdown: detailedBreakdown,
            weaknesses: specificWeaknesses
        });
    };

    if (!analysis) return <div className="min-h-screen flex items-center justify-center font-serif text-xl">Generatng Precision Analysis...</div>;

    const percentage = Math.round((analysis.score / analysis.total) * 100);

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500 font-serif">

            {/* Header */}
            <header className="border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6">
                    <Link href="/tests">
                        <Button variant="ghost" size="icon" className="hover:bg-black/5 dark:hover:bg-white/10">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-wide">Analysis Report</h1>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-12 space-y-20">

                {/* 1. Big Score Section */}
                <section className="text-center space-y-6">
                    <p className="text-lg uppercase tracking-widest opacity-60">Calculus • Deep Concept Review</p>
                    <div className="text-[10rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-black to-gray-500 dark:from-white dark:to-gray-600">
                        {analysis.score}/{analysis.total}
                    </div>
                    <p className="text-2xl md:text-3xl font-medium max-w-2xl mx-auto leading-relaxed">
                        {percentage >= 80 ? "Excellent. You demonstrate strong command over fundamental definitions and calculations." :
                            percentage >= 60 ? "Good proficiency, but specific theoretical gaps in limit definitions need attention." :
                                "Significant foundational gaps detected. Focus on definitions before applications."}
                    </p>
                </section>

                <hr className="border-black/10 dark:border-white/10" />

                {/* 2. Precision Weakness Analysis (To The Dot) */}
                {analysis.weaknesses.length > 0 && (
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h2 className="text-4xl font-bold">Concept Gaps Detected</h2>
                        </div>

                        <div className="space-y-4">
                            {analysis.weaknesses.map((w: string, i: number) => (
                                <div key={i} className="flex items-start gap-6 p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 hover:bg-red-100/50 transition-colors">
                                    <span className="text-4xl font-bold text-red-200 dark:text-red-900/50">0{i + 1}</span>
                                    <div>
                                        <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">{w}</h3>
                                        <p className="text-lg text-red-700 dark:text-red-300 opacity-80">
                                            This is a critical failure point. Review the associated theoretical definition immediately.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Question-wise Breakdown (Space Efficient) */}
                <section className="space-y-8">
                    <h2 className="text-4xl font-bold">Detailed Performance Breakdown</h2>

                    <div className="w-full text-left border-collapse font-sans">
                        {/* Headers */}
                        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-black/10 dark:border-white/10 text-sm font-bold uppercase tracking-wider opacity-50">
                            <div className="col-span-1">#</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2">Time</div>
                            <div className="col-span-8">Question & Analysis</div>
                        </div>

                        {/* Rows */}
                        {analysis.breakdown.map((item: any, i: number) => (
                            <div key={i} className={`grid grid-cols-12 gap-4 py-6 border-b border-black/5 dark:border-white/5 items-start group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors px-2 -mx-2 rounded-lg ${!item.isCorrect ? 'bg-red-50/30 dark:bg-red-900/5' : ''
                                }`}>
                                <div className="col-span-1 text-xl font-bold opacity-30">{i + 1}</div>

                                <div className="col-span-1">
                                    {item.isCorrect ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-500" />
                                    )}
                                </div>

                                <div className="col-span-2 flex items-center gap-2 font-mono text-lg opacity-70">
                                    <Clock className="w-4 h-4" />
                                    {(item.timeSpent / 1000).toFixed(1)}s
                                </div>

                                <div className="col-span-8 space-y-3">
                                    <p className="text-xl font-medium leading-relaxed">{item.text}</p>

                                    {!item.isCorrect && (
                                        <div className="space-y-2">
                                            <div className="flex gap-4 text-sm">
                                                <span className="text-red-600 dark:text-red-400 font-bold">You selected: {item.userOption}</span>
                                                <span className="text-green-600 dark:text-green-400 font-bold">Correct: {item.correctOption}</span>
                                            </div>
                                            <div className="p-4 bg-black/5 dark:bg-white/10 rounded-lg text-base">
                                                <span className="font-bold mr-2">Explanation:</span>
                                                {item.explanation}
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-bold">
                                                <Lightbulb className="w-4 h-4" />
                                                Weakness: {item.concept}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex justify-center pt-10 pb-20">
                    <Link href="/tests">
                        <Button size="lg" className="rounded-full px-12 h-16 text-xl">
                            Return to Dashboard
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
