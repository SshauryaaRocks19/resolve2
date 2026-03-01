'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle2, XCircle, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import MathText from '@/components/MathText';
import type { GeneratedQuestion, TestSession } from '@/lib/questions';

export default function TestResultsPage() {
    const { user } = useUser();
    const [analysis, setAnalysis] = useState<any>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [evaluated, setEvaluated] = useState(false);
    const [topic, setTopic] = useState('');
    const evaluatorCalledRef = useRef(false);

    useEffect(() => {
        const stored = localStorage.getItem('lastQuizResults');
        const sessionStored = sessionStorage.getItem('testSession');
        if (stored && sessionStored) {
            const data = JSON.parse(stored);
            const session: TestSession = JSON.parse(sessionStored);
            setTopic(session.topic);
            analyzeResults(data, session.questions, session.topic);
        }
    }, []);

    const analyzeResults = (data: any, questions: GeneratedQuestion[], testTopic: string) => {
        let correctCount = 0;
        let detailedBreakdown: any[] = [];
        let specificWeaknesses: string[] = [];
        let wrongAnswers: any[] = [];

        questions.forEach((q, index) => {
            const userAnswer = data.answers[index];
            const timeSpent = data.times[index] || 0;
            const isCorrect = userAnswer === q.correct_index;

            if (isCorrect) {
                correctCount++;
            } else {
                specificWeaknesses.push(q.diagnosed_weakness);
                wrongAnswers.push({
                    question: q.question,
                    userAnswer: q.options[userAnswer],
                    correctAnswer: q.options[q.correct_index],
                    diagnosed_weakness: q.diagnosed_weakness,
                });
            }

            detailedBreakdown.push({
                id: index,
                text: q.question,
                isCorrect,
                timeSpent,
                concept: q.diagnosed_weakness,
                userOption: q.options[userAnswer],
                correctOption: q.options[q.correct_index],
                explanation: q.conceptual_breakdown,
            });
        });

        setAnalysis({
            score: correctCount,
            total: questions.length,
            breakdown: detailedBreakdown,
            weaknesses: specificWeaknesses,
            wrongAnswers,
            topic: testTopic,
        });
    };

    // Call evaluator + save progress once analysis is ready
    useEffect(() => {
        if (!analysis || evaluatorCalledRef.current) return;
        evaluatorCalledRef.current = true;

        const callEvaluatorAndSave = async () => {
            setEvaluating(true);
            const userId = user?.id ?? 'anonymous';

            try {
                // 1. Call evaluator for wrong answers (if any)
                if (analysis.wrongAnswers.length > 0) {
                    const evalRes = await fetch('/api/evaluator', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId,
                            topic: analysis.topic,
                            wrongAnswers: analysis.wrongAnswers,
                        }),
                    });
                    console.log('Evaluator response:', evalRes.status, await evalRes.text());
                }

                // 2. Save test result to Supabase
                const saveRes = await fetch('/api/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        topic: analysis.topic,
                        score: analysis.score,
                        total: analysis.total,
                        weaknesses: analysis.weaknesses,
                    }),
                });
                const saveData = await saveRes.json();
                console.log('Progress save response:', saveRes.status, saveData);

                if (saveData.success) {
                    setEvaluated(true);
                } else {
                    console.error('Progress save failed:', saveData.error);
                }
            } catch (err) {
                console.error('Evaluator/Save error:', err);
            } finally {
                setEvaluating(false);
            }
        };

        callEvaluatorAndSave();
    }, [analysis, user]);

    if (!analysis) {
        return (
            <div className="min-h-screen flex items-center justify-center font-serif text-xl bg-white dark:bg-[#020617] text-black dark:text-white">
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                Generating Precision Analysis...
            </div>
        );
    }

    const percentage = Math.round((analysis.score / analysis.total) * 100);

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500 font-serif">

            <header className="border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6">
                    <Link href="/tests">
                        <Button variant="ghost" size="icon" className="hover:bg-black/5 dark:hover:bg-white/10">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold tracking-wide">Analysis Report</h1>
                        {evaluating && (
                            <span className="flex items-center gap-2 text-sm text-blue-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving weaknesses...
                            </span>
                        )}
                        {evaluated && (
                            <span className="flex items-center gap-2 text-sm text-green-500">
                                <CheckCircle2 className="w-4 h-4" />
                                Weaknesses stored
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-12 space-y-20">

                {/* Big Score */}
                <section className="text-center space-y-6">
                    <p className="text-lg uppercase tracking-widest opacity-60">{topic} • Deep Concept Review</p>
                    <div className="text-[10rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-black to-gray-500 dark:from-white dark:to-gray-600">
                        {analysis.score}/{analysis.total}
                    </div>
                    <p className="text-2xl md:text-3xl font-medium max-w-2xl mx-auto leading-relaxed">
                        {percentage >= 80
                            ? `Excellent. You demonstrate strong command over ${topic} fundamentals and applications.`
                            : percentage >= 60
                                ? `Good proficiency in ${topic}, but specific conceptual gaps need targeted attention.`
                                : `Significant foundational gaps detected in ${topic}. Focus on core definitions before applications.`}
                    </p>
                </section>

                <hr className="border-black/10 dark:border-white/10" />

                {/* Weakness Analysis */}
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
                                    <span className="text-4xl font-bold text-red-200 dark:text-red-900/50">{String(i + 1).padStart(2, '0')}</span>
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

                {/* Question-wise Breakdown */}
                <section className="space-y-8">
                    <h2 className="text-4xl font-bold">Detailed Performance Breakdown</h2>
                    <div className="w-full text-left border-collapse font-sans">
                        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-black/10 dark:border-white/10 text-sm font-bold uppercase tracking-wider opacity-50">
                            <div className="col-span-1">#</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2">Time</div>
                            <div className="col-span-8">Question & Analysis</div>
                        </div>

                        {analysis.breakdown.map((item: any, i: number) => (
                            <div key={i} className={`grid grid-cols-12 gap-4 py-6 border-b border-black/5 dark:border-white/5 items-start group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors px-2 -mx-2 rounded-lg ${!item.isCorrect ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                                <div className="col-span-1 text-xl font-bold opacity-30">{i + 1}</div>
                                <div className="col-span-1">
                                    {item.isCorrect ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                                </div>
                                <div className="col-span-2 flex items-center gap-2 font-mono text-lg opacity-70">
                                    <Clock className="w-4 h-4" />
                                    {(item.timeSpent / 1000).toFixed(1)}s
                                </div>
                                <div className="col-span-8 space-y-3">
                                    <p className="text-xl font-medium leading-relaxed">
                                        <MathText text={item.text} />
                                    </p>
                                    {!item.isCorrect && (
                                        <div className="space-y-2">
                                            <div className="flex gap-4 text-sm flex-wrap">
                                                <span className="text-red-600 dark:text-red-400 font-bold">
                                                    You selected: <MathText text={item.userOption} />
                                                </span>
                                                <span className="text-green-600 dark:text-green-400 font-bold">
                                                    Correct: <MathText text={item.correctOption} />
                                                </span>
                                            </div>
                                            <div className="p-4 bg-black/5 dark:bg-white/10 rounded-lg text-base">
                                                <span className="font-bold mr-2">Explanation:</span>
                                                <MathText text={item.explanation} />
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
                        <Button size="lg" className="rounded-full px-12 h-16 text-xl">Return to Dashboard</Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
